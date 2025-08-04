import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectTypeDto } from './dto/create-project-type.dto';
import { UpdateProjectTypeDto } from './dto/update-project-type.dto';
import { ProjectTypeResponseDto } from './dto/project-type-response.dto';
import {
  ProjectTypeNotFoundException,
  ProjectTypeAlreadyExistsException,
} from '../common/exceptions/custom-exceptions';

@Injectable()
export class ProjectTypeService {
  private readonly logger = new Logger(ProjectTypeService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createProjectTypeDto: CreateProjectTypeDto): Promise<ProjectTypeResponseDto> {
    this.logger.log(`Creating project type with name: ${createProjectTypeDto.name}`);

    // Check if project type with this name already exists
    const existingProjectType = await this.prisma.projectType.findFirst({
      where: { name: createProjectTypeDto.name },
    });

    if (existingProjectType) {
      this.logger.warn(
        `Project type with name ${createProjectTypeDto.name} already exists`,
      );
      throw new ProjectTypeAlreadyExistsException();
    }

    const projectType = await this.prisma.projectType.create({
      data: createProjectTypeDto,
    });

    this.logger.log(`Project type created with id: ${projectType.id}`);
    return projectType;
  }

  async findAll(): Promise<ProjectTypeResponseDto[]> {
    this.logger.log('Fetching all project types');
    const projectTypes = await this.prisma.projectType.findMany({
      orderBy: { id: 'asc' },
    });
    this.logger.log(`Found ${projectTypes.length} project types`);
    return projectTypes;
  }

  async findOne(id: number): Promise<ProjectTypeResponseDto> {
    this.logger.log(`Fetching project type with id: ${id}`);
    const projectType = await this.prisma.projectType.findUnique({
      where: { id },
    });

    if (!projectType) {
      this.logger.warn(`Project type with id ${id} not found`);
      throw new ProjectTypeNotFoundException();
    }

    return projectType;
  }

  async update(
    id: number,
    updateProjectTypeDto: UpdateProjectTypeDto,
  ): Promise<ProjectTypeResponseDto> {
    this.logger.log(`Updating project type with id: ${id}`);

    // Check if project type exists
    await this.findOne(id);

    // Check if new name already exists (if name is being updated)
    if (updateProjectTypeDto.name) {
      const existingProjectType = await this.prisma.projectType.findFirst({
        where: {
          name: updateProjectTypeDto.name,
          NOT: { id },
        },
      });

      if (existingProjectType) {
        this.logger.warn(
          `Project type with name ${updateProjectTypeDto.name} already exists`,
        );
        throw new ProjectTypeAlreadyExistsException();
      }
    }

    const projectType = await this.prisma.projectType.update({
      where: { id },
      data: updateProjectTypeDto,
    });

    this.logger.log(`Project type with id ${id} updated successfully`);
    return projectType;
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Removing project type with id: ${id}`);

    // Check if project type exists
    await this.findOne(id);

    await this.prisma.projectType.delete({
      where: { id },
    });

    this.logger.log(`Project type with id ${id} removed successfully`);
  }
}