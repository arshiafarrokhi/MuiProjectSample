// src/auth/utils.ts
import { JWT_STORAGE_KEY } from './constant';

export async function setSession(accessToken: string | null) {
  // فقط مدیریت استوریج؛ اصلاً هدر پیش‌فرض ست نکن
  try {
    if (typeof window === 'undefined') return;

    if (accessToken) {
      sessionStorage.setItem(JWT_STORAGE_KEY, accessToken);
    } else {
      sessionStorage.removeItem(JWT_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Error during setSession:', err);
  }
}
