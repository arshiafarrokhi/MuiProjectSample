import type { AxiosRequestConfig } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

import axios from 'axios';
import { JWT_STORAGE_KEY } from 'src/auth/context/jwt';

import { CONFIG } from 'src/global-config';
import { AxiosHeaders } from 'axios';

// ----------------------------------------------------------------------

const LOGIN_PATH = '/auth/login'; // مسیر صفحه لاگین خودت رو بگذار (قبلی‌تون paths.auth.jwt.signIn بود)

const axiosInstance = axios.create({ baseURL: CONFIG.serverUrl });

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = sessionStorage.getItem(JWT_STORAGE_KEY);

  config.headers = new AxiosHeaders(config.headers); // ← کلید حل خطای تایپی

  if (token) {
    (config.headers as AxiosHeaders).set('api_access_token', token);
  } else {
    (config.headers as AxiosHeaders).delete('api_access_token');
    (config.headers as AxiosHeaders).delete('Authorization');
  }

  return config;
});

// پاسخ‌ها: اگر 401 بود، توکن را پاک کن و بفرست لاگین
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      try {
        sessionStorage.removeItem(JWT_STORAGE_KEY);
      } catch {}
      // جلوگیری از لوپ: اگر الان خودِ لاگین هستیم یا API لاگین بوده، ریدایرکت نکن
      const url = error?.config?.url || '';
      const onAuthPage =
        typeof window !== 'undefined' && window.location.pathname.includes('/auth');
      const isLoginCall = url.includes('/users/login') || url.includes('/auth/sign-in');

      if (typeof window !== 'undefined' && !onAuthPage && !isLoginCall) {
        window.location.replace(LOGIN_PATH);
      }
    }

    // خطای خواناتر برگردان
    const message = error?.response?.data || 'Something went wrong!';
    return Promise.reject(message);
  }
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (
  args: string | [string, AxiosRequestConfig],
  p0?: { method: string; data: { bot_id: string } }
) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await axiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  auth: {
    // me: '/users/profile/',
    signIn: '/users/login/',
    signUp: '/auth/sign-up/',
  },
  users: {
    get: 'Users/',
    create: 'Users/AddNewUser',
    update: '/Users/UpdateUser',
    delete: '/Users/RemoveUser',
    wallet: {
      get: '/UserWallet/GetWalletBalance',
      transactions: '/UserWallet/GetWalletTransactions',
      creditIncrease: '/UserWallet/WalletCreditIncrease',
      creditReduction: '/UserWallet/WalletCreditReduction',
      requests: {
        list: '/UserWallet/GetCreditIncreaseRequests',
        getOne: '/UserWallet/GetCreditIncreaseRequest',
        updateState: '/UserWallet/UpdateCreditIncreaseRequestState',
      },
    },
  },
  products: {
    list: '/Product/GetProducts',
    getOne: '/Product/GetProduct',
    add: '/Product/AddNewProduct',
    update: '/Product/UpdateProduct',
    addImage: '/Product/AddProductImages',
    removeImage: '/Product/RemoveProductImage',
    delete: '/Product/RemoveProduct',
    categories: {
      list: '/Product/GetCategories',
      add: '/Product/AddNewCategory',
      remove: '/Product/RemoveCategory',
    },
    comment: {
      get: '/Product/GetProductComments',
      edit: '/Product/ChangeProductCommentStatus',
    },
  },
  productSim: {
    list: '/ProductSIM/GetProducts',
    getOne: '/ProductSIM/GetProduct',
    add: '/ProductSIM/AddNewProduct',
    update: '/ProductSIM/UpdateProduct',
    addImage: '/ProductSIM/AddProductImages',
    removeImage: '/ProductSIM/RemoveProductImage',
    delete: '/ProductSIM/RemoveProduct',
    countries: '/ProductSIM/GetCountries',
    operators: '/ProductSIM/GetOperators',
  },
  admin: {
    get: '/Account/GetAdminAccounts',
    add: '/Account/AddNewAdmin',
    update: '/Account/UpdateAdmin',
    changePass: '/Account/ChangeAdminPass',
  },
};
