import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { CompanyScopeGuard } from '../common/guards/company-scope.guard';

@Module({
  imports: [PrismaModule],
  controllers: [CompanyController],
  providers: [CompanyService, PermissionsGuard, CompanyScopeGuard],
  exports: [CompanyService],
})
export class CompanyModule {}