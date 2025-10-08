import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required permissions from route decorator
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      this.logger.warn('User not authenticated');
      throw new ForbiddenException('User not authenticated');
    }

    // Admin bypass
    if (user.isAdmin === true) {
      this.logger.debug(`Admin user ${user.userId} bypassing permission check`);
      return true;
    }

    // Fetch user permissions from database
    const userWithPermissions = await this.prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        userRoles: {
          select: {
            role: {
              select: {
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

    if (!userWithPermissions) {
      this.logger.warn(`User ${user.userId} not found`);
      throw new ForbiddenException('User not found');
    }

    // Extract user permissions
    const userPermissions = new Set<string>();
    for (const ur of userWithPermissions.userRoles) {
      for (const rp of ur.role.rolePermissions) {
        if (rp.permission?.name) {
          userPermissions.add(rp.permission.name);
        }
      }
    }

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.has(permission),
    );

    if (!hasAllPermissions) {
      const missingPermissions = requiredPermissions.filter(
        (p) => !userPermissions.has(p),
      );

      this.logger.warn(
        `User ${user.userId} missing permissions: ${missingPermissions.join(', ')}`,
      );

      throw new ForbiddenException(
        `Missing required permissions: ${missingPermissions.join(', ')}`,
      );
    }

    this.logger.debug(
      `User ${user.userId} has required permissions: ${requiredPermissions.join(', ')}`,
    );

    return true;
  }
}
