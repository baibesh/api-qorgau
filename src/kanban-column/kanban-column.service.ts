import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKanbanColumnDto } from './dto/create-kanban-column.dto';
import { UpdateKanbanColumnDto } from './dto/update-kanban-column.dto';
import { KanbanColumnResponseDto } from './dto/kanban-column-response.dto';

@Injectable()
export class KanbanColumnService {
  private readonly logger = new Logger(KanbanColumnService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateKanbanColumnDto): Promise<KanbanColumnResponseDto> {
    this.logger.log(
      `Creating kanban column '${dto.name}' for board ${dto.boardId}`,
    );

    const board = await this.prisma.kanbanBoard.findUnique({
      where: { id: dto.boardId },
    });
    if (!board) {
      this.logger.warn(`Kanban board with id ${dto.boardId} not found`);
      throw new NotFoundException(
        `Kanban board with id ${dto.boardId} not found`,
      );
    }

    let position = dto.position;
    if (position === undefined || position === null) {
      const maxPos = await this.prisma.kanbanColumn.aggregate({
        where: { boardId: dto.boardId },
        _max: { position: true },
      });
      position = (maxPos._max.position ?? -1) + 1;
    }

    const column = await this.prisma.kanbanColumn.create({
      data: {
        boardId: dto.boardId,
        name: dto.name,
        position,
        color: dto.color ?? null,
        description: dto.description ?? null,
      },
    });

    this.logger.log(`Kanban column created with id: ${column.id}`);
    return column as unknown as KanbanColumnResponseDto;
  }

  async update(
    id: number,
    dto: UpdateKanbanColumnDto,
  ): Promise<KanbanColumnResponseDto> {
    this.logger.log(`Updating kanban column id: ${id}`);

    const existing = await this.prisma.kanbanColumn.findUnique({
      where: { id },
    });
    if (!existing) {
      this.logger.warn(`Kanban column with id ${id} not found`);
      throw new NotFoundException(`Kanban column with id ${id} not found`);
    }

    const column = await this.prisma.kanbanColumn.update({
      where: { id },
      data: { ...dto },
    });

    this.logger.log(`Kanban column id ${id} updated successfully`);
    return column as unknown as KanbanColumnResponseDto;
  }

  async findByBoard(boardId: number): Promise<KanbanColumnResponseDto[]> {
    this.logger.log(`Fetching columns for board id: ${boardId}`);

    const board = await this.prisma.kanbanBoard.findUnique({
      where: { id: boardId },
    });
    if (!board) {
      this.logger.warn(`Kanban board with id ${boardId} not found`);
      throw new NotFoundException(`Kanban board with id ${boardId} not found`);
    }

    const columns = await this.prisma.kanbanColumn.findMany({
      where: { boardId },
      orderBy: { position: 'asc' },
    });

    this.logger.log(`Found ${columns.length} columns for board ${boardId}`);
    return columns as unknown as KanbanColumnResponseDto[];
  }

  async reorder(
    items: { id: number; position: number }[],
    user: { userId: number; isAdmin: boolean },
  ): Promise<KanbanColumnResponseDto[]> {
    this.logger.log(`Reordering ${items.length} kanban columns`);

    if (!items || items.length === 0) {
      return [];
    }

    const ids = items.map((i) => i.id);

    const columns = await this.prisma.kanbanColumn.findMany({
      where: { id: { in: ids } },
      select: { id: true, boardId: true },
    });

    if (columns.length !== ids.length) {
      const foundIds = new Set(columns.map((c) => c.id));
      const missing = ids.filter((id) => !foundIds.has(id));
      this.logger.warn(`Some columns not found: ${missing.join(', ')}`);
      throw new NotFoundException('One or more columns not found');
    }

    const boardIds = Array.from(new Set(columns.map((c) => c.boardId)));
    if (boardIds.length !== 1) {
      throw new BadRequestException(
        'All columns to reorder must belong to the same board',
      );
    }
    const boardId = boardIds[0];

    if (!user.isAdmin) {
      const membership = await this.prisma.kanbanBoardMember.findFirst({
        where: { boardId, userId: user.userId },
        select: { id: true },
      });
      if (!membership) {
        this.logger.warn(
          `User ${user.userId} has no access to board ${boardId} for reorder`,
        );
        throw new ForbiddenException('Access denied to this board');
      }
    }

    await this.prisma.$transaction(
      items.map((i) =>
        this.prisma.kanbanColumn.update({
          where: { id: i.id },
          data: { position: i.position },
        }),
      ),
    );

    const updated = await this.prisma.kanbanColumn.findMany({
      where: { boardId },
      orderBy: { position: 'asc' },
    });

    return updated as unknown as KanbanColumnResponseDto[];
  }
}
