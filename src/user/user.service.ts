import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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

    const { password, ...userData } = createUserDto;

    const user = await this.prisma.user.create({
      data: {
        ...userData,
        password_hash,
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

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
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