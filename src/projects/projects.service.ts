import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { ProjectFilterDto } from './dto/project-filter.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import {
  CheckProjectNameResponseDto,
  SimilarProjectDto,
} from './dto/check-project-name-response.dto';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private mapToDto(project: any): ProjectResponseDto {
    return {
      id: project.id,
      name: project.name,
      code: project.code ?? null,
      regionId: project.regionId,
      region: project.region
        ? { id: project.region.id, name: project.region.name }
        : { id: project.regionId, name: (project as any).region?.name ?? '' },
      statusId: project.statusId,
      status: project.status
        ? {
            id: project.status.id,
            name: project.status.name,
            description: project.status.description,
          }
        : { id: project.statusId, name: '', description: '' },
      contactName: project.contactName,
      contactPhone: project.contactPhone ?? null,
      contactEmail: project.contactEmail ?? null,
      companyId: project.companyId ?? null,
      company: project.company
        ? {
            id: project.company.id,
            name: project.company.name,
            description: project.company.description ?? null,
          }
        : null,
      executors: Array.isArray(project.executors)
        ? project.executors.map((e: any) => ({
            id: e.id,
            email: e.email,
            full_name: e.full_name,
          }))
        : [],
      createdBy: project.createdBy,
      creator: project.creator
        ? {
            id: project.creator.id,
            email: project.creator.email,
            full_name: project.creator.full_name,
          }
        : { id: project.createdBy, email: '', full_name: '' },
      kanbanColumnId: project.kanbanColumnId,
      kanbanColumn: project.kanbanColumn
        ? {
            id: project.kanbanColumn.id,
            name: project.kanbanColumn.name,
            position: project.kanbanColumn.position,
          }
        : { id: project.kanbanColumnId, name: '', position: 0 },
      attachedFiles: project.attachedFiles,
      expectedDeadline: project.expectedDeadline ?? null,
      comments: project.comments ?? null,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    } as ProjectResponseDto;
  }

  async create(
    createProjectDto: CreateProjectDto,
    createdBy: number,
  ): Promise<ProjectResponseDto> {
    this.logger.log(
      `Creating project with name: ${createProjectDto.name} and example ${createProjectDto.code ?? 'no code'}`,
    );

    const {
      name,
      code,
      regionId,
      statusId,
      contactName,
      contactPhone,
      contactEmail,
      companyId,
      executorIds,
      kanbanColumnId,
      attachedFiles,
      expectedDeadline,
      comments,
    } = createProjectDto;

    const baseData: any = {
      name,
      code,
      contactName,
      contactPhone,
      contactEmail,
      attachedFiles: attachedFiles || [],
      expectedDeadline: expectedDeadline ? new Date(expectedDeadline) : null,
      comments,
      region: { connect: { id: regionId } },
      status: { connect: { id: statusId } },
      ...(executorIds && executorIds.length
        ? { executors: { connect: executorIds.map((id) => ({ id })) } }
        : {}),
      creator: { connect: { id: createdBy } },
      kanbanColumn: { connect: { id: kanbanColumnId } },
      ...(companyId ? { company: { connect: { id: companyId } } } : {}),
    };

    const includeBase: any = {
      region: true,
      status: true,
      company: true,
      executors: {
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
    };

    try {
      const project = await this.prisma.project.create({
        data: {
          ...baseData,
        },
        include: includeBase,
      });

      this.logger.log(`Project created with id: ${project.id}`);
      return this.mapToDto(project);
    } catch (e: any) {
      throw e;
    }
  }

  async findAll(filters: ProjectFilterDto): Promise<ProjectResponseDto[]> {
    const where: any = {};

    if (filters.regionId) {
      where.regionId = filters.regionId;
    }
    if (filters.statusId) {
      where.statusId = filters.statusId;
    }
    if (filters.executorId) {
      where.executors = { some: { id: filters.executorId } };
    }
    if (filters.companyId) {
      where.companyId = filters.companyId;
    }

    const projects = await this.prisma.project.findMany({
      where,
      include: {
        region: true,
        status: true,
        company: true,
        executors: {
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
    return projects.map((p) => this.mapToDto(p));
  }

  async checkName(name: string): Promise<CheckProjectNameResponseDto> {
    this.logger.log(`Checking uniqueness for project name: ${name}`);

    const exact = await this.prisma.project.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
      select: { id: true },
    });

    const similarRaw = await this.prisma.project.findMany({
      where: { name: { contains: name, mode: 'insensitive' } },
      select: { id: true, name: true, code: true },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    const similar: SimilarProjectDto[] = similarRaw.map((p) => ({
      id: p.id,
      name: p.name,
      code: p.code ?? null,
    }));

    const response: CheckProjectNameResponseDto = {
      isUnique: !Boolean(exact),
      similar,
    };

    return response;
  }

  async findOne(id: number): Promise<ProjectResponseDto> {
    this.logger.log(`Finding project with id: ${id}`);

    try {
      const project = await this.prisma.project.findUnique({
        where: { id },
        include: {
          region: true,
          status: true,
          company: true,
          executors: {
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

      return this.mapToDto(project);
    } catch (e: any) {
      if (e?.code === 'P2021') {
        this.logger.warn(
          'Executors relation table is missing. Falling back to query without executors and returning empty executors list.',
        );
        const project = await this.prisma.project.findUnique({
          where: { id },
          include: {
            region: true,
            status: true,
            company: true,
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

        return { ...(project as any), executors: [] } as ProjectResponseDto;
      }
      throw e;
    }
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
    if (updateProjectDto.executorIds !== undefined) {
      updateData.executors = {
        set: (updateProjectDto.executorIds || []).map((id) => ({ id })),
      };
      delete updateData.executorIds;
    }

    try {
      const project = await this.prisma.project.update({
        where: { id },
        data: updateData,
        include: {
          region: true,
          status: true,
          company: true,
          executors: {
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
      return this.mapToDto(project);
    } catch (e: any) {
      if (e?.code === 'P2021') {
        this.logger.warn(
          'Executors relation table is missing. Updating project without executors relation and returning empty executors list.',
        );
        const safeData = { ...updateData } as any;
        if (safeData.executors !== undefined) {
          delete safeData.executors;
        }
        const project = await this.prisma.project.update({
          where: { id },
          data: safeData,
          include: {
            region: true,
            status: true,
            company: true,
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

        this.logger.log(
          `Project with id ${id} updated successfully (fallback without executors)`,
        );
        return { ...(project as any), executors: [] } as ProjectResponseDto;
      }
      throw e;
    }
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

    try {
      const project = await this.prisma.project.update({
        where: { id },
        data: {
          statusId: updateStatusDto.statusId,
        },
        include: {
          region: true,
          status: true,
          company: true,
          executors: {
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
      return this.mapToDto(project);
    } catch (e: any) {
      if (e?.code === 'P2021') {
        this.logger.warn(
          'Executors relation table is missing. Updating status without executors include and returning empty executors list.',
        );

        const project = await this.prisma.project.update({
          where: { id },
          data: {
            statusId: updateStatusDto.statusId,
          },
          include: {
            region: true,
            status: true,
            company: true,
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

        this.logger.log(
          `Status updated for project with id ${id} (fallback without executors)`,
        );
        return { ...(project as any), executors: [] } as ProjectResponseDto;
      }
      throw e;
    }
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

    try {
      const project = await this.prisma.project.update({
        where: { id },
        data: {
          kanbanColumnId: columnId,
        },
        include: {
          region: true,
          status: true,
          company: true,
          executors: {
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

      this.logger.log(
        `Project with id ${id} moved to kanban column ${columnId}`,
      );
      return this.mapToDto(project);
    } catch (e: any) {
      if (e?.code === 'P2021') {
        this.logger.warn(
          'Executors relation table is missing. Moving project without executors include and returning empty executors list.',
        );

        const project = await this.prisma.project.update({
          where: { id },
          data: {
            kanbanColumnId: columnId,
          },
          include: {
            region: true,
            status: true,
            company: true,
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

        this.logger.log(
          `Project with id ${id} moved to kanban column ${columnId} (fallback without executors)`,
        );
        return { ...(project as any), executors: [] } as ProjectResponseDto;
      }
      throw e;
    }
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
      'regionId',
      'statusId',
      'contactName',
      'contactPhone',
      'contactEmail',
      'companyId',
      'kanbanColumnId',
      'expectedDeadline',
      'comments',
    ];

    for (const field of fieldsToLog) {
      if (
        updateData[field] !== undefined &&
        updateData[field] !== currentProject[field]
      ) {
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
