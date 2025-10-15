import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyResponseDto } from './dto/company-response.dto';
import { AddUserDto } from './dto/add-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { CompanyScopeGuard } from '../common/guards/company-scope.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CompanyScope } from '../common/decorators/company-scope.decorator';

@ApiTags('companies')
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new company' })
  @ApiBody({ type: CreateCompanyDto })
  @ApiResponse({
    status: 201,
    description: 'Company created successfully',
    type: CompanyResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Company with this name or INN already exists',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  create(
    @Body() createCompanyDto: CreateCompanyDto,
    @Req() req: any,
  ): Promise<CompanyResponseDto> {
    return this.companyService.create(createCompanyDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['PROJECT', 'CUSTOMER'],
    description: 'Filter companies by type',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all companies',
    type: [CompanyResponseDto],
  })
  findAll(@Query('type') type?: string): Promise<CompanyResponseDto[]> {
    return this.companyService.findAll(type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a company by ID' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Company ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Company found',
    type: CompanyResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<CompanyResponseDto> {
    return this.companyService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a company' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Company ID',
    example: 1,
  })
  @ApiBody({ type: UpdateCompanyDto })
  @ApiResponse({
    status: 200,
    description: 'Company updated successfully',
    type: CompanyResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Company with this name or INN already exists',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ): Promise<CompanyResponseDto> {
    return this.companyService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a company' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Company ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Company deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.companyService.remove(id);
  }

  @Get(':id/users')
  @UseGuards(JwtAuthGuard, PermissionsGuard, CompanyScopeGuard)
  @Permissions('company-users:list')
  @CompanyScope()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users of a company' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Company ID',
    example: 2,
  })
  @ApiResponse({
    status: 200,
    description: 'List of company users',
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - missing permissions or accessing wrong company',
  })
  getCompanyUsers(@Param('id', ParseIntPipe) id: number) {
    return this.companyService.getCompanyUsers(id);
  }

  @Post(':id/invitations')
  @UseGuards(JwtAuthGuard, PermissionsGuard, CompanyScopeGuard)
  @Permissions('company-users:invite')
  @CompanyScope()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create an invitation for a user to join the company',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Company ID',
    example: 2,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'newuser@example.com',
        },
      },
      required: ['email'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Invitation created successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invitation already exists',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - missing permissions or accessing wrong company',
  })
  createInvitation(
    @Param('id', ParseIntPipe) id: number,
    @Body('email') email: string,
    @Req() req: any,
  ) {
    return this.companyService.createInvitation(id, email, req.user.userId);
  }

  @Post(':id/users/:userId/deactivate')
  @UseGuards(JwtAuthGuard, PermissionsGuard, CompanyScopeGuard)
  @Permissions('company-users:deactivate')
  @CompanyScope()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate a user in the company' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Company ID',
    example: 2,
  })
  @ApiParam({
    name: 'userId',
    type: 'number',
    description: 'User ID to deactivate',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'User deactivated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Company or user not found',
  })
  @ApiResponse({
    status: 400,
    description: 'User does not belong to this company',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - missing permissions or accessing wrong company',
  })
  deactivateUser(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.companyService.deactivateUser(id, userId);
  }

  @Post(':id/users/:userId/activate')
  @UseGuards(JwtAuthGuard, PermissionsGuard, CompanyScopeGuard)
  @Permissions('company-users:deactivate')
  @CompanyScope()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate a user in the company' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Company ID',
    example: 2,
  })
  @ApiParam({
    name: 'userId',
    type: 'number',
    description: 'User ID to activate',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'User activated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Company or user not found',
  })
  @ApiResponse({
    status: 400,
    description: 'User does not belong to this company',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - missing permissions or accessing wrong company',
  })
  activateUser(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.companyService.activateUser(id, userId);
  }

  @Post(':id/users/add-existing')
  @UseGuards(JwtAuthGuard, PermissionsGuard, CompanyScopeGuard)
  @Permissions('company-users:invite')
  @CompanyScope()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add an existing user to the company directly' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Company ID',
    example: 2,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: {
          type: 'number',
          example: 5,
        },
      },
      required: ['userId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User added to company successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Company or user not found',
  })
  @ApiResponse({
    status: 400,
    description: 'User already belongs to a company',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - missing permissions or accessing wrong company',
  })
  addUserToCompany(
    @Param('id', ParseIntPipe) id: number,
    @Body('userId', ParseIntPipe) userId: number,
    @Req() req: any,
  ) {
    return this.companyService.addUserToCompany(id, userId, req.user.userId);
  }

  @Post(':id/users')
  @UseGuards(JwtAuthGuard, PermissionsGuard, CompanyScopeGuard)
  @Permissions('company-users:invite')
  @CompanyScope()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new user and add to the company' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Company ID',
    example: 2,
  })
  @ApiBody({ type: AddUserDto })
  @ApiResponse({
    status: 201,
    description: 'User created and added to company successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  @ApiResponse({
    status: 400,
    description: 'User with this email already exists',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - missing permissions or accessing wrong company',
  })
  createUserForCompany(
    @Param('id', ParseIntPipe) id: number,
    @Body() addUserDto: AddUserDto,
    @Req() req: any,
  ) {
    return this.companyService.createUserForCompany(
      id,
      addUserDto,
      req.user.userId,
    );
  }

  @Patch(':id/users/:userId')
  @UseGuards(JwtAuthGuard, PermissionsGuard, CompanyScopeGuard)
  @Permissions('company-users:invite')
  @CompanyScope()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a company user' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Company ID',
    example: 2,
  })
  @ApiParam({
    name: 'userId',
    type: 'number',
    description: 'User ID',
    example: 10,
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Company or user not found',
  })
  @ApiResponse({
    status: 400,
    description: 'User does not belong to this company',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - missing permissions or accessing wrong company',
  })
  updateCompanyUser(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.companyService.updateCompanyUser(id, userId, updateUserDto);
  }

  @Delete(':id/users/:userId')
  @UseGuards(JwtAuthGuard, PermissionsGuard, CompanyScopeGuard)
  @Permissions('company-users:deactivate')
  @CompanyScope()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a company user (soft delete)' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Company ID',
    example: 2,
  })
  @ApiParam({
    name: 'userId',
    type: 'number',
    description: 'User ID',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Company or user not found',
  })
  @ApiResponse({
    status: 400,
    description: 'User does not belong to this company',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - missing permissions or accessing wrong company',
  })
  removeCompanyUser(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.companyService.removeCompanyUser(id, userId);
  }

  @Post(':id/users/:userId/roles')
  @UseGuards(JwtAuthGuard, PermissionsGuard, CompanyScopeGuard)
  @Permissions('company-users:invite')
  @CompanyScope()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign a role to a company user' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Company ID',
    example: 2,
  })
  @ApiParam({
    name: 'userId',
    type: 'number',
    description: 'User ID',
    example: 10,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        roleId: {
          type: 'number',
          example: 3,
        },
      },
      required: ['roleId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Role assigned successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Company, user, or role not found',
  })
  @ApiResponse({
    status: 400,
    description: 'User does not belong to this company or role already assigned',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - missing permissions or accessing wrong company',
  })
  assignRoleToUser(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body('roleId', ParseIntPipe) roleId: number,
    @Req() req: any,
  ) {
    return this.companyService.assignRoleToUser(
      id,
      userId,
      roleId,
      req.user.userId,
    );
  }

  @Delete(':id/users/:userId/roles/:roleId')
  @UseGuards(JwtAuthGuard, PermissionsGuard, CompanyScopeGuard)
  @Permissions('company-users:invite')
  @CompanyScope()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a role from a company user' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Company ID',
    example: 2,
  })
  @ApiParam({
    name: 'userId',
    type: 'number',
    description: 'User ID',
    example: 10,
  })
  @ApiParam({
    name: 'roleId',
    type: 'number',
    description: 'Role ID',
    example: 3,
  })
  @ApiResponse({
    status: 200,
    description: 'Role removed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Company, user, or role not found',
  })
  @ApiResponse({
    status: 400,
    description: 'User does not belong to this company or role not assigned',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - missing permissions or accessing wrong company',
  })
  removeRoleFromUser(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.companyService.removeRoleFromUser(id, userId, roleId);
  }

  @Get(':id/projects')
  @UseGuards(JwtAuthGuard, CompanyScopeGuard)
  @CompanyScope()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all projects of a company' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Company ID',
    example: 2,
  })
  @ApiResponse({
    status: 200,
    description: 'List of company projects',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            example: 1,
            description: 'Project ID',
          },
          name: {
            type: 'string',
            example: 'New Infrastructure Project',
            description: 'Project name',
          },
          code: {
            type: 'string',
            nullable: true,
            example: 'INFRA-2024-001',
            description: 'Project code',
          },
          regionId: {
            type: 'number',
            example: 1,
            description: 'Region ID',
          },
          region: {
            type: 'object',
            description: 'Region information',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Almaty' },
            },
          },
          statusId: {
            type: 'number',
            example: 1,
            description: 'Project status ID',
          },
          status: {
            type: 'object',
            description: 'Project status information',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'In Progress' },
              description: { type: 'string', example: 'Project is in progress' },
            },
          },
          contactName: {
            type: 'string',
            example: 'John Doe',
            description: 'Contact person name',
          },
          contactPhone: {
            type: 'string',
            nullable: true,
            example: '+7 777 123 4567',
            description: 'Contact phone number',
          },
          contactEmail: {
            type: 'string',
            nullable: true,
            example: 'john.doe@example.com',
            description: 'Contact email address',
          },
          companyId: {
            type: 'number',
            nullable: true,
            example: 2,
            description: 'Company ID',
          },
          company: {
            type: 'object',
            nullable: true,
            description: 'Company information',
            properties: {
              id: { type: 'number', example: 2 },
              name: { type: 'string', example: 'Tech Corp' },
              description: {
                type: 'string',
                nullable: true,
                example: 'Technology company',
              },
            },
          },
          executors: {
            type: 'array',
            description: 'List of executors assigned to the project',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 5 },
                email: { type: 'string', example: 'executor@example.com' },
                full_name: { type: 'string', example: 'Jane Smith' },
              },
            },
          },
          createdBy: {
            type: 'number',
            example: 1,
            description: 'Creator user ID',
          },
          creator: {
            type: 'object',
            description: 'Creator information',
            properties: {
              id: { type: 'number', example: 1 },
              email: { type: 'string', example: 'creator@example.com' },
              full_name: { type: 'string', example: 'Admin User' },
              profile: {
                type: 'object',
                nullable: true,
                properties: {
                  avatar: {
                    type: 'string',
                    nullable: true,
                    example: 'storage/avatars/abc123.jpg',
                  },
                },
              },
            },
          },
          kanbanColumnId: {
            type: 'number',
            example: 1,
            description: 'Kanban column ID',
          },
          kanbanColumn: {
            type: 'object',
            description: 'Kanban column information',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'To Do' },
              position: { type: 'number', example: 1 },
            },
          },
          expectedDeadline: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2024-12-31T23:59:59.000Z',
            description: 'Expected deadline',
          },
          comments: {
            type: 'string',
            nullable: true,
            example: 'Initial project setup',
            description: 'Project comments',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-08-07T05:56:00.000Z',
            description: 'Creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-08-07T05:56:00.000Z',
            description: 'Last update timestamp',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - accessing wrong company',
  })
  getCompanyProjects(@Param('id', ParseIntPipe) id: number) {
    return this.companyService.getCompanyProjects(id);
  }
}
