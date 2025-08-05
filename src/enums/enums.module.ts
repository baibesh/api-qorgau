import { Module } from '@nestjs/common';
import { EnumsController } from './enums.controller';
import { EnumsService } from './enums.service';
import { I18nModule } from '../common/i18n/i18n.module';

@Module({
  imports: [I18nModule],
  controllers: [EnumsController],
  providers: [EnumsService],
  exports: [EnumsService],
})
export class EnumsModule {}
