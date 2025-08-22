import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionResponseDto } from './dto/permission-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('permissions')
@Controller('permissions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiBody({ type: CreatePermissionDto })
  @ApiResponse({
    status: 201,
    description: 'Permission created successfully',
    type: PermissionResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Permission with this name already exists',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  create(@Body() createPermissionDto: CreatePermissionDto): Promise<PermissionResponseDto> {
    return this.permissionService.create(createPermissionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all permissions with their associated roles' })
  @ApiResponse({
    status: 200,
    description: 'List of all permissions with roles',
    type: [PermissionResponseDto],
  })
  findAll(): Promise<PermissionResponseDto[]> {
    return this.permissionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a permission by ID with associated roles' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Permission ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Permission found with roles',
    type: PermissionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Permission not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<PermissionResponseDto> {
    return this.permissionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a permission' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Permission ID',
    example: 1,
  })
  @ApiBody({ type: UpdatePermissionDto })
  @ApiResponse({
    status: 200,
    description: 'Permission updated successfully',
    type: PermissionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Permission not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Permission with this name already exists',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionResponseDto> {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a permission' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Permission ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Permission deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Permission not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Cannot delete permission - it is linked to roles',
  })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any): Promise<void> {
    return this.permissionService.remove(id, req.user);
  }
}