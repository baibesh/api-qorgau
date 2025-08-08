import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectCommentDto } from './dto/create-project-comment.dto';
import { ProjectCommentResponseDto } from './dto/project-comment-response.dto';

@Injectable()
export class ProjectCommentService {
  private readonly logger = new Logger(ProjectCommentService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProjectCommentDto, authorId: number): Promise<ProjectCommentResponseDto> {
    this.logger.log(`Creating comment for project ${dto.projectId} by user ${authorId}`);

    // Ensure project exists (optional, but good practice)
    const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
    if (!project) {
      throw new NotFoundException(`Project with id ${dto.projectId} not found`);
    }

    const comment = await this.prisma.projectComment.create({
      data: {
        projectId: dto.projectId,
        authorId,
        message: dto.message,
      },
      include: {
        author: { select: { id: true, email: true, full_name: true } },
      },
    });

    return comment as unknown as ProjectCommentResponseDto;
  }

  async findByProject(projectId: number): Promise<ProjectCommentResponseDto[]> {
    this.logger.log(`Fetching comments for project ${projectId}`);
    const comments = await this.prisma.projectComment.findMany({
      where: { projectId },
      include: {
        author: { select: { id: true, email: true, full_name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return comments as unknown as ProjectCommentResponseDto[];
  }
}
