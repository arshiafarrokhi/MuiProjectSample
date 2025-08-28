// src/auth/utils.ts
import axiosInstance from 'src/lib/axios';
import { JWT_STORAGE_KEY } from './constant';

export async function setSession(accessToken: string | null) {
  try {
    if (accessToken) {
      sessionStorage.setItem(JWT_STORAGE_KEY, accessToken);
      // برای درخواست بعدی، اگر قبل از اجرای request-interceptor باشد
      axiosInstance.defaults.headers.common['api_access_token'] = accessToken;
      // اگر بک‌اند Authorization می‌خواهد:
      // axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } else {
      sessionStorage.removeItem(JWT_STORAGE_KEY);
      delete axiosInstance.defaults.headers.common['api_access_token'];
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  } catch (error) {
    console.error('Error during set session:', error);
    throw error;
  }
}
