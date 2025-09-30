import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Req,
  UseGuards,
  ParseArrayPipe,
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
import { ColumnOrderDto } from './dto/reorder-kanban-columns.dto';

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

  @Patch('reorder')
  @ApiOperation({
    summary: 'Reorder kanban columns by updating their positions',
  })
  @ApiBody({ type: [ColumnOrderDto] })
  @ApiResponse({
    status: 200,
    description: 'Columns reordered successfully',
    type: [KanbanColumnResponseDto],
  })
  reorder(
    @Body(new ParseArrayPipe({ items: ColumnOrderDto }))
    items: ColumnOrderDto[],
    @Req() req: any,
  ): Promise<KanbanColumnResponseDto[]> {
    return this.kanbanColumnService.reorder(items, req.user);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update kanban column fields (name, position, color, description)',
  })
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

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a kanban column by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Column ID' })
  @ApiResponse({ status: 200, description: 'Column deleted successfully' })
  @ApiResponse({ status: 404, description: 'Kanban column not found' })
  @ApiResponse({
    status: 403,
    description: 'Access denied to this board',
  })
  @ApiResponse({
    status: 409,
    description: 'Cannot delete column that contains projects',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<{ message: string }> {
    await this.kanbanColumnService.remove(id, req.user);
    return { message: 'Column deleted successfully' };
  }
}
