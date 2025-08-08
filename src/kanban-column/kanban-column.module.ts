import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { KanbanColumnService } from './kanban-column.service';
import { KanbanColumnController } from './kanban-column.controller';

@Module({
  imports: [PrismaModule],
  controllers: [KanbanColumnController],
  providers: [KanbanColumnService],
  exports: [KanbanColumnService],
})
export class KanbanColumnModule {}
