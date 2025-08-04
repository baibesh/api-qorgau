import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { RegionService } from './region.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { RegionResponseDto } from './dto/region-response.dto';

@ApiTags('regions')
@Controller('regions')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new region' })
  @ApiBody({ type: CreateRegionDto })
  @ApiResponse({
    status: 201,
    description: 'Region created successfully',
    type: RegionResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Region with this name already exists',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  create(@Body() createRegionDto: CreateRegionDto): Promise<RegionResponseDto> {
    return this.regionService.create(createRegionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all regions' })
  @ApiResponse({
    status: 200,
    description: 'List of all regions',
    type: [RegionResponseDto],
  })
  findAll(): Promise<RegionResponseDto[]> {
    return this.regionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a region by ID' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Region ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Region found',
    type: RegionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Region not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<RegionResponseDto> {
    return this.regionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a region' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Region ID',
    example: 1,
  })
  @ApiBody({ type: UpdateRegionDto })
  @ApiResponse({
    status: 200,
    description: 'Region updated successfully',
    type: RegionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Region not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Region with this name already exists',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRegionDto: UpdateRegionDto,
  ): Promise<RegionResponseDto> {
    return this.regionService.update(id, updateRegionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a region' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Region ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Region deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Region not found',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.regionService.remove(id);
  }
}
