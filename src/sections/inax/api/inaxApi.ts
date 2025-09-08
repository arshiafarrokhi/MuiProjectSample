import useSWR from 'swr';
// import { swrOptions } from '@/swr/options';
import { toast } from 'sonner';
import axiosInstance, { endpoints, fetcher } from 'src/lib/axios';
import { swrOptions } from 'src/sections/bankAccounts/api/bankAccountsApi';

export function useInaxCredit() {
  const { data, error, isLoading, mutate } = useSWR(endpoints.inax.getCredit, fetcher, swrOptions);
  return {
    amount: Number(data?.result?.amount ?? 0),
    loading: isLoading,
    error,
    mutate,
  };
}

export async function inaxCreditIncrease(amount: number) {
  try {
    const res = await axiosInstance.post(endpoints.inax.creditIncrease, { amount });
    const ok = res?.data?.success ?? true;
    const msg =
      res?.data?.message || (ok ? 'درخواست افزایش اعتبار ثبت شد' : 'ثبت افزایش اعتبار ناموفق بود');
    toast[ok ? 'success' : 'error'](msg);
    return res.data;
  } catch (e: any) {
    toast.error(e?.message || 'خطا در افزایش اعتبار');
    throw e;
  }
}

export async function inaxTransactionInquiry(payload: {
  transId: number;
  orderNumberOrId: number;
}) {
  try {
    const res = await axiosInstance.post(endpoints.inax.transactionInquiry, payload);
    const ok = res?.data?.success ?? true;
    const msg = res?.data?.message || (ok ? 'نتیجه‌ی پیگیری دریافت شد' : 'پیگیری ناموفق بود');
    toast[ok ? 'success' : 'error'](msg);
    return res.data;
  } catch (e: any) {
    toast.error(e?.message || 'خطا در پیگیری تراکنش');
    throw e;
  }
}
