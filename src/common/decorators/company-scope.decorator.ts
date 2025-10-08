import { SetMetadata } from '@nestjs/common';

export const COMPANY_SCOPE_KEY = 'companyScope';

/**
 * Decorator to enforce company scope validation
 * When applied, the guard will check that the user's companyId matches the :id param in the route
 * @param paramName - Name of the route parameter containing the company ID (default: 'id')
 * @example @CompanyScope() // uses default 'id' param
 * @example @CompanyScope('companyId') // uses 'companyId' param
 */
export const CompanyScope = (paramName: string = 'id') =>
  SetMetadata(COMPANY_SCOPE_KEY, paramName);
