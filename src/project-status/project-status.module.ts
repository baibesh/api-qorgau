import { Module } from '@nestjs/common';
import { ProjectStatusService } from './project-status.service';
import { ProjectStatusController } from './project-status.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectStatusController],
  providers: [ProjectStatusService],
  exports: [ProjectStatusService],
})
export class ProjectStatusModule {}