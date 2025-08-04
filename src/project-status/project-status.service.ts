import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectStatusDto } from './dto/create-project-status.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { ProjectStatusResponseDto } from './dto/project-status-response.dto';
import {
  ProjectStatusNotFoundException,
  ProjectStatusAlreadyExistsException,
} from '../common/exceptions/custom-exceptions';

@Injectable()
export class ProjectStatusService {
  private readonly logger = new Logger(ProjectStatusService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    createProjectStatusDto: CreateProjectStatusDto,
  ): Promise<ProjectStatusResponseDto> {
    this.logger.log(
      `Creating project status with name: ${createProjectStatusDto.name}`,
    );

    // Check if project status with this name already exists
    const existingProjectStatus = await this.prisma.projectStatus.findFirst({
      where: { name: createProjectStatusDto.name },
    });

    if (existingProjectStatus) {
      this.logger.warn(
        `Project status with name ${createProjectStatusDto.name} already exists`,
      );
      throw new ProjectStatusAlreadyExistsException();
    }

    const projectStatus = await this.prisma.projectStatus.create({
      data: createProjectStatusDto,
    });

    this.logger.log(`Project status created with id: ${projectStatus.id}`);
    return projectStatus;
  }

  async findAll(): Promise<ProjectStatusResponseDto[]> {
    this.logger.log('Fetching all project statuses');
    const projectStatuses = await this.prisma.projectStatus.findMany({
      orderBy: { id: 'asc' },
    });
    this.logger.log(`Found ${projectStatuses.length} project statuses`);
    return projectStatuses;
  }

  async findOne(id: number): Promise<ProjectStatusResponseDto> {
    this.logger.log(`Fetching project status with id: ${id}`);
    const projectStatus = await this.prisma.projectStatus.findUnique({
      where: { id },
    });

    if (!projectStatus) {
      this.logger.warn(`Project status with id ${id} not found`);
      throw new ProjectStatusNotFoundException();
    }

    return projectStatus;
  }

  async update(
    id: number,
    updateProjectStatusDto: UpdateProjectStatusDto,
  ): Promise<ProjectStatusResponseDto> {
    this.logger.log(`Updating project status with id: ${id}`);

    // Check if project status exists
    await this.findOne(id);

    // Check if new name already exists (if name is being updated)
    if (updateProjectStatusDto.name) {
      const existingProjectStatus = await this.prisma.projectStatus.findFirst({
        where: {
          name: updateProjectStatusDto.name,
          NOT: { id },
        },
      });

      if (existingProjectStatus) {
        this.logger.warn(
          `Project status with name ${updateProjectStatusDto.name} already exists`,
        );
        throw new ProjectStatusAlreadyExistsException();
      }
    }

    const projectStatus = await this.prisma.projectStatus.update({
      where: { id },
      data: updateProjectStatusDto,
    });

    this.logger.log(`Project status with id ${id} updated successfully`);
    return projectStatus;
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Removing project status with id: ${id}`);

    // Check if project status exists
    await this.findOne(id);

    await this.prisma.projectStatus.delete({
      where: { id },
    });

    this.logger.log(`Project status with id ${id} removed successfully`);
  }
}