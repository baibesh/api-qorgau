import { Injectable } from '@nestjs/common';
import { I18nService } from '../common/i18n/i18n.service';

@Injectable()
export class EnumsService {
  constructor(private readonly i18nService: I18nService) {}

  getUserStatuses(
    lang: string = 'ru',
  ): Array<{ value: string; label: string }> {
    return this.i18nService.getEnumTranslations('UserStatus', lang);
  }

  getRegistrationStatuses(
    lang: string = 'ru',
  ): Array<{ value: string; label: string }> {
    return this.i18nService.getEnumTranslations(
      'RegistrationInvitationStatus',
      lang,
    );
  }
}
