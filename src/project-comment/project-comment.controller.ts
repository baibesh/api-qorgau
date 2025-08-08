import { Body, Controller, Get, Param, ParseIntPipe, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectCommentService } from './project-comment.service';
import { CreateProjectCommentDto } from './dto/create-project-comment.dto';
import { ProjectCommentResponseDto } from './dto/project-comment-response.dto';

@ApiTags('project-comments')
@Controller('project-comments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectCommentController {
  constructor(private readonly projectCommentService: ProjectCommentService) {}

  @Post()
  @ApiOperation({ summary: 'Add a comment to a project' })
  @ApiBody({ type: CreateProjectCommentDto })
  @ApiResponse({ status: 201, description: 'Comment created', type: ProjectCommentResponseDto })
  create(
    @Body() dto: CreateProjectCommentDto,
    @Request() req: any,
  ): Promise<ProjectCommentResponseDto> {
    return this.projectCommentService.create(dto, req.user.id);
  }

  @Get(':projectId')
  @ApiOperation({ summary: 'Get comments for a project' })
  @ApiParam({ name: 'projectId', type: Number, description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Comments retrieved', type: [ProjectCommentResponseDto] })
  findByProject(
    @Param('projectId', ParseIntPipe) projectId: number,
  ): Promise<ProjectCommentResponseDto[]> {
    return this.projectCommentService.findByProject(projectId);
  }
}
