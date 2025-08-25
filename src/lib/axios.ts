import type { AxiosRequestConfig } from 'axios';

import axios from 'axios';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: CONFIG.serverUrl });

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong!')
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
    me: '/users/profile/',
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
      transactions: '/UserWallet/GetWalletTransations',
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
  },
};
