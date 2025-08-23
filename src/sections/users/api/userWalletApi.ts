import axiosInstance, { endpoints } from 'src/lib/axios';

export type WalletBalanceResponse = {
  result?: { totalAmount?: number; transactionsCount?: number };
  success?: boolean;
  message?: string;
  code?: number;
};

export type WalletTransactionsResponse = {
  result?: any; // ساختار دقیق نامشخص: تدافعی رندر می‌کنیم
  success?: boolean;
  message?: string;
  code?: number;
};

export function userWalletApi() {
  const balanceUrl = endpoints.users.wallet?.get; // '/UserWallet/GetWalletBalance'
  const txUrl = endpoints.users.wallet?.transactions; // '/UserWallet/GetWalletTransations'
  const incUrl = endpoints.users.wallet?.creditIncrease; // '/UserWallet/WalletCreditIncrease'
  const decUrl = endpoints.users.wallet?.creditReduction; // '/UserWallet/WalletCreditReduction'

  if (!balanceUrl || !txUrl || !incUrl || !decUrl) {
    throw new Error('Wallet endpoints are not fully configured');
  }

  const getWalletBalance = async (userId: string) => {
    const res = await axiosInstance.get<WalletBalanceResponse>(balanceUrl, {
      params: { UserId: userId },
    });
    return res.data;
  };

  // فقط صفحه 0، بدون Type — طبق نیاز شما
  const getWalletTransactionsAll = async (userId: string) => {
    const res = await axiosInstance.get<WalletTransactionsResponse>(txUrl, {
      params: { 'Pagination.PageIndex': 0, UserId: userId },
    });
    return res.data;
  };

  const walletCreditIncrease = async (payload: {
    userId: string;
    amount: number;
    description: string;
    paymentMethod: number;
  }) => {
    const res = await axiosInstance.post(incUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    return res.data;
  };

  const walletCreditReduction = async (payload: {
    userId: string;
    amount: number;
    description: string;
  }) => {
    const res = await axiosInstance.post(decUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    return res.data;
  };

  return {
    getWalletBalance,
    getWalletTransactionsAll,
    walletCreditIncrease,
    walletCreditReduction,
  };
}
