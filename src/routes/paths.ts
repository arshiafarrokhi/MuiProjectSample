// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  faqs: '/faqs',
  minimalStore: 'https://api.admin.arianamohajer.ir/api/',
  // AUTH
  auth: {
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: {
        root: `${ROOTS.AUTH}/jwt/sign-up`,
        otp: `${ROOTS.AUTH}/jwt/sign-up/otp`,
      },
      forgetPassword: `${ROOTS.AUTH}/jwt/forget-password`,
      resetPassword: `${ROOTS.AUTH}/jwt/reset-password`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: `${ROOTS.DASHBOARD}/dashboard`,
    dashboard: `${ROOTS.DASHBOARD}/dashboard`,
    messages: `${ROOTS.DASHBOARD}/messages`,
    users: `${ROOTS.DASHBOARD}/users`,
    products: `${ROOTS.DASHBOARD}/products`,
    productSim: `${ROOTS.DASHBOARD}/productSim`,
    admin: `${ROOTS.DASHBOARD}/admin`,
    orders: `${ROOTS.DASHBOARD}/orders`,
    bankAccounts: `${ROOTS.DASHBOARD}/bank-accounts`,
    inax: `${ROOTS.DASHBOARD}/inax`,
    creditIncreaseRequests: `${ROOTS.DASHBOARD}/creditIncreaseRequests`,
  },
};
