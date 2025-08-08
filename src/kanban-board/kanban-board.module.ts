import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { KanbanBoardService } from './kanban-board.service';
import { KanbanBoardController } from './kanban-board.controller';

@Module({
  imports: [PrismaModule],
  controllers: [KanbanBoardController],
  providers: [KanbanBoardService],
  exports: [KanbanBoardService],
})
export class KanbanBoardModule {}
