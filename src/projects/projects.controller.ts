import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { ProjectFilterDto } from './dto/project-filter.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('projects')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
    type: ProjectResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @Request() req: any,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.create(createProjectDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects with optional filtering' })
  @ApiQuery({
    name: 'regionId',
    required: false,
    type: Number,
    description: 'Filter by region ID',
  })
  @ApiQuery({
    name: 'statusId',
    required: false,
    type: Number,
    description: 'Filter by status ID',
  })
  @ApiQuery({
    name: 'projectTypeId',
    required: false,
    type: Number,
    description: 'Filter by project type ID',
  })
  @ApiQuery({
    name: 'executorId',
    required: false,
    type: Number,
    description: 'Filter by executor ID',
  })
  @ApiQuery({
    name: 'companyId',
    required: false,
    type: Number,
    description: 'Filter by company ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
    type: [ProjectResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  findAll(@Query() filters: ProjectFilterDto): Promise<ProjectResponseDto[]> {
    return this.projectsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Project ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Project retrieved successfully',
    type: ProjectResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update project by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Project ID',
  })
  @ApiBody({ type: UpdateProjectDto })
  @ApiResponse({
    status: 200,
    description: 'Project updated successfully',
    type: ProjectResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req: any,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.update(id, updateProjectDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Project ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Project deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.projectsService.remove(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update project status' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Project ID',
  })
  @ApiBody({ type: UpdateProjectStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Project status updated successfully',
    type: ProjectResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateProjectStatusDto,
    @Request() req: any,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.updateStatus(id, updateStatusDto, req.user.userId);
  }

  @Patch(':id/move-to-kanban/:columnId')
  @ApiOperation({ summary: 'Move project to kanban column' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Project ID',
  })
  @ApiParam({
    name: 'columnId',
    type: Number,
    description: 'Target kanban column ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Project moved to kanban column successfully',
    type: ProjectResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Project or kanban column not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  moveToKanban(
    @Param('id', ParseIntPipe) id: number,
    @Param('columnId', ParseIntPipe) columnId: number,
    @Request() req: any,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.moveToKanbanColumn(id, columnId, req.user.userId);
  }
}