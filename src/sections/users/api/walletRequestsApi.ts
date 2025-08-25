// src/sections/users/api/walletRequestsApi.ts
import useSWR from 'swr';
import type { SWRConfiguration } from 'swr';
import axiosInstance, { fetcher, endpoints } from 'src/lib/axios';

const swrOpts: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

export type CreditIncreaseRequestListResp = {
  result: {
    paging: { totalRow: number; pageIndex: number; pagesize: number; filter: string | null };
    reqIncreases: Array<{
      id: string;
      insertTime?: string | null;
      description?: string | null;
      ammount?: number | null; // املا طبق نمونه
      // اگر فیلدهای دیگری هم برگردد، اینجا اضافه کن
    }>;
  };
  success: boolean;
  message?: string;
  code?: number;
};

export type CreditIncreaseRequestOneResp = {
  result: {
    depositSlipImage?: string | null;
    id: string;
    ammount: number;
    description?: string | null;
    insertTime: string;
    user: {
      userId: string;
      userPhone: string;
      userFullName: string;
    };
  };
  success: boolean;
  message?: string;
  code?: number;
};

export type WalletTransactionsResp = {
  result: {
    paging: { totalRow: number; pageIndex: number; pagesize: number; filter: string | null };
    transactions: Array<{
      id: string;
      amount?: number;
      description?: string | null;
      insertTime?: string | null;
      // ...
    }>;
  };
  success: boolean;
  message?: string;
  code?: number;
};

// ------ SWR: لیست درخواست‌ها ------
export function useCreditIncreaseRequests(userId: string, accepted: boolean, isRemoved: boolean) {
  const url = `${endpoints.users.wallet.requests.list}?Paging.PageIndex=0&Accepted=${accepted}&IsRemoved=${isRemoved}&UserId=${userId}`;
  const { data, isLoading, error, isValidating, mutate } = useSWR<CreditIncreaseRequestListResp>(
    userId ? url : null,
    fetcher,
    swrOpts
  );

  return {
    requests: data?.result?.reqIncreases ?? [],
    paging: data?.result?.paging,
    loading: isLoading,
    error,
    validating: isValidating,
    refetchRequests: mutate,
  };
}

// ------ دریافت یک درخواست ------
export async function getCreditIncreaseRequest(id: string) {
  const url = endpoints.users.wallet.requests.getOne;
  const res = await axiosInstance.get<CreditIncreaseRequestOneResp>(url, {
    params: { RequestId: id },
  });
  return res.data;
}

// ------ تغییر وضعیت درخواست (قبول/رد) ------
export async function updateCreditIncreaseRequestState(payload: {
  id: string;
  isAccepted: boolean;
  description?: string;
}) {
  const url = endpoints.users.wallet.requests.updateState;
  const res = await axiosInstance.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

// ------ تراکنش‌ها (ادمین) ------
export function useWalletTransactionsAdmin() {
  const url = `${endpoints.users.wallet.transactions}?Paging.PageIndex=0&Type=1&ByAdmin=true`;
  const { data, isLoading, error, isValidating, mutate } = useSWR<WalletTransactionsResp>(
    url,
    fetcher,
    swrOpts
  );

  return {
    transactions: data?.result?.transactions ?? [],
    txLoading: isLoading,
    txError: error,
    txValidating: isValidating,
    refetchTx: mutate,
  };
}
