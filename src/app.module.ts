import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RegionModule } from './region/region.module';
import { ProjectTypeModule } from './project-type/project-type.module';
import { ProjectStatusModule } from './project-status/project-status.module';
import { CompanyModule } from './company/company.module';
import { EnumsModule } from './enums/enums.module';
import { AuthModule } from './auth/auth.module';
import { PermissionModule } from './permission/permission.module';
import { RoleModule } from './role/role.module';
import { UserModule } from './user/user.module';
import { ProjectsModule } from './projects/projects.module';
import { KanbanBoardModule } from './kanban-board/kanban-board.module';
import { KanbanColumnModule } from './kanban-column/kanban-column.module';
import { ProjectLogModule } from './project-log/project-log.module';
import { ProjectCommentModule } from './project-comment/project-comment.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    RegionModule,
    ProjectTypeModule,
    ProjectStatusModule,
    CompanyModule,
    EnumsModule,
    AuthModule,
    PermissionModule,
    RoleModule,
    UserModule,
    ProjectsModule,
    KanbanBoardModule,
    KanbanColumnModule,
    ProjectLogModule,
    ProjectCommentModule,
    FilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
