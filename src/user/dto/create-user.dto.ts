import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsEnum,
  IsInt,
  IsArray,
  ArrayUnique,
  IsBoolean,
} from 'class-validator';
import { Expose, Transform } from 'class-transformer';
import { UserStatus } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+77771234567',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({
    description: 'User status',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({
    description: 'Region ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return Number(value);
  })
  region_id?: number;

  @ApiProperty({
    description: 'Is admin user',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return Boolean(value);
  })
  isAdmin?: boolean;

  @ApiProperty({
    description: 'Role IDs to assign to the user',
    example: [1, 2],
    required: false,
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  // each: true validation for IsInt is applied per element
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  @IsInt({ each: true })
  @Expose({ name: 'role_ids' })
  @Transform(({ value, obj }) => {
    // Accept both role_ids (snake_case alias) and roleIds (camelCase)
    const src = obj as Record<string, unknown> | undefined;
    const aliasUnknown: unknown = src?.['role_ids'];
    const val = Array.isArray(aliasUnknown) ? aliasUnknown : value;
    if (Array.isArray(val)) {
      return val.map((v: unknown) => Number(v as any));
    }
    // If not provided, leave as undefined so it is optional
    return undefined;
  })
  roleIds?: number[];

}
