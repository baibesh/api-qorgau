import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export interface UserFilters {
  status?: UserStatus;
  region_id?: number;
  email?: string;
  phone?: string;
}

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Check if user with this email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(createUserDto.password, saltRounds);

    const { password, roleIds, ...userData } = createUserDto as any;

    const user = await this.prisma.user.create({
      data: {
        ...userData,
        password_hash,
        ...(Array.isArray(roleIds) && roleIds.length > 0
          ? {
              userRoles: {
                create: roleIds.map((roleId: number) => ({ roleId })),
              },
            }
          : {}),
      },
      include: {
        region: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    return this.formatUserResponse(user);
  }

  async findAll(filters: UserFilters = {}) {
    const where: any = {
      isDeleted: false,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.region_id) {
      where.region_id = filters.region_id;
    }

    if (filters.email) {
      where.email = {
        contains: filters.email,
        mode: 'insensitive',
      };
    }

    if (filters.phone) {
      where.phone = {
        contains: filters.phone,
      };
    }

    const users = await this.prisma.user.findMany({
      where,
      include: {
        region: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: {
        registered_at: 'desc',
      },
    });

    return users.map(user => this.formatUserResponse(user));
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        region: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.formatUserResponse(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // Check if user exists and is not deleted
    const existingUser = await this.prisma.user.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if email is being updated and if it's already taken
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (emailExists) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const { roleIds, ...data } = updateUserDto as any;

    // Update basic fields first
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
    });

    // If roleIds provided, sync roles
    if (Array.isArray(roleIds)) {
      const currentUserRoles = await this.prisma.userRole.findMany({
        where: { userId: id },
        select: { roleId: true },
      });
      const currentRoleIds = new Set(currentUserRoles.map((ur) => ur.roleId));
      const desiredRoleIds = new Set(roleIds);

      const toDelete: number[] = [];
      currentRoleIds.forEach((rid) => { if (!desiredRoleIds.has(rid)) toDelete.push(rid); });

      const toCreate: number[] = [];
      desiredRoleIds.forEach((rid) => { if (!currentRoleIds.has(rid)) toCreate.push(rid); });

      await this.prisma.$transaction([
        ...(toDelete.length ? [
          this.prisma.userRole.deleteMany({ where: { userId: id, roleId: { in: toDelete } } }),
        ] : []),
        ...(toCreate.length ? [
          this.prisma.userRole.createMany({ data: toCreate.map((roleId) => ({ userId: id, roleId })) }),
        ] : []),
      ]);
    }

    // Return user with relations
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        region: true,
        userRoles: { include: { role: true } },
      },
    });

    return this.formatUserResponse(user);
  }

  async remove(id: number) {
    // Check if user exists and is not deleted
    const existingUser = await this.prisma.user.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Soft delete - set isDeleted to true
    await this.prisma.user.update({
      where: { id },
      data: { isDeleted: true },
    });

    return { message: 'User successfully deleted' };
  }

  async getProfile(userId: number) {
    this.logger.log(`Fetching profile for user ${userId}`);
    const user = await this.prisma.user.findFirst({ where: { id: userId, isDeleted: false } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    const profile = await this.prisma.userProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException(`Profile for user ${userId} not found`);
    }
    return profile;
  }

  async updateProfile(userId: number, data: Partial<{ companyId?: number; position?: string; avatar?: string; address?: string }>) {
    this.logger.log(`Updating profile for user ${userId}`);
    const user = await this.prisma.user.findFirst({ where: { id: userId, isDeleted: false } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Upsert profile
    const profile = await this.prisma.userProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
    return profile;
  }

  async getStats() {
    this.logger.log('Gathering users stats');
    const [users, projects, roles, companies] = await Promise.all([
      this.prisma.user.count({ where: { isDeleted: false } }),
      this.prisma.project.count(),
      this.prisma.role.count(),
      this.prisma.company.count(),
    ]);
    return {
      users,
      projects,
      roles,
      companies,
    };
  }

  async search(q: string) {
    this.logger.log(`Universal search: ${q}`);
    const term = q?.trim();
    if (!term) return { users: [], projects: [], companies: [] };

    const [users, projects, companies] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          isDeleted: false,
          OR: [
            { email: { contains: term, mode: 'insensitive' } },
            { full_name: { contains: term, mode: 'insensitive' } },
            { phone: { contains: term } },
          ],
        },
        take: 20,
        orderBy: { registered_at: 'desc' },
        select: { id: true, email: true, full_name: true, phone: true },
      }),
      this.prisma.project.findMany({
        where: { name: { contains: term, mode: 'insensitive' } },
        take: 20,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, code: true, companyId: true },
      }),
      this.prisma.company.findMany({
        where: { name: { contains: term, mode: 'insensitive' } },
        take: 20,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, inn: true },
      }),
    ]);

    return { users, projects, companies };
  }

  private formatUserResponse(user: any) {
    const { password_hash, refreshToken, isDeleted, ...userWithoutSensitiveData } = user;

    return {
      ...userWithoutSensitiveData,
      roles: user.userRoles?.map(userRole => ({
        id: userRole.role.id,
        name: userRole.role.name,
        description: userRole.role.description,
      })) || [],
    };
  }
}