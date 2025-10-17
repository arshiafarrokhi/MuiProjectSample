import axios from 'axios';

import axiosInstance from 'src/lib/axios';

import { JWT_STORAGE_KEY } from './constant';

function applyAuthHeaders(accessToken: string | null) {
  const authValue = accessToken ? `Bearer ${accessToken}` : null;

  const update = (headers: any) => {
    if (!headers) return;

    const hasMutators = typeof headers.set === 'function' && typeof headers.delete === 'function';

    if (hasMutators) {
      if (accessToken) {
        headers.set('Authorization', authValue);
        headers.set('api_access_token', accessToken);
      } else {
        headers.delete('Authorization');
        headers.delete('api_access_token');
      }
      return;
    }

    if (accessToken) {
      headers.Authorization = authValue;
      headers.api_access_token = accessToken;
    } else {
      delete headers.Authorization;
      delete headers.api_access_token;
    }
  };

  update(axios.defaults.headers);
  update((axios.defaults.headers as any)?.common);
  update(axiosInstance.defaults.headers);
  update((axiosInstance.defaults.headers as any)?.common);
}

export async function setSession(accessToken: string | null) {
  try {
    applyAuthHeaders(accessToken);

    if (typeof window === 'undefined') return;

    if (accessToken) {
      localStorage.setItem(JWT_STORAGE_KEY, accessToken);
    } else {
      localStorage.removeItem(JWT_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Error during setSession:', err);
  }
}
