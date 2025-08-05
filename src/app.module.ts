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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
