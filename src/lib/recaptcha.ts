// src/lib/recaptcha.ts
declare global {
  interface Window {
    grecaptcha?: any;
  }
}

const SITE_KEY = '6Le-YMIrAAAAAPUCgXiCprsOQKqAVApCNgix9x62';

function loadIfNeeded(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.grecaptcha?.enterprise) return Promise.resolve();

  // اگر اسکریپت را در index.html گذاشته باشی، معمولاً لازم نیست.
  // ولی اگر نبود، اینجا به صورت تنبل لودش می‌کنیم.
  return new Promise((resolve) => {
    const exists = document.querySelector(
      `script[src*="https://www.google.com/recaptcha/enterprise.js"]`
    );
    if (exists) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = `https://www.google.com/recaptcha/enterprise.js?render=${SITE_KEY}`;
    s.async = true;
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
}

export async function getRecaptchaToken(action: string): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  await loadIfNeeded();

  // آماده‌شدن enterprise
  if (!window.grecaptcha?.enterprise) return null;

  return new Promise<string | null>((resolve) => {
    window.grecaptcha.enterprise.ready(async () => {
      try {
        const token = await window.grecaptcha.enterprise.execute(SITE_KEY, { action });
        resolve(token || null);
      } catch {
        resolve(null);
      }
    });
  });
}
