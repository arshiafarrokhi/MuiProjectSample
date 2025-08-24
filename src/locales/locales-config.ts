// ----------------------------------------------------------------------

export const fallbackLng = 'fa';
export const languages = ['fa', 'en'];
export const defaultNS = 'common';

export type LanguageValue = (typeof languages)[number];

// ----------------------------------------------------------------------

export function i18nOptions(lng = fallbackLng, ns = defaultNS) {
  return {
    debug: true,
    lng,
    fallbackLng,
    ns,
    defaultNS,
    fallbackNS: defaultNS,
    supportedLngs: languages,
  };
}

// ----------------------------------------------------------------------

// export const changeLangMessages: Record<
//   LanguageValue,
//   { success: string; error: string; loading: string }
// > = {
//   en: {
//     success: 'Language has been changed!',
//     error: 'Error changing language!',
//     loading: 'Loading...',
//   },
//   fa: {
//     success: 'Ngôn ngữ đã được thay đổi!',
//     error: 'Lỗi khi thay đổi ngôn ngữ!',
//     loading: 'Đang tải...',
//   },
// };

export const changeLangMessages: Record<
  LanguageValue,
  { success: string; error: string; loading: string }
> = {
  en: {
    success: 'Language has been changed!',
    error: 'Error changing language!',
    loading: 'Loading...',
  },
  fa: {
    success: 'زبان تغییر یافت!',
    error: 'خطا در تغییر زبان!',
    loading: 'در حال بارگذاری...',
  },
};
