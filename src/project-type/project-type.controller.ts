import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ProjectTypeService } from './project-type.service';
import { CreateProjectTypeDto } from './dto/create-project-type.dto';
import { UpdateProjectTypeDto } from './dto/update-project-type.dto';
import { ProjectTypeResponseDto } from './dto/project-type-response.dto';

@ApiTags('project-types')
@Controller('project-types')
export class ProjectTypeController {
  constructor(private readonly projectTypeService: ProjectTypeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project type' })
  @ApiBody({ type: CreateProjectTypeDto })
  @ApiResponse({
    status: 201,
    description: 'Project type created successfully',
    type: ProjectTypeResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Project type with this name already exists',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  create(@Body() createProjectTypeDto: CreateProjectTypeDto): Promise<ProjectTypeResponseDto> {
    return this.projectTypeService.create(createProjectTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all project types' })
  @ApiResponse({
    status: 200,
    description: 'List of all project types',
    type: [ProjectTypeResponseDto],
  })
  findAll(): Promise<ProjectTypeResponseDto[]> {
    return this.projectTypeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project type by ID' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Project type ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Project type found',
    type: ProjectTypeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Project type not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ProjectTypeResponseDto> {
    return this.projectTypeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project type' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Project type ID',
    example: 1,
  })
  @ApiBody({ type: UpdateProjectTypeDto })
  @ApiResponse({
    status: 200,
    description: 'Project type updated successfully',
    type: ProjectTypeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Project type not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Project type with this name already exists',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectTypeDto: UpdateProjectTypeDto,
  ): Promise<ProjectTypeResponseDto> {
    return this.projectTypeService.update(id, updateProjectTypeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project type' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Project type ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Project type deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Project type not found',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.projectTypeService.remove(id);
  }
}