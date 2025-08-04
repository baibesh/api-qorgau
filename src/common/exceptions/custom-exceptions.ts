import { HttpException } from '@nestjs/common';
import { ERROR_CODES, ErrorCode } from './error-codes';

export class CustomException extends HttpException {
  constructor(errorCode: ErrorCode) {
    const error = ERROR_CODES[errorCode];
    super(
      {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
      },
      error.statusCode,
    );
  }
}

// Region exceptions
export class RegionNotFoundException extends CustomException {
  constructor() {
    super('REGION_NOT_FOUND');
  }
}

export class RegionAlreadyExistsException extends CustomException {
  constructor() {
    super('REGION_ALREADY_EXISTS');
  }
}

export class RegionValidationException extends CustomException {
  constructor() {
    super('REGION_VALIDATION_ERROR');
  }
}

// ProjectStatus exceptions
export class ProjectStatusNotFoundException extends CustomException {
  constructor() {
    super('PROJECT_STATUS_NOT_FOUND');
  }
}

export class ProjectStatusAlreadyExistsException extends CustomException {
  constructor() {
    super('PROJECT_STATUS_ALREADY_EXISTS');
  }
}

export class ProjectStatusValidationException extends CustomException {
  constructor() {
    super('PROJECT_STATUS_VALIDATION_ERROR');
  }
}

export class ProjectTypeNotFoundException extends CustomException {
  constructor() {
    super('PROJECT_TYPE_NOT_FOUND');
  }
}

export class ProjectTypeAlreadyExistsException extends CustomException {
  constructor() {
    super('PROJECT_TYPE_ALREADY_EXISTS');
  }
}

export class ProjectTypeValidationException extends CustomException {
  constructor() {
    super('PROJECT_TYPE_VALIDATION_ERROR');
  }
}

// Company exceptions
export class CompanyNotFoundException extends CustomException {
  constructor() {
    super('COMPANY_NOT_FOUND');
  }
}

export class CompanyAlreadyExistsException extends CustomException {
  constructor() {
    super('COMPANY_ALREADY_EXISTS');
  }
}

export class CompanyValidationException extends CustomException {
  constructor() {
    super('COMPANY_VALIDATION_ERROR');
  }
}
