import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKanbanBoardDto } from './dto/create-kanban-board.dto';
import { KanbanBoardResponseDto } from './dto/kanban-board-response.dto';
import { KanbanBoardMemberResponseDto } from './dto/kanban-board-member-response.dto';
import { nanoid } from 'nanoid';

interface RequestUser {
  userId: number;
  isAdmin: boolean;
}

@Injectable()
export class KanbanBoardService {
  private readonly logger = new Logger(KanbanBoardService.name);

  constructor(private readonly prisma: PrismaService) {}

  private generateBoardCode(): string {
    return nanoid(10);
  }

  async findAll(user: RequestUser): Promise<KanbanBoardResponseDto[]> {
    this.logger.log('Fetching kanban boards with access filter');
    const where = user.isAdmin
      ? {}
      : { members: { some: { userId: user.userId } } };
    const boards = await this.prisma.kanbanBoard.findMany({
      where,
      include: {
        columns: {
          orderBy: { position: 'asc' },
          select: { id: true, name: true, position: true },
        },
      },
      orderBy: { id: 'asc' },
    });
    this.logger.log(`Found ${boards.length} kanban boards`);
    return boards as unknown as KanbanBoardResponseDto[];
  }

  async create(dto: CreateKanbanBoardDto): Promise<KanbanBoardResponseDto> {
    this.logger.log(`Creating kanban board: ${dto.name}`);
    const board = await this.prisma.kanbanBoard.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        code: this.generateBoardCode(),
      },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          select: { id: true, name: true, position: true },
        },
      },
    });
    this.logger.log(`Kanban board created with id: ${board.id}`);
    return board as unknown as KanbanBoardResponseDto;
  }

  async findOne(
    id: number,
    user: RequestUser,
  ): Promise<KanbanBoardResponseDto> {
    this.logger.log(`Fetching kanban board with id: ${id}`);

    if (!user.isAdmin) {
      const isMember = await this.prisma.kanbanBoardMember.findFirst({
        where: { boardId: id, userId: user.userId },
        select: { id: true },
      });
      if (!isMember) {
        throw new ForbiddenException('Access denied to this board');
      }
    }

    const board = await this.prisma.kanbanBoard.findUnique({
      where: { id },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          select: { id: true, name: true, position: true },
        },
      },
    });
    if (!board) {
      this.logger.warn(`Kanban board with id ${id} not found`);
      throw new NotFoundException(`Kanban board with id ${id} not found`);
    }
    return board as unknown as KanbanBoardResponseDto;
  }

  async addMember(boardId: number, userId: number): Promise<void> {
    this.logger.log(`Adding user ${userId} to board ${boardId}`);
    const board = await this.prisma.kanbanBoard.findUnique({
      where: { id: boardId },
      select: { id: true },
    });
    if (!board) throw new NotFoundException('Board not found');

    try {
      await this.prisma.kanbanBoardMember.create({ data: { boardId, userId } });
    } catch (e: any) {
      // Unique constraint violation (already a member)
      throw new ConflictException('User is already a member of this board');
    }
  }

  async removeMember(boardId: number, userId: number): Promise<void> {
    this.logger.log(`Removing user ${userId} from board ${boardId}`);
    const existing = await this.prisma.kanbanBoardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Membership not found');
    await this.prisma.kanbanBoardMember.delete({
      where: { boardId_userId: { boardId, userId } },
    });
  }

  async listMembers(boardId: number): Promise<KanbanBoardMemberResponseDto[]> {
    this.logger.log(`Listing members for board ${boardId}`);
    const members = await this.prisma.kanbanBoardMember.findMany({
      where: { boardId },
      select: {
        user: { select: { id: true, email: true, full_name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    return members.map((m) => m.user) as KanbanBoardMemberResponseDto[];
  }

  async joinByCode(
    code: string,
    currentUserId: number,
  ): Promise<KanbanBoardResponseDto> {
    this.logger.log(`User ${currentUserId} joining board by code`);
    const board = await this.prisma.kanbanBoard.findUnique({
      where: { code },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          select: { id: true, name: true, position: true },
        },
      },
    });
    if (!board) throw new NotFoundException('Board not found');

    await this.prisma.kanbanBoardMember.upsert({
      where: { boardId_userId: { boardId: board.id, userId: currentUserId } },
      update: {},
      create: { boardId: board.id, userId: currentUserId },
    });

    return board as unknown as KanbanBoardResponseDto;
  }
}
