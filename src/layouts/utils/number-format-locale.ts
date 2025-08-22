import i18next from 'i18next';

import { allLangs, fallbackLng } from 'src/locales';

// ----------------------------------------------------------------------

export function formatNumberLocale() {
  const lng = i18next.resolvedLanguage ?? fallbackLng;

  const currentLang = allLangs.find((lang: { value: any }) => lang.value === lng);

  return { code: currentLang?.numberFormat.code, currency: currentLang?.numberFormat.currency };
}
