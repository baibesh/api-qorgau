import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionResponseDto } from './dto/permission-response.dto';

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<PermissionResponseDto> {
    this.logger.log(`Creating permission with name: ${createPermissionDto.name}`);

    const existingPermission = await this.prisma.permission.findFirst({
      where: { name: createPermissionDto.name },
    });

    if (existingPermission) {
      this.logger.warn(
        `Permission with name ${createPermissionDto.name} already exists`,
      );
      throw new ConflictException('Permission with this name already exists');
    }

    const permission = await this.prisma.permission.create({
      data: createPermissionDto,
      include: {
        rolePermissions: {
          include: {
            role: true,
          },
        },
      },
    });

    this.logger.log(`Permission created with id: ${permission.id}`);
    return this.mapToResponseDto(permission);
  }

  async findAll(): Promise<PermissionResponseDto[]> {
    this.logger.log('Fetching all permissions');
    const permissions = await this.prisma.permission.findMany({
      orderBy: { id: 'asc' },
      include: {
        rolePermissions: {
          include: {
            role: true,
          },
        },
      },
    });
    this.logger.log(`Found ${permissions.length} permissions`);
    return permissions.map(permission => this.mapToResponseDto(permission));
  }

  async findOne(id: number): Promise<PermissionResponseDto> {
    this.logger.log(`Fetching permission with id: ${id}`);
    const permission = await this.prisma.permission.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!permission) {
      this.logger.warn(`Permission with id ${id} not found`);
      throw new NotFoundException('Permission not found');
    }

    return this.mapToResponseDto(permission);
  }

  async update(
    id: number,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionResponseDto> {
    this.logger.log(`Updating permission with id: ${id}`);

    await this.findOne(id);

    if (updatePermissionDto.name) {
      const existingPermission = await this.prisma.permission.findFirst({
        where: {
          name: updatePermissionDto.name,
          NOT: { id },
        },
      });

      if (existingPermission) {
        this.logger.warn(
          `Permission with name ${updatePermissionDto.name} already exists`,
        );
        throw new ConflictException('Permission with this name already exists');
      }
    }

    const permission = await this.prisma.permission.update({
      where: { id },
      data: updatePermissionDto,
      include: {
        rolePermissions: {
          include: {
            role: true,
          },
        },
      },
    });

    this.logger.log(`Permission with id ${id} updated successfully`);
    return this.mapToResponseDto(permission);
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Removing permission with id: ${id}`);

    await this.findOne(id);

    // Check if permission is linked to any roles
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { permissionId: id },
      include: {
        role: true,
      },
    });

    if (rolePermissions.length > 0) {
      const roleNames = rolePermissions.map(rp => rp.role.name).join(', ');
      this.logger.warn(
        `Cannot delete permission with id ${id} - it is linked to roles: ${roleNames}`,
      );
      throw new ConflictException(
        `Cannot delete permission. It is linked to the following roles: ${roleNames}`,
      );
    }

    await this.prisma.permission.delete({
      where: { id },
    });

    this.logger.log(`Permission with id ${id} removed successfully`);
  }

  private mapToResponseDto(permission: any): PermissionResponseDto {
    return {
      id: permission.id,
      name: permission.name,
      description: permission.description,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
      roles: permission.rolePermissions.map((rp: any) => ({
        id: rp.role.id,
        name: rp.role.name,
        description: rp.role.description,
      })),
    };
  }
}