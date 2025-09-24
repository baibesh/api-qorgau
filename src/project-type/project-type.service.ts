import { Injectable, Logger, GoneException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectTypeDto } from './dto/create-project-type.dto';
import { UpdateProjectTypeDto } from './dto/update-project-type.dto';
import { ProjectTypeResponseDto } from './dto/project-type-response.dto';

@Injectable()
export class ProjectTypeService {
  private readonly logger = new Logger(ProjectTypeService.name);

  constructor(private readonly prisma: PrismaService) {}

  private removed(): never {
    this.logger.warn('ProjectType feature has been removed from the system');
    throw new GoneException('ProjectType has been removed');
  }

  async create(_dto: CreateProjectTypeDto): Promise<ProjectTypeResponseDto> {
    return this.removed();
  }

  async findAll(): Promise<ProjectTypeResponseDto[]> {
    return this.removed();
  }

  async findOne(_id: number): Promise<ProjectTypeResponseDto> {
    return this.removed();
  }

  async update(
    _id: number,
    _dto: UpdateProjectTypeDto,
  ): Promise<ProjectTypeResponseDto> {
    return this.removed();
  }

  async remove(_id: number): Promise<void> {
    return this.removed();
  }
}