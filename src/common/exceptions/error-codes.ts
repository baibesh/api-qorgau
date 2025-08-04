export const ERROR_CODES = {
  // Region errors
  REGION_NOT_FOUND: {
    code: 'REGION_NOT_FOUND',
    message: 'Region not found',
    statusCode: 404,
  },
  REGION_ALREADY_EXISTS: {
    code: 'REGION_ALREADY_EXISTS',
    message: 'Region with this name already exists',
    statusCode: 409,
  },
  REGION_VALIDATION_ERROR: {
    code: 'REGION_VALIDATION_ERROR',
    message: 'Region validation failed',
    statusCode: 400,
  },

  // ProjectStatus errors
  PROJECT_STATUS_NOT_FOUND: {
    code: 'PROJECT_STATUS_NOT_FOUND',
    message: 'Project status not found',
    statusCode: 404,
  },
  PROJECT_STATUS_ALREADY_EXISTS: {
    code: 'PROJECT_STATUS_ALREADY_EXISTS',
    message: 'Project status with this name already exists',
    statusCode: 409,
  },
  PROJECT_STATUS_VALIDATION_ERROR: {
    code: 'PROJECT_STATUS_VALIDATION_ERROR',
    message: 'Project status validation failed',
    statusCode: 400,
  },

  // ProjectType errors
  PROJECT_TYPE_NOT_FOUND: {
    code: 'PROJECT_TYPE_NOT_FOUND',
    message: 'Project type not found',
    statusCode: 404,
  },
  PROJECT_TYPE_ALREADY_EXISTS: {
    code: 'PROJECT_TYPE_ALREADY_EXISTS',
    message: 'Project type with this name already exists',
    statusCode: 409,
  },
  PROJECT_TYPE_VALIDATION_ERROR: {
    code: 'PROJECT_TYPE_VALIDATION_ERROR',
    message: 'Project type validation failed',
    statusCode: 400,
  },

  // Company errors
  COMPANY_NOT_FOUND: {
    code: 'COMPANY_NOT_FOUND',
    message: 'Company not found',
    statusCode: 404,
  },
  COMPANY_ALREADY_EXISTS: {
    code: 'COMPANY_ALREADY_EXISTS',
    message: 'Company with this name already exists',
    statusCode: 409,
  },
  COMPANY_VALIDATION_ERROR: {
    code: 'COMPANY_VALIDATION_ERROR',
    message: 'Company validation failed',
    statusCode: 400,
  },

  // General errors
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error',
    statusCode: 500,
  },
  BAD_REQUEST: {
    code: 'BAD_REQUEST',
    message: 'Bad request',
    statusCode: 400,
  },
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;