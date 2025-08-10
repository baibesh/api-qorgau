import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
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
import { AddMemberDto } from './dto/add-member.dto';
import { JoinBoardDto } from './dto/join-board.dto';
import { KanbanBoardMemberResponseDto } from './dto/kanban-board-member-response.dto';
import { UpdateKanbanBoardDto } from './dto/update-kanban-board.dto';

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
  findAll(@Req() req: any): Promise<KanbanBoardResponseDto[]> {
    return this.kanbanBoardService.findAll(req.user);
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
    @Req() req: any,
  ): Promise<KanbanBoardResponseDto> {
    return this.kanbanBoardService.findOne(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a kanban board' })
  @ApiParam({ name: 'id', type: Number, description: 'Board ID' })
  @ApiBody({ type: UpdateKanbanBoardDto })
  @ApiResponse({ status: 200, description: 'Board updated successfully', type: KanbanBoardResponseDto })
  @ApiResponse({ status: 404, description: 'Kanban board not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateKanbanBoardDto,
  ): Promise<KanbanBoardResponseDto> {
    return this.kanbanBoardService.update(id, dto);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add a user to the board members' })
  @ApiParam({ name: 'id', type: Number, description: 'Board ID' })
  @ApiBody({ type: AddMemberDto })
  @ApiResponse({ status: 201, description: 'User added to the board' })
  async addMember(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddMemberDto,
  ): Promise<{ message: string }> {
    await this.kanbanBoardService.addMember(id, dto.userId);
    return { message: 'User added to the board' };
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove a user from the board members' })
  @ApiParam({ name: 'id', type: Number, description: 'Board ID' })
  @ApiParam({ name: 'userId', type: Number, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User removed from the board' })
  async removeMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<{ message: string }> {
    await this.kanbanBoardService.removeMember(id, userId);
    return { message: 'User removed from the board' };
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get list of board members' })
  @ApiParam({ name: 'id', type: Number, description: 'Board ID' })
  @ApiResponse({ status: 200, type: [KanbanBoardMemberResponseDto] })
  listMembers(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<KanbanBoardMemberResponseDto[]> {
    return this.kanbanBoardService.listMembers(id);
  }

  @Post('join')
  @ApiOperation({ summary: 'Join a board by code' })
  @ApiBody({ type: JoinBoardDto })
  @ApiResponse({ status: 201, type: KanbanBoardResponseDto })
  join(
    @Body() dto: JoinBoardDto,
    @Req() req: any,
  ): Promise<KanbanBoardResponseDto> {
    return this.kanbanBoardService.joinByCode(dto.code, req.user.userId);
  }
}
