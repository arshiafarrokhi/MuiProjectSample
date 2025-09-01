// src/utils/formatDate.ts
type FormatOpts = {
  calendar?: 'persian' | 'gregory'; // جلالی یا میلادی
  timeZone?: string; // پیشفرض: Asia/Tehran
  withTime?: boolean; // نشان دادن زمان
  hour12?: boolean; // 24 یا 12 ساعته
};

export function formatFaDate(
  iso: string | Date | number,
  {
    calendar = 'persian',
    timeZone = 'Asia/Tehran',
    withTime = true,
    hour12 = false,
  }: FormatOpts = {}
): string {
  const date = typeof iso === 'string' || typeof iso === 'number' ? new Date(iso) : iso;

  // نکته: اگر سرور زمان را بدون Z برگرداند (مثل "2025-08-24T01:18:53.837")
  // JS آن را "محلی" تفسیر می‌کند. اگر UTC است، بهتر است سرور Z اضافه کند
  // یا در اینجا timeZone را صراحتاً ست کنیم (که کردیم: Asia/Tehran).

  const base: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone,
  };

  const time: Intl.DateTimeFormatOptions = withTime
    ? { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12 }
    : {};

  // ارقام و زبان فارسی + تقویم انتخابی
  const locale = `fa-IR-u-ca-${calendar}`;

  try {
    return new Intl.DateTimeFormat(locale, { ...base, ...time }).format(date);
  } catch {
    // fallback ساده
    return date.toLocaleString('fa-IR');
  }
}
