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
  create(@Body() createCompanyDto: CreateCompanyDto): Promise<CompanyResponseDto> {
    return this.companyService.create(createCompanyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['PROJECT', 'CUSTOMER', 'SUPPLIER', 'OTHER'],
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
  @ApiOperation({ summary: 'Create an invitation for a user to join the company' })
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
}