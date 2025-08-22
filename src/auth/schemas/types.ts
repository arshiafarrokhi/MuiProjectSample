import type { i18n, TFunction } from 'i18next';
import type { LanguageValue } from 'src/locales';



export type AuthTransProps = {
  t: TFunction<string, undefined>;
  i18n: i18n;
  onChangeLang: (newLang: LanguageValue) => Promise<void>;
  currentLang: {
    value: string;
    label: string;
    countryCode: string;
  };
};