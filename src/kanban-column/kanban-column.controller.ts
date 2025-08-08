import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
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
import { KanbanColumnService } from './kanban-column.service';
import { CreateKanbanColumnDto } from './dto/create-kanban-column.dto';
import { UpdateKanbanColumnDto } from './dto/update-kanban-column.dto';
import { KanbanColumnResponseDto } from './dto/kanban-column-response.dto';

@ApiTags('kanban-columns')
@Controller('kanban-columns')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class KanbanColumnController {
  constructor(private readonly kanbanColumnService: KanbanColumnService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new kanban column' })
  @ApiBody({ type: CreateKanbanColumnDto })
  @ApiResponse({
    status: 201,
    description: 'Kanban column created successfully',
    type: KanbanColumnResponseDto,
  })
  create(@Body() dto: CreateKanbanColumnDto): Promise<KanbanColumnResponseDto> {
    return this.kanbanColumnService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Rename or change position of a kanban column' })
  @ApiParam({ name: 'id', type: Number, description: 'Column ID' })
  @ApiBody({ type: UpdateKanbanColumnDto })
  @ApiResponse({
    status: 200,
    description: 'Kanban column updated successfully',
    type: KanbanColumnResponseDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateKanbanColumnDto,
  ): Promise<KanbanColumnResponseDto> {
    return this.kanbanColumnService.update(id, dto);
  }

  @Get(':boardId')
  @ApiOperation({ summary: 'Get columns for a specific kanban board' })
  @ApiParam({ name: 'boardId', type: Number, description: 'Board ID' })
  @ApiResponse({
    status: 200,
    description: 'Columns retrieved successfully',
    type: [KanbanColumnResponseDto],
  })
  findByBoard(
    @Param('boardId', ParseIntPipe) boardId: number,
  ): Promise<KanbanColumnResponseDto[]> {
    return this.kanbanColumnService.findByBoard(boardId);
  }
}
