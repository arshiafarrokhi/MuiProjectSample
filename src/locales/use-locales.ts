import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { toast } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';

import { allLangs } from './all-langs';
import { fallbackLng, changeLangMessages as messages } from './locales-config';

import type { LanguageValue } from './locales-config';

// ----------------------------------------------------------------------

export function useTranslate(ns?: string) {
  const settings = useSettingsContext();
  const { t, i18n } = useTranslation(ns);

  const fallback = allLangs.filter((lang) => lang.value === fallbackLng)[0];

  const currentLang = allLangs.find((lang) => lang.value === i18n.resolvedLanguage);

  const onChangeLang = useCallback(
    async (newLang: LanguageValue) => {
      if (newLang === currentLang?.value) {
        return;
      }

      try {
        const langChangePromise = i18n.changeLanguage(newLang);

        const currentMessages = messages[newLang] || messages.en;

        toast.promise(langChangePromise, {
          loading: currentMessages.loading,
          success: () => currentMessages.success,
          error: currentMessages.error,
        });

        // change direction only if the language changes
        if (newLang === 'fa') {
          settings.setState({ direction: 'rtl' });
        } else {
          settings.setState({ direction: 'ltr' });
        }

        // if (currentLang) {
        //   dayjs.locale(currentLang.adapterLocale);
        // }
      } catch (error) {
        console.error(error);
      }
    },
    [i18n, currentLang, settings]
  );

  return {
    t,
    i18n,
    onChangeLang,
    currentLang: currentLang ?? fallback,
  };
}
