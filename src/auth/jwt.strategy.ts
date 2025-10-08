import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: Request) => {
          const token = request?.cookies?.access_token;
          console.log('Cookie extraction - cookies:', request?.cookies);
          console.log('Cookie extraction - access_token:', token);
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    this.logger.debug(
      `JWT validation started for payload: ${JSON.stringify(payload)}`,
    );

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        full_name: true,
        isAdmin: true,
        status: true,
      },
    });

    this.logger.debug(`User found: ${JSON.stringify(user)}`);

    if (!user) {
      this.logger.error('User not found during JWT validation');
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== 'ACTIVE') {
      this.logger.error(`User account is not active: ${user.status}`);
      throw new UnauthorizedException('User account is not active');
    }

    // Return enhanced user object with JWT payload data
    const result = {
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      companyId: payload.companyId || null,
      scope: payload.scope || 'GLOBAL',
      roles: payload.roles || [],
      aclVersion: payload.aclVersion || 1,
    };

    this.logger.debug(`JWT validation successful: ${JSON.stringify(result)}`);
    return result;
  }
}