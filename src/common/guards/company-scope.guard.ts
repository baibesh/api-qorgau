import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { COMPANY_SCOPE_KEY } from '../decorators/company-scope.decorator';

@Injectable()
export class CompanyScopeGuard implements CanActivate {
  private readonly logger = new Logger(CompanyScopeGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get the parameter name from decorator (default: 'id')
    const paramName = this.reflector.getAllAndOverride<string>(
      COMPANY_SCOPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no @CompanyScope decorator, allow access
    if (!paramName) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const params = request.params;

    if (!user || !user.userId) {
      this.logger.warn('User not authenticated');
      throw new ForbiddenException('User not authenticated');
    }

    // Admin bypass - admins can access any company
    if (user.isAdmin === true) {
      this.logger.debug(
        `Admin user ${user.userId} bypassing company scope check`,
      );
      return true;
    }

    // Get company ID from route params
    const companyIdFromRoute = parseInt(params[paramName], 10);

    if (isNaN(companyIdFromRoute)) {
      this.logger.warn(
        `Invalid company ID in route param '${paramName}': ${params[paramName]}`,
      );
      throw new ForbiddenException('Invalid company ID');
    }

    // Get user's company ID from JWT payload
    const userCompanyId = user.companyId;

    // Users without a company cannot access company-scoped routes
    if (userCompanyId === null || userCompanyId === undefined) {
      this.logger.warn(
        `User ${user.userId} has no company but tried to access company ${companyIdFromRoute}`,
      );
      throw new ForbiddenException(
        'You must be associated with a company to access this resource',
      );
    }

    // Check if user's company matches the route company
    if (userCompanyId !== companyIdFromRoute) {
      this.logger.warn(
        `User ${user.userId} from company ${userCompanyId} tried to access company ${companyIdFromRoute}`,
      );
      throw new ForbiddenException(
        'You can only access resources from your own company',
      );
    }

    this.logger.debug(
      `User ${user.userId} accessing their company ${companyIdFromRoute}`,
    );

    return true;
  }
}
