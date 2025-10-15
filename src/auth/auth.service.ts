import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      return user;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user account is active
    if (user.status !== 'ACTIVE') {
      this.logger.warn(`Login attempt for inactive user: ${user.email} (status: ${user.status})`);
      throw new UnauthorizedException('User account is not active');
    }

    // Fetch user with profile and roles for JWT payload
    const userWithProfile = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        full_name: true,
        isAdmin: true,
        profile: {
          select: { companyId: true },
        },
        userRoles: {
          select: {
            role: { select: { name: true } },
          },
        },
      },
    });

    if (!userWithProfile) {
      throw new UnauthorizedException('User data not found');
    }

    const companyId = userWithProfile.profile?.companyId || null;
    const scope = companyId !== null ? 'COMPANY' : 'GLOBAL';
    const roles = userWithProfile.userRoles.map((ur) => ur.role.name);
    const aclVersion = 1; // TODO: make dynamic

    // JWT payload with enhanced fields
    const payload = {
      email: userWithProfile.email,
      sub: userWithProfile.id,
      companyId,
      scope,
      roles,
      aclVersion,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        'refresh-secret',
      expiresIn: '7d',
    });

    // Hash and save refresh token
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: hashedRefreshToken,
        last_login: new Date(),
      },
    });

    this.logger.log(
      `User ${user.email} logged in successfully (scope: ${scope}, roles: ${roles.join(', ')})`,
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: userWithProfile.id,
        email: userWithProfile.email,
        full_name: userWithProfile.full_name,
        isAdmin: userWithProfile.isAdmin,
      },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          'refresh-secret',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          refreshToken: true,
          profile: {
            select: { companyId: true },
          },
          userRoles: {
            select: {
              role: { select: { name: true } },
            },
          },
        },
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isRefreshTokenValid = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );
      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Rebuild JWT payload with current user data
      const companyId = user.profile?.companyId || null;
      const scope = companyId !== null ? 'COMPANY' : 'GLOBAL';
      const roles = user.userRoles.map((ur) => ur.role.name);
      const aclVersion = 1; // TODO: make dynamic

      const newPayload = {
        email: user.email,
        sub: user.id,
        companyId,
        scope,
        roles,
        aclVersion,
      };

      const newAccessToken = this.jwtService.sign(newPayload);
      const newRefreshToken = this.jwtService.sign(newPayload, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          'refresh-secret',
        expiresIn: '7d',
      });

      // Update refresh token in database
      const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: hashedRefreshToken },
      });

      this.logger.log(`Tokens refreshed for user ${user.email}`);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      this.logger.error(`Refresh token validation failed: ${error.message}`);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    this.logger.log(`User with ID ${userId} logged out`);
  }

  async getCurrentUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        full_name: true,
        isAdmin: true,
        status: true,
        registered_at: true,
        last_login: true,
        profile: {
          select: {
            avatar: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { profile, ...userData } = user;
    return {
      ...userData,
      avatar: profile?.avatar || null,
    };
  }

  async getUserPermissions(userId: number) {
    this.logger.log(`Fetching permissions for user ${userId}`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        profile: {
          select: {
            companyId: true,
          },
        },
        userRoles: {
          select: {
            role: {
              select: {
                name: true,
                rolePermissions: {
                  select: {
                    permission: {
                      select: { name: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Extract companyId from profile
    const companyId = user.profile?.companyId || null;

    // Determine scope: COMPANY if user has companyId, otherwise GLOBAL
    const scope = companyId !== null ? 'COMPANY' : 'GLOBAL';

    // Extract roles
    const roles = user.userRoles.map((ur) => ur.role.name);

    // Extract unique permissions
    const permissionsSet = new Set<string>();
    for (const ur of user.userRoles) {
      for (const rp of ur.role.rolePermissions) {
        if (rp.permission?.name) permissionsSet.add(rp.permission.name);
      }
    }
    const permissions = Array.from(permissionsSet).sort();

    // ACL version (for now, hardcoded to 1; can be dynamic later)
    // In production, this would be incremented when roles/permissions change
    const aclVersion = 1;

    this.logger.log(
      `User ${userId} has ${permissions.length} permissions, scope: ${scope}, roles: ${roles.join(', ')}`,
    );

    return {
      userId: user.id,
      companyId,
      scope,
      roles,
      permissions,
      aclVersion,
    };
  }
}
