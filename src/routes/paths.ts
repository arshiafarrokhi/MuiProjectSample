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
    root: `${ROOTS.DASHBOARD}/users`,
    users: `${ROOTS.DASHBOARD}/users`,
    // usersWallet: {
    //   root: `${ROOTS.DASHBOARD}/usersWallet`,
    //   new: `${ROOTS.DASHBOARD}/usersWallet/new`,
    //   edit: (walletId: number) =>
    //     `${ROOTS.DASHBOARD}/usersWallet/${walletId}/edit`,
    // },
  },
};
