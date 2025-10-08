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

  async findAll(type?: string): Promise<CompanyResponseDto[]> {
    this.logger.log(`Fetching companies${type ? ` with type: ${type}` : ''}`);

    const where = type ? { type: type as any } : {};

    const companies = await this.prisma.company.findMany({
      where,
      orderBy: { id: 'asc' },
      include: {
        region: { select: { name: true } },
        createdBy: { select: { full_name: true } },
        approvedBy: { select: { full_name: true } },
      },
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

  async getCompanyUsers(companyId: number) {
    this.logger.log(`Fetching users for company ${companyId}`);

    // Verify company exists
    await this.findOne(companyId);

    const users = await this.prisma.user.findMany({
      where: {
        profile: {
          companyId: companyId,
        },
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        status: true,
        phone: true,
        registered_at: true,
        last_login: true,
        profile: {
          select: {
            position: true,
            avatar: true,
          },
        },
        userRoles: {
          select: {
            role: {
              select: {
                name: true,
                description: true,
              },
            },
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    this.logger.log(`Found ${users.length} users for company ${companyId}`);
    return users;
  }

  async createInvitation(
    companyId: number,
    email: string,
    invitedBy: number,
  ) {
    this.logger.log(
      `Creating invitation for ${email} to company ${companyId}`,
    );

    // Verify company exists
    await this.findOne(companyId);

    // Get COMPANY_USER role
    const companyUserRole = await this.prisma.role.findUnique({
      where: { name: 'COMPANY_USER' },
    });

    if (!companyUserRole) {
      throw new Error('COMPANY_USER role not found');
    }

    // Check if invitation already exists for this email
    const existingInvitation =
      await this.prisma.registrationInvitation.findFirst({
        where: {
          email,
          status: 'PENDING',
        },
      });

    if (existingInvitation) {
      this.logger.warn(`Active invitation already exists for ${email}`);
      throw new Error('Active invitation already exists for this email');
    }

    // Generate unique code
    const code = `COMPANY-${companyId}-${Date.now().toString(36).toUpperCase()}`;

    const invitation = await this.prisma.registrationInvitation.create({
      data: {
        email,
        code,
        status: 'PENDING',
        invited_by: invitedBy,
        role_id: companyUserRole.id,
        companyId: companyId,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      include: {
        role: { select: { name: true } },
        company: { select: { name: true } },
      },
    });

    this.logger.log(`Invitation created with code: ${invitation.code}`);
    return invitation;
  }

  async deactivateUser(companyId: number, userId: number) {
    this.logger.log(`Deactivating user ${userId} from company ${companyId}`);

    // Verify company exists
    await this.findOne(companyId);

    // Verify user belongs to this company
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        profile: {
          companyId: companyId,
        },
      },
      include: {
        profile: { select: { companyId: true } },
      },
    });

    if (!user) {
      this.logger.warn(
        `User ${userId} not found or does not belong to company ${companyId}`,
      );
      throw new Error('User not found or does not belong to this company');
    }

    // Update user status to INACTIVE
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { status: 'INACTIVE' },
      select: {
        id: true,
        email: true,
        full_name: true,
        status: true,
      },
    });

    this.logger.log(`User ${userId} deactivated successfully`);
    return updatedUser;
  }
}