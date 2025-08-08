import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectLogResponseDto } from './dto/project-log-response.dto';

@Injectable()
export class ProjectLogService {
  private readonly logger = new Logger(ProjectLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findByProject(projectId: number): Promise<ProjectLogResponseDto[]> {
    this.logger.log(`Fetching logs for project ${projectId}`);
    const logs = await this.prisma.projectLog.findMany({
      where: { projectId },
      include: {
        user: {
          select: { id: true, email: true, full_name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return logs as unknown as ProjectLogResponseDto[];
  }
}
