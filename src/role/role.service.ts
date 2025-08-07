import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleResponseDto } from './dto/role-response.dto';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    this.logger.log(`Creating role with name: ${createRoleDto.name}`);

    const existingRole = await this.prisma.role.findFirst({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      this.logger.warn(
        `Role with name ${createRoleDto.name} already exists`,
      );
      throw new ConflictException('Role with this name already exists');
    }

    const role = await this.prisma.role.create({
      data: createRoleDto,
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        userRoles: {
          include: {
            user: true,
          },
        },
      },
    });

    this.logger.log(`Role created with id: ${role.id}`);
    return this.mapToResponseDto(role);
  }

  async findAll(): Promise<RoleResponseDto[]> {
    this.logger.log('Fetching all roles');
    const roles = await this.prisma.role.findMany({
      orderBy: { id: 'asc' },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        userRoles: {
          include: {
            user: true,
          },
        },
      },
    });
    this.logger.log(`Found ${roles.length} roles`);
    return roles.map(role => this.mapToResponseDto(role));
  }

  async findOne(id: number): Promise<RoleResponseDto> {
    this.logger.log(`Fetching role with id: ${id}`);
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        userRoles: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!role) {
      this.logger.warn(`Role with id ${id} not found`);
      throw new NotFoundException('Role not found');
    }

    return this.mapToResponseDto(role);
  }

  async update(
    id: number,
    updateRoleDto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    this.logger.log(`Updating role with id: ${id}`);

    await this.findOne(id);

    if (updateRoleDto.name) {
      const existingRole = await this.prisma.role.findFirst({
        where: {
          name: updateRoleDto.name,
          NOT: { id },
        },
      });

      if (existingRole) {
        this.logger.warn(
          `Role with name ${updateRoleDto.name} already exists`,
        );
        throw new ConflictException('Role with this name already exists');
      }
    }

    const role = await this.prisma.role.update({
      where: { id },
      data: updateRoleDto,
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        userRoles: {
          include: {
            user: true,
          },
        },
      },
    });

    this.logger.log(`Role with id ${id} updated successfully`);
    return this.mapToResponseDto(role);
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Removing role with id: ${id}`);

    await this.findOne(id);

    // Delete related RolePermission and UserRole records first
    // This ensures we only delete the relationships, not the actual Permission and User records
    await this.prisma.$transaction(async (prisma) => {
      // Delete RolePermission relationships
      await prisma.rolePermission.deleteMany({
        where: { roleId: id },
      });

      // Delete UserRole relationships
      await prisma.userRole.deleteMany({
        where: { roleId: id },
      });

      // Delete the role itself
      await prisma.role.delete({
        where: { id },
      });
    });

    this.logger.log(`Role with id ${id} and its relationships removed successfully`);
  }

  private mapToResponseDto(role: any): RoleResponseDto {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      createdBy: role.createdBy,
      permissions: role.rolePermissions.map((rp: any) => ({
        id: rp.permission.id,
        name: rp.permission.name,
        description: rp.permission.description,
      })),
      users: role.userRoles.map((ur: any) => ({
        id: ur.user.id,
        name: ur.user.name,
        email: ur.user.email,
      })),
    };
  }
}