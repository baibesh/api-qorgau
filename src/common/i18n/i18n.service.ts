import { Injectable } from '@nestjs/common';

export interface TranslationMap {
  [key: string]: {
    ru: string;
    en: string;
    kk: string;
  };
}

@Injectable()
export class I18nService {
  private readonly translations: { [enumName: string]: TranslationMap } = {
    UserStatus: {
      ACTIVE: {
        ru: 'Активный',
        en: 'Active',
        kk: 'Белсенді',
      },
      INACTIVE: {
        ru: 'Неактивный',
        en: 'Inactive',
        kk: 'Белсенді емес',
      },
      SUSPENDED: {
        ru: 'Заблокированный',
        en: 'Suspended',
        kk: 'Бұғатталған',
      },
      PENDING: {
        ru: 'Ожидает',
        en: 'Pending',
        kk: 'Күтуде',
      },
    },
    RegistrationInvitationStatus: {
      PENDING: {
        ru: 'Ожидает',
        en: 'Pending',
        kk: 'Күтуде',
      },
      ACCEPTED: {
        ru: 'Принято',
        en: 'Accepted',
        kk: 'Қабылданды',
      },
      EXPIRED: {
        ru: 'Истекло',
        en: 'Expired',
        kk: 'Мерзімі өтті',
      },
      CANCELLED: {
        ru: 'Отменено',
        en: 'Cancelled',
        kk: 'Бас тартылды',
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
