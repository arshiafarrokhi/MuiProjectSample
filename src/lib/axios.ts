import axios, { AxiosHeaders, AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { JWT_STORAGE_KEY } from 'src/auth/context/jwt';
import { CONFIG } from 'src/global-config';

const LOGIN_PATH = '/auth/jwt/sign-in';
const SITE_KEY = '6Le-YMIrAAAAAPUCgXiCprsOQKqAVApCNgix9x62';

const axiosInstance = axios.create({ baseURL: CONFIG.serverUrl });

// ---------------- reCAPTCHA Enterprise helpers ----------------
declare global {
  interface Window {
    grecaptcha?: any;
  }
}

function ensureRecaptchaScriptLoaded(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.grecaptcha?.enterprise) return Promise.resolve();

  return new Promise<void>((resolve) => {
    const existing = document.querySelector(
      'script[src^="https://www.google.com/recaptcha/enterprise.js"]'
    );
    if (existing) {
      // script already in DOM (likely loaded in index.html). Just resolve.
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

async function getRecaptchaToken(action: string): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  await ensureRecaptchaScriptLoaded();
  const gre = window.grecaptcha?.enterprise;
  if (!gre) return null;

  return new Promise<string | null>((resolve) => {
    gre.ready(async () => {
      try {
        const token = await gre.execute(SITE_KEY, { action });
        resolve(token || null);
      } catch {
        resolve(null);
      }
    });
  });
}

// Map request URL -> recaptcha action (only for protected endpoints & POST)
function recaptchaActionFor(url?: string): string | null {
  if (!url) return null;
  const u = url.toLowerCase();

  // Authentication
  if (u.includes('/authentication/login') || u.includes('/api/authentication/login')) {
    return 'LOGIN';
  }
  if (u.includes('/authentication/verifycode') || u.includes('/api/authentication/verifycode')) {
    return 'AUTH_VERIFY';
  }

  // Account (forgot + verify)
  if (u.includes('/account/adminforgotpass') || u.includes('/api/account/adminforgotpass')) {
    return 'ADMIN_FORGOT_PASS';
  }
  if (u.includes('/account/verifycode') || u.includes('/api/account/verifycode')) {
    return 'ACCOUNT_VERIFY';
  }

  return null;
}
// ----------------------------------------------------------------

// Request interceptor (async: to await captcha token)
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem(JWT_STORAGE_KEY) : null;

    const headers = new AxiosHeaders(config.headers);

    // Clear KeyResponse by default; will set only when needed
    headers.delete('KeyResponse');
    // headers.set('KeyResponse', '22');

    if (token) {
      // هر دو هدر را همیشه ست کن
      headers.set('Authorization', `Bearer ${token}`);
      headers.set('api_access_token', token);
    } else {
      headers.delete('Authorization');
      headers.delete('api_access_token');
    }

    // Attach reCAPTCHA only for POST & protected endpoints
    const method = String(config.method || '').toLowerCase();
    if (method === 'post') {
      const action = recaptchaActionFor(config.url);
      if (action) {
        try {
          const captcha = await getRecaptchaToken(action);
          if (captcha) headers.set('KeyResponse', captcha);
        } catch {
          // If token retrieval fails, proceed without KeyResponse (server may reject)
        }
      }
    }

    config.headers = headers;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
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
  _unused?: { method: string; data: { bot_id: string } }
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
  orders: {
    list: '/Order/GetOrders',
    update: '/Order/UpdateOrder',
    listLocal: '/Order/GetLocalSIMOrders',
    profitUpdate: '/Order/UpdateProductsProfitPercentage',
    profitGet: '/Order/GetProductsProfitPercentage',
  },
  bankAccount: {
    list: '/BankAccount/GetBankAccounts',
    add: '/BankAccount/AddBankAccount',
    update: '/BankAccount/UpdateBankAccount',
    remove: '/BankAccount/RemoveBankAccount',
  },
  inax: {
    getCredit: '/Inax/GetCredit',
    creditIncrease: '/Inax/CreditIncrease',
    transactionInquiry: '/Inax/TransactionInquiry',
  },
  userWallet: {
    getCreditIncreaseRequests: '/UserWallet/GetCreditIncreaseRequests',
    getCreditIncreaseRequest: '/UserWallet/GetCreditIncreaseRequest',
  },
};
