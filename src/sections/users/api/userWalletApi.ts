import axiosInstance, { endpoints } from 'src/lib/axios';

export function userWalletApi() {
  const url = endpoints.users.wallet.get; // '/UserWallet/GetWalletBalance'

  const getWalletBalance = async (userId: string) => {
    if (!url) throw new Error('Missing wallet endpoint');

    // GET /UserWallet/GetWalletBalance?UserId=<id>
    const res = await axiosInstance.get(url, { params: { UserId: userId } });
    return res.data as {
      result?: { totalAmount?: number; transactionsCount?: number };
      success?: boolean;
      message?: string;
      code?: number;
    };
  };

  return { getWalletBalance };
}
