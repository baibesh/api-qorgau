import { Module } from '@nestjs/common';
import { ProjectLogController } from './project-log.controller';
import { ProjectLogService } from './project-log.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectLogController],
  providers: [ProjectLogService],
})
export class ProjectLogModule {}
