import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { RegionResponseDto } from './dto/region-response.dto';
import {
  RegionNotFoundException,
  RegionAlreadyExistsException,
} from '../common/exceptions/custom-exceptions';

@Injectable()
export class RegionService {
  private readonly logger = new Logger(RegionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createRegionDto: CreateRegionDto): Promise<RegionResponseDto> {
    this.logger.log(`Creating region with name: ${createRegionDto.name}`);

    const existingRegion = await this.prisma.region.findFirst({
      where: { name: createRegionDto.name },
    });

    if (existingRegion) {
      this.logger.warn(
        `Region with name ${createRegionDto.name} already exists`,
      );
      throw new RegionAlreadyExistsException();
    }

    const region = await this.prisma.region.create({
      data: createRegionDto,
    });

    this.logger.log(`Region created with id: ${region.id}`);
    return region;
  }

  async findAll(): Promise<RegionResponseDto[]> {
    this.logger.log('Fetching all regions');
    const regions = await this.prisma.region.findMany({
      orderBy: { id: 'asc' },
    });
    this.logger.log(`Found ${regions.length} regions`);
    return regions;
  }

  async findOne(id: number): Promise<RegionResponseDto> {
    this.logger.log(`Fetching region with id: ${id}`);
    const region = await this.prisma.region.findUnique({
      where: { id },
    });

    if (!region) {
      this.logger.warn(`Region with id ${id} not found`);
      throw new RegionNotFoundException();
    }

    return region;
  }

  async update(
    id: number,
    updateRegionDto: UpdateRegionDto,
  ): Promise<RegionResponseDto> {
    this.logger.log(`Updating region with id: ${id}`);

    await this.findOne(id);

    if (updateRegionDto.name) {
      const existingRegion = await this.prisma.region.findFirst({
        where: {
          name: updateRegionDto.name,
          NOT: { id },
        },
      });

      if (existingRegion) {
        this.logger.warn(
          `Region with name ${updateRegionDto.name} already exists`,
        );
        throw new RegionAlreadyExistsException();
      }
    }

    const region = await this.prisma.region.update({
      where: { id },
      data: updateRegionDto,
    });

    this.logger.log(`Region with id ${id} updated successfully`);
    return region;
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Removing region with id: ${id}`);

    await this.findOne(id);

    await this.prisma.region.delete({
      where: { id },
    });

    this.logger.log(`Region with id ${id} removed successfully`);
  }
}
