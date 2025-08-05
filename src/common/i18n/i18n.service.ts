import { Injectable } from '@nestjs/common';

export interface TranslationMap {
  [key: string]: {
    ru: string;
    en: string;
  };
}

@Injectable()
export class I18nService {
  private readonly translations: { [enumName: string]: TranslationMap } = {
    UserStatus: {
      ACTIVE: {
        ru: 'Активный',
        en: 'Active',
      },
      INACTIVE: {
        ru: 'Неактивный',
        en: 'Inactive',
      },
      SUSPENDED: {
        ru: 'Заблокированный',
        en: 'Suspended',
      },
      PENDING: {
        ru: 'Ожидает',
        en: 'Pending',
      },
    },
    RegistrationInvitationStatus: {
      PENDING: {
        ru: 'Ожидает',
        en: 'Pending',
      },
      ACCEPTED: {
        ru: 'Принято',
        en: 'Accepted',
      },
      EXPIRED: {
        ru: 'Истекло',
        en: 'Expired',
      },
      CANCELLED: {
        ru: 'Отменено',
        en: 'Cancelled',
      },
    },
  };

  translateEnum(
    enumName: string,
    enumValue: string,
    lang: string = 'ru',
  ): string {
    const enumTranslations = this.translations[enumName];
    if (!enumTranslations) {
      return enumValue;
    }

    const translation = enumTranslations[enumValue];
    if (!translation) {
      return enumValue;
    }

    return (
      translation[lang as keyof typeof translation] ||
      translation.ru ||
      enumValue
    );
  }

  getEnumTranslations(
    enumName: string,
    lang: string = 'ru',
  ): Array<{ value: string; label: string }> {
    const enumTranslations = this.translations[enumName];
    if (!enumTranslations) {
      return [];
    }

    return Object.keys(enumTranslations).map((key) => ({
      value: key,
      label: this.translateEnum(enumName, key, lang),
    }));
  }
}
