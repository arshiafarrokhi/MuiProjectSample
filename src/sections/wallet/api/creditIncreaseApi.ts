import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import { useMemo } from 'react';

import axiosInstance, { fetcher, endpoints } from 'src/lib/axios';

const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

function buildQuery(base: string, params: Record<string, any>) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    usp.set(k, String(v));
  });
  const qs = usp.toString();
  return qs ? `${base}?${qs}` : base;
}

export type CreditIncreaseItem = {
  id: string;
  ammount?: number; // NOTE: API typo
  amount?: number; // safe-side
  description?: string | null;
  insertTime?: string | null;
  isRemoved?: boolean;
  user?: {
    userId?: string;
    userPhone?: string;
    userFullName?: string;
  };
};

export type CreditIncreaseFilters = {
  pageIndex?: number; // Paging.PageIndex (1-based per sample)
  pageSize?: number; // Paging.PageSize
  filter?: string; // Paging.Filter
  accepted?: boolean; // Accepted
  isRemoved?: boolean; // IsRemoved
  userId?: string; // UserId (GUID)
  insertTime?: string; // InsertTime (yyyy-MM-dd)
};

export function useGetCreditIncreaseRequests(params: CreditIncreaseFilters) {
  const base =
    endpoints.userWallet?.getCreditIncreaseRequests ?? '/UserWallet/GetCreditIncreaseRequests';

  const url = buildQuery(base, {
    'Paging.PageIndex': params.pageIndex ?? 1,
    'Paging.PageSize': params.pageSize ?? 20,
    'Paging.Filter': params.filter,
    Accepted: typeof params.accepted === 'boolean' ? params.accepted : undefined,
    IsRemoved: typeof params.isRemoved === 'boolean' ? params.isRemoved : undefined,
    UserId: params.userId,
    InsertTime: params.insertTime,
  });

  const { data, isLoading, error, isValidating, mutate } = useSWR<any>(url, fetcher, swrOptions);

  const memo = useMemo(() => {
    const reqIncreases: CreditIncreaseItem[] = data?.result?.reqIncreases ?? [];
    const paging = data?.result?.paging;
    const total = paging?.totalRow ?? 0;
    const size = paging?.pagesize ?? params.pageSize ?? 20;
    const pageCount = Math.max(1, Math.ceil(total / Math.max(1, size)));

    return {
      requests: reqIncreases,
      paging,
      pageCount,
      requestsLoading: isLoading,
      requestsError: error,
      requestsValidating: isValidating,
      refetchRequests: mutate,
    };
  }, [data, error, isLoading, isValidating, mutate, params.pageSize]);

  return memo;
}

export async function getCreditIncreaseRequest(requestId: string) {
  const url =
    endpoints.userWallet?.getCreditIncreaseRequest ?? '/UserWallet/GetCreditIncreaseRequest';
  const res = await axiosInstance.get(url, { params: { RequestId: requestId } });
  return res.data;
}
