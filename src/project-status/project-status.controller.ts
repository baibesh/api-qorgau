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
import { ProjectStatusService } from './project-status.service';
import { CreateProjectStatusDto } from './dto/create-project-status.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { ProjectStatusResponseDto } from './dto/project-status-response.dto';

@ApiTags('project-statuses')
@Controller('project-statuses')
export class ProjectStatusController {
  constructor(private readonly projectStatusService: ProjectStatusService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project status' })
  @ApiBody({ type: CreateProjectStatusDto })
  @ApiResponse({
    status: 201,
    description: 'Project status created successfully',
    type: ProjectStatusResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Project status with this name already exists',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  create(
    @Body() createProjectStatusDto: CreateProjectStatusDto,
  ): Promise<ProjectStatusResponseDto> {
    return this.projectStatusService.create(createProjectStatusDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all project statuses' })
  @ApiResponse({
    status: 200,
    description: 'List of all project statuses',
    type: [ProjectStatusResponseDto],
  })
  findAll(): Promise<ProjectStatusResponseDto[]> {
    return this.projectStatusService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project status by ID' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Project status ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Project status found',
    type: ProjectStatusResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Project status not found',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProjectStatusResponseDto> {
    return this.projectStatusService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project status' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Project status ID',
    example: 1,
  })
  @ApiBody({ type: UpdateProjectStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Project status updated successfully',
    type: ProjectStatusResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Project status not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Project status with this name already exists',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectStatusDto: UpdateProjectStatusDto,
  ): Promise<ProjectStatusResponseDto> {
    return this.projectStatusService.update(id, updateProjectStatusDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project status' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Project status ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Project status deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Project status not found',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.projectStatusService.remove(id);
  }
}