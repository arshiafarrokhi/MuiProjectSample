import axios, { AxiosHeaders, AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { JWT_STORAGE_KEY } from 'src/auth/context/jwt';
import { CONFIG } from 'src/global-config';

const LOGIN_PATH = '/auth/jwt/sign-in';

const axiosInstance = axios.create({ baseURL: CONFIG.serverUrl });

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem(JWT_STORAGE_KEY) : null;

  const headers = new AxiosHeaders(config.headers);

  if (token) {
    // هر دو هدر را همیشه ست کن
    headers.set('Authorization', `Bearer ${token}`);
    headers.set('api_access_token', token);
  } else {
    headers.delete('Authorization');
    headers.delete('api_access_token');
  }

  config.headers = headers;
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem(JWT_STORAGE_KEY);
          const onAuthPage = window.location.pathname.includes('/auth');
          const url: string = error?.config?.url || '';
          const isLoginCall = url.includes('/users/login') || url.includes('/auth/sign-in');
          if (!onAuthPage && !isLoginCall) {
            window.location.replace(LOGIN_PATH);
          }
        }
      } catch {
        console.log('Error handling 401 in axios interceptor');
      }
    }
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
    changeCountryActivity: '/ProductSIM/ChangeCountryActivity',
    changeOperatorActivity: '/ProductSIM/ChangeOperatorActivity',
  },
  admin: {
    get: '/Account/GetAdminAccounts',
    loginLogs: '/Account/GetAccountLoginLogs',
    add: '/Account/AddNewAdmin',
    update: '/Account/UpdateAdmin',
    changePass: '/Account/ChangeAdminPass',
  },
  dashboard: {
    get: '/Report/GetDashboard',
  },
  messages: {
    list: '/Other/GetMessages',
    getOne: '/Other/GetMessage',
  },
};
