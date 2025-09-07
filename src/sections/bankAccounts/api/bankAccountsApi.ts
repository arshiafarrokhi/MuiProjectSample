import useSWR, { SWRConfiguration } from 'swr';
import { useMemo } from 'react';
import { toast } from 'sonner';
import axiosInstance, { endpoints, fetcher } from 'src/lib/axios';

export type BankAccount = {
  id: number;
  cardNumber: string;
  ownerName: string;
  bankName: string;
  isRemoved: boolean;
  lastUpdate: string;
};

const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

export function useBankAccounts() {
  const { data, error, isLoading, mutate } = useSWR(
    endpoints.bankAccount.list,
    fetcher,
    swrOptions
  );

  return useMemo(
    () => ({
      data: (data?.result as BankAccount[]) || [],
      loading: isLoading,
      error,
      mutate,
    }),
    [data, error, isLoading, mutate]
  );
}

export async function addBankAccount(payload: {
  cardNumber: string;
  ownerName: string;
  bankName: string;
}) {
  try {
    const res = await axiosInstance.post(endpoints.bankAccount.add, payload);
    toast.success('کارت بانکی با موفقیت افزوده شد');
    return res.data;
  } catch (e: any) {
    toast.error(e.message);
    throw e;
  }
}

export async function updateBankAccount(payload: {
  id: number;
  cardNumber: string;
  ownerName: string;
  bankName: string;
}) {
  try {
    // طبق الگوی بخش اکانت‌ها، Update را POST می‌زنیم
    const res = await axiosInstance.post(endpoints.bankAccount.update, payload);
    toast.success('کارت بانکی به‌روزرسانی شد');
    return res.data;
  } catch (e: any) {
    toast.error(e.message);
    throw e;
  }
}

export async function removeBankAccount(id: number) {
  try {
    // حذف با QueryString طبق توضیح شما
    const res = await axiosInstance.delete(`${endpoints.bankAccount.remove}?Id=${id}`);
    toast.success('کارت بانکی حذف شد');
    return res.data;
  } catch (e: any) {
    toast.error(e.message);
    throw e;
  }
}
