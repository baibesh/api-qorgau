import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { KanbanBoardService } from './kanban-board.service';
import { CreateKanbanBoardDto } from './dto/create-kanban-board.dto';
import { KanbanBoardResponseDto } from './dto/kanban-board-response.dto';

@ApiTags('kanban-boards')
@Controller('kanban-boards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class KanbanBoardController {
  constructor(private readonly kanbanBoardService: KanbanBoardService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of kanban boards' })
  @ApiResponse({
    status: 200,
    description: 'Boards retrieved successfully',
    type: [KanbanBoardResponseDto],
  })
  findAll(): Promise<KanbanBoardResponseDto[]> {
    return this.kanbanBoardService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new kanban board' })
  @ApiBody({ type: CreateKanbanBoardDto })
  @ApiResponse({
    status: 201,
    description: 'Board created successfully',
    type: KanbanBoardResponseDto,
  })
  create(@Body() dto: CreateKanbanBoardDto): Promise<KanbanBoardResponseDto> {
    return this.kanbanBoardService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get kanban board by ID (detailed)' })
  @ApiParam({ name: 'id', type: Number, description: 'Board ID' })
  @ApiResponse({
    status: 200,
    description: 'Board retrieved successfully',
    type: KanbanBoardResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Kanban board not found' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<KanbanBoardResponseDto> {
    return this.kanbanBoardService.findOne(id);
  }
}
