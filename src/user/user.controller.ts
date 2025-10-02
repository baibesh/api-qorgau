import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { UserService, UserFilters } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UserStatus } from '@prisma/client';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password', 'full_name'],
      properties: {
        email: { type: 'string', format: 'email', example: 'user@example.com' },
        password: { type: 'string', example: 'password123' },
        full_name: { type: 'string', example: 'John Doe' },
        phone: { type: 'string', example: '+77771234567' },
        status: {
          type: 'string',
          enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'],
        },
        region_id: { type: 'number', example: 1 },
        isAdmin: { type: 'boolean', example: false },
        role_ids: { type: 'array', items: { type: 'number' }, example: [1, 2] },
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = join('storage', 'avatars');
          const absolute = join(process.cwd(), uploadDir);
          if (!existsSync(absolute)) {
            mkdirSync(absolute, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const unique = randomUUID();
          const ext = extname(file.originalname);
          cb(null, `${unique}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('Only image files are allowed'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    return this.userService.create(createUserDto, avatar);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with optional filtering' })
  @ApiQuery({ name: 'status', enum: UserStatus, required: false })
  @ApiQuery({ name: 'region_id', type: Number, required: false })
  @ApiQuery({ name: 'email', type: String, required: false })
  @ApiQuery({ name: 'phone', type: String, required: false })
  @ApiResponse({
    status: 200,
    description: 'List of users',
    type: [UserResponseDto],
  })
  findAll(
    @Query('status') status?: UserStatus,
    @Query('region_id', new ParseIntPipe({ optional: true }))
    region_id?: number,
    @Query('email') email?: string,
    @Query('phone') phone?: string,
  ) {
    const filters: UserFilters = {};

    if (status) filters.status = status;
    if (region_id) filters.region_id = region_id;
    if (email) filters.email = email;
    if (phone) filters.phone = phone;

    return this.userService.findAll(filters);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistics for users, projects, roles, companies' })
  @ApiResponse({
    status: 200,
    description: 'Stats payload',
    schema: {
      type: 'object',
      properties: {
        users: { type: 'number' },
        projects: { type: 'number' },
        roles: { type: 'number' },
        companies: { type: 'number' },
      },
    },
  })
  getStats() {
    return this.userService.getStats();
  }

  @Get('search')
  @ApiOperation({
    summary: 'Universal search by email, project name, company name',
  })
  @ApiQuery({ name: 'q', required: true, description: 'Search term' })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    schema: {
      type: 'object',
      properties: {
        users: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              email: { type: 'string' },
              full_name: { type: 'string' },
              phone: { type: 'string' },
            },
          },
        },
        projects: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              code: { type: 'string' },
              companyId: { type: 'number' },
            },
          },
        },
        companies: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              inn: { type: 'string' },
            },
          },
        },
      },
    },
  })
  search(@Query('q') q: string) {
    return this.userService.search(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', example: 'user@example.com' },
        full_name: { type: 'string', example: 'John Doe' },
        phone: { type: 'string', example: '+77771234567' },
        status: {
          type: 'string',
          enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'],
        },
        region_id: { type: 'number', example: 1 },
        isAdmin: { type: 'boolean', example: false },
        role_ids: { type: 'array', items: { type: 'number' }, example: [1, 2] },
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully updated',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = join('storage', 'avatars');
          const absolute = join(process.cwd(), uploadDir);
          if (!existsSync(absolute)) {
            mkdirSync(absolute, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const unique = randomUUID();
          const ext = extname(file.originalname);
          cb(null, `${unique}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('Only image files are allowed'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    return this.userService.update(id, updateUserDto, avatar);
  }

  @Get(':id/avatar')
  @ApiOperation({ summary: 'Get user avatar by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Avatar image',
  })
  @ApiResponse({ status: 404, description: 'Avatar not found' })
  async getAvatar(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    return this.userService.getAvatar(id, res);
  }

  @Get(':id/profile')
  @ApiOperation({ summary: 'Get user profile by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Profile fetched',
    type: UserProfileResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  getProfile(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getProfile(id);
  }

  @Put(':id/profile')
  @ApiOperation({ summary: 'Create or update user profile by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Profile upserted',
    type: UserProfileResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserProfileDto,
  ) {
    return this.userService.updateProfile(id, dto);
  }

  @Post(':id/reset-password')
  @ApiOperation({ summary: 'Reset user password and generate a new one' })
  @ApiResponse({
    status: 200,
    description: 'Password successfully reset',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Password successfully reset',
        },
        newPassword: {
          type: 'string',
          example: 'Abc123def456',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  resetPassword(@Param('id', ParseIntPipe) id: number) {
    return this.userService.resetPassword(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User successfully deleted',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'User successfully deleted',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
