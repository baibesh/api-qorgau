import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to set required permissions for a route
 * @param permissions - Array of permission names required to access the route
 * @example @Permissions('company-users:list', 'company-users:read')
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
