import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKanbanBoardDto } from './dto/create-kanban-board.dto';
import { KanbanBoardResponseDto } from './dto/kanban-board-response.dto';

@Injectable()
export class KanbanBoardService {
  private readonly logger = new Logger(KanbanBoardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<KanbanBoardResponseDto[]> {
    this.logger.log('Fetching all kanban boards');
    const boards = await this.prisma.kanbanBoard.findMany({
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
      data: { name: dto.name },
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

  async findOne(id: number): Promise<KanbanBoardResponseDto> {
    this.logger.log(`Fetching kanban board with id: ${id}`);
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
}
