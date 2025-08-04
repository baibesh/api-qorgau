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
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyResponseDto } from './dto/company-response.dto';

@ApiTags('companies')
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  @ApiBody({ type: CreateCompanyDto })
  @ApiResponse({
    status: 201,
    description: 'Company created successfully',
    type: CompanyResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Company with this name or INN already exists',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  create(@Body() createCompanyDto: CreateCompanyDto): Promise<CompanyResponseDto> {
    return this.companyService.create(createCompanyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  @ApiResponse({
    status: 200,
    description: 'List of all companies',
    type: [CompanyResponseDto],
  })
  findAll(): Promise<CompanyResponseDto[]> {
    return this.companyService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a company by ID' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Company ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Company found',
    type: CompanyResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<CompanyResponseDto> {
    return this.companyService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a company' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Company ID',
    example: 1,
  })
  @ApiBody({ type: UpdateCompanyDto })
  @ApiResponse({
    status: 200,
    description: 'Company updated successfully',
    type: CompanyResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Company with this name or INN already exists',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ): Promise<CompanyResponseDto> {
    return this.companyService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a company' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Company ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Company deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.companyService.remove(id);
  }
}