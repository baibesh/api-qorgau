import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { ProjectFilterDto } from './dto/project-filter.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    createProjectDto: CreateProjectDto,
    createdBy: number,
  ): Promise<ProjectResponseDto> {
    this.logger.log(`Creating project with name: ${createProjectDto.name}`);

    const {
      name,
      code,
      projectTypeId,
      regionId,
      statusId,
      contactName,
      contactPhone,
      contactEmail,
      companyId,
      executorId,
      kanbanColumnId,
      attachedFiles,
      expectedDeadline,
      comments,
    } = createProjectDto;

    const project = await this.prisma.project.create({
      data: {
        name,
        code,
        contactName,
        contactPhone,
        contactEmail,
        attachedFiles: attachedFiles || [],
        expectedDeadline: expectedDeadline ? new Date(expectedDeadline) : null,
        comments,
        // Relations (required)
        projectType: { connect: { id: projectTypeId } },
        region: { connect: { id: regionId } },
        status: { connect: { id: statusId } },
        executor: { connect: { id: executorId } },
        creator: { connect: { id: createdBy } },
        kanbanColumn: { connect: { id: kanbanColumnId } },
        // Optional relation
        ...(companyId ? { company: { connect: { id: companyId } } } : {}),
      },
      include: {
        projectType: true,
        region: true,
        status: true,
        company: true,
        executor: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
        kanbanColumn: true,
      },
    });

    this.logger.log(`Project created with id: ${project.id}`);
    return project;
  }

  async findAll(filters: ProjectFilterDto): Promise<ProjectResponseDto[]> {
    const where: any = {};

    if (filters.regionId) {
      where.regionId = filters.regionId;
    }
    if (filters.statusId) {
      where.statusId = filters.statusId;
    }
    if (filters.projectTypeId) {
      where.projectTypeId = filters.projectTypeId;
    }
    if (filters.executorId) {
      where.executorId = filters.executorId;
    }
    if (filters.companyId) {
      where.companyId = filters.companyId;
    }

    const projects = await this.prisma.project.findMany({
      where,
      include: {
        projectType: true,
        region: true,
        status: true,
        company: true,
        executor: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
        kanbanColumn: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    this.logger.log(`Found ${projects.length} projects`);
    return projects;
  }

  async findOne(id: number): Promise<ProjectResponseDto> {
    this.logger.log(`Finding project with id: ${id}`);

    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        projectType: true,
        region: true,
        status: true,
        company: true,
        executor: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
        kanbanColumn: true,
        logs: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                full_name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        commentsList: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
                full_name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!project) {
      this.logger.warn(`Project with id ${id} not found`);
      throw new NotFoundException(`Project with id ${id} not found`);
    }

    return project;
  }

  async update(
    id: number,
    updateProjectDto: UpdateProjectDto,
    updatedBy: number,
  ): Promise<ProjectResponseDto> {
    this.logger.log(`Updating project with id: ${id}`);

    // Check if project exists
    await this.findOne(id);

    // Get current project data for logging changes
    const currentProject = await this.prisma.project.findUnique({
      where: { id },
    });

    const updateData: any = { ...updateProjectDto };
    if (updateProjectDto.expectedDeadline) {
      updateData.expectedDeadline = new Date(updateProjectDto.expectedDeadline);
    }

    const project = await this.prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        projectType: true,
        region: true,
        status: true,
        company: true,
        executor: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
        kanbanColumn: true,
      },
    });

    // Log changes
    await this.logChanges(id, currentProject, updateProjectDto, updatedBy);

    this.logger.log(`Project with id ${id} updated successfully`);
    return project;
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Removing project with id: ${id}`);

    // Check if project exists
    await this.findOne(id);

    await this.prisma.project.delete({
      where: { id },
    });

    this.logger.log(`Project with id ${id} removed successfully`);
  }

  async updateStatus(
    id: number,
    updateStatusDto: UpdateProjectStatusDto,
    updatedBy: number,
  ): Promise<ProjectResponseDto> {
    this.logger.log(`Updating status for project with id: ${id}`);

    // Check if project exists
    const currentProject = await this.findOne(id);

    const project = await this.prisma.project.update({
      where: { id },
      data: {
        statusId: updateStatusDto.statusId,
      },
      include: {
        projectType: true,
        region: true,
        status: true,
        company: true,
        executor: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
        kanbanColumn: true,
      },
    });

    // Log status change
    await this.prisma.projectLog.create({
      data: {
        projectId: id,
        changedBy: updatedBy,
        field: 'statusId',
        oldValue: currentProject.statusId.toString(),
        newValue: updateStatusDto.statusId.toString(),
      },
    });

    this.logger.log(`Status updated for project with id ${id}`);
    return project;
  }

  async moveToKanbanColumn(
    id: number,
    columnId: number,
    updatedBy: number,
  ): Promise<ProjectResponseDto> {
    this.logger.log(
      `Moving project with id: ${id} to kanban column: ${columnId}`,
    );

    // Check if project exists
    const currentProject = await this.findOne(id);

    const project = await this.prisma.project.update({
      where: { id },
      data: {
        kanbanColumnId: columnId,
      },
      include: {
        projectType: true,
        region: true,
        status: true,
        company: true,
        executor: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
            full_name: true,
          },
        },
        kanbanColumn: true,
      },
    });

    // Log kanban column change
    await this.prisma.projectLog.create({
      data: {
        projectId: id,
        changedBy: updatedBy,
        field: 'kanbanColumnId',
        oldValue: currentProject.kanbanColumnId.toString(),
        newValue: columnId.toString(),
      },
    });

    this.logger.log(`Project with id ${id} moved to kanban column ${columnId}`);
    return project;
  }

  private async logChanges(
    projectId: number,
    currentProject: any,
    updateData: any,
    changedBy: number,
  ): Promise<void> {
    const fieldsToLog = [
      'name',
      'code',
      'projectTypeId',
      'regionId',
      'statusId',
      'contactName',
      'contactPhone',
      'contactEmail',
      'companyId',
      'executorId',
      'kanbanColumnId',
      'expectedDeadline',
      'comments',
    ];

    for (const field of fieldsToLog) {
      if (updateData[field] !== undefined && updateData[field] !== currentProject[field]) {
        await this.prisma.projectLog.create({
          data: {
            projectId,
            changedBy,
            field,
            oldValue: currentProject[field]?.toString() || null,
            newValue: updateData[field]?.toString() || null,
          },
        });
      }
    }
  }
}