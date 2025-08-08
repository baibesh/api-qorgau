import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProjectCommentService } from './project-comment.service';
import { ProjectCommentController } from './project-comment.controller';

@Module({
  imports: [PrismaModule],
  providers: [ProjectCommentService],
  controllers: [ProjectCommentController],
})
export class ProjectCommentModule {}
