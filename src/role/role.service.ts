import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
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
      this.logger.warn(`Role with name ${createRoleDto.name} already exists`);
      throw new ConflictException('Role with this name already exists');
    }

    const { permissionIds, name, description } = createRoleDto;

    try {
      // Create role and link permissions within a transaction
      const createdRole = await this.prisma.$transaction(async (tx) => {
        const role = await tx.role.create({
          data: { name, description },
        });

        if (permissionIds && permissionIds.length > 0) {
          const uniqueIds = Array.from(new Set(permissionIds));
          await tx.rolePermission.createMany({
            data: uniqueIds.map((pid) => ({
              roleId: role.id,
              permissionId: pid,
            })),
            skipDuplicates: true,
          });
        }

        return role;
      });

      // Fetch with relations for response mapping
      const roleWithRelations = await this.prisma.role.findUnique({
        where: { id: createdRole.id },
        include: {
          rolePermissions: { include: { permission: true } },
          userRoles: { include: { user: true } },
        },
      });

      if (!roleWithRelations) {
        // Should not happen, but guard anyway
        throw new Error('Failed to load created role');
      }

      this.logger.log(`Role created with id: ${createdRole.id}`);
      return this.mapToResponseDto(roleWithRelations);
    } catch (e: any) {
      // Translate known Prisma errors
      if (e?.code === 'P2003') {
        // Foreign key constraint failed (likely invalid permissionId)
        throw new NotFoundException('One or more permissions not found');
      }
      throw e;
    }
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
    return roles.map((role) => this.mapToResponseDto(role));
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
        this.logger.warn(`Role with name ${updateRoleDto.name} already exists`);
        throw new ConflictException('Role with this name already exists');
      }
    }

    const { name, description, permissionIds } = updateRoleDto as any;

    try {
      await this.prisma.$transaction(async (tx) => {
        // Update scalar fields if provided
        if (name !== undefined || description !== undefined) {
          await tx.role.update({
            where: { id },
            data: {
              ...(name !== undefined ? { name } : {}),
              ...(description !== undefined ? { description } : {}),
            },
          });
        }

        // Update permissions if provided: replace existing set
        if (permissionIds !== undefined) {
          const uniqueIds: number[] = Array.from(new Set(permissionIds ?? []));
          // Remove all existing links
          await tx.rolePermission.deleteMany({ where: { roleId: id } });
          // Re-create provided links
          if (uniqueIds.length > 0) {
            await tx.rolePermission.createMany({
              data: uniqueIds.map((pid) => ({ roleId: id, permissionId: pid })),
              skipDuplicates: true,
            });
          }
        }
      });

      // Load updated role with relations
      const role = await this.prisma.role.findUnique({
        where: { id },
        include: {
          rolePermissions: { include: { permission: true } },
          userRoles: { include: { user: true } },
        },
      });

      if (!role) {
        this.logger.error(`Role with id ${id} not found after update`);
        throw new NotFoundException('Role not found');
      }

      this.logger.log(`Role with id ${id} updated successfully`);
      return this.mapToResponseDto(role);
    } catch (e: any) {
      if (e?.code === 'P2003') {
        throw new NotFoundException('One or more permissions not found');
      }
      throw e;
    }
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

    this.logger.log(
      `Role with id ${id} and its relationships removed successfully`,
    );
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
