import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectLogService } from './project-log.service';
import { ProjectLogResponseDto } from './dto/project-log-response.dto';

@ApiTags('project-logs')
@Controller('project-logs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectLogController {
  constructor(private readonly projectLogService: ProjectLogService) {}

  @Get(':projectId')
  @ApiOperation({ summary: 'Get history of project field changes' })
  @ApiParam({ name: 'projectId', type: Number, description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Logs retrieved successfully', type: [ProjectLogResponseDto] })
  findByProject(
    @Param('projectId', ParseIntPipe) projectId: number,
  ): Promise<ProjectLogResponseDto[]> {
    return this.projectLogService.findByProject(projectId);
  }
}
