import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyResponseDto } from './dto/company-response.dto';
import {
  CompanyNotFoundException,
  CompanyAlreadyExistsException,
} from '../common/exceptions/custom-exceptions';

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<CompanyResponseDto> {
    this.logger.log(`Creating company with name: ${createCompanyDto.name}`);

    // Check if company with this name already exists
    const existingCompany = await this.prisma.company.findFirst({
      where: { name: createCompanyDto.name },
    });

    if (existingCompany) {
      this.logger.warn(`Company with name ${createCompanyDto.name} already exists`);
      throw new CompanyAlreadyExistsException();
    }

    // Check if INN already exists (if provided)
    if (createCompanyDto.inn) {
      const existingCompanyByInn = await this.prisma.company.findFirst({
        where: { inn: createCompanyDto.inn },
      });

      if (existingCompanyByInn) {
        this.logger.warn(`Company with INN ${createCompanyDto.inn} already exists`);
        throw new CompanyAlreadyExistsException();
      }
    }

    const company = await this.prisma.company.create({
      data: createCompanyDto,
    });

    this.logger.log(`Company created with id: ${company.id}`);
    return company;
  }

  async findAll(): Promise<CompanyResponseDto[]> {
    this.logger.log('Fetching all companies');
    const companies = await this.prisma.company.findMany({
      orderBy: { id: 'asc' },
    });
    this.logger.log(`Found ${companies.length} companies`);
    return companies;
  }

  async findOne(id: number): Promise<CompanyResponseDto> {
    this.logger.log(`Fetching company with id: ${id}`);
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      this.logger.warn(`Company with id ${id} not found`);
      throw new CompanyNotFoundException();
    }

    return company;
  }

  async update(id: number, updateCompanyDto: UpdateCompanyDto): Promise<CompanyResponseDto> {
    this.logger.log(`Updating company with id: ${id}`);

    // Check if company exists
    await this.findOne(id);

    // Check if new name already exists (if name is being updated)
    if (updateCompanyDto.name) {
      const existingCompany = await this.prisma.company.findFirst({
        where: { 
          name: updateCompanyDto.name,
          NOT: { id },
        },
      });

      if (existingCompany) {
        this.logger.warn(`Company with name ${updateCompanyDto.name} already exists`);
        throw new CompanyAlreadyExistsException();
      }
    }

    // Check if new INN already exists (if INN is being updated)
    if (updateCompanyDto.inn) {
      const existingCompanyByInn = await this.prisma.company.findFirst({
        where: { 
          inn: updateCompanyDto.inn,
          NOT: { id },
        },
      });

      if (existingCompanyByInn) {
        this.logger.warn(`Company with INN ${updateCompanyDto.inn} already exists`);
        throw new CompanyAlreadyExistsException();
      }
    }

    const company = await this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    });

    this.logger.log(`Company with id ${id} updated successfully`);
    return company;
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Removing company with id: ${id}`);

    // Check if company exists
    await this.findOne(id);

    await this.prisma.company.delete({
      where: { id },
    });

    this.logger.log(`Company with id ${id} removed successfully`);
  }
}