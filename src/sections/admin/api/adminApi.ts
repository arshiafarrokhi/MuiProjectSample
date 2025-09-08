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

// ---------- Filters ----------
export type AdminListFilters = {
  pageIndex?: number; // Pagination.PageIndex
  pageSize?: number; // Pagination.PageSize (اختیاری اگر بک‌اند پشتیبانی کند)
  filter?: string; // Pagination.Filter
};

// ---------- Hook: useGetAdmins ----------
export function useGetAdmins(params?: AdminListFilters) {
  const base = endpoints.admin?.get ?? '/Account/GetAdmins';

  const url = buildQuery(base, {
    'Pagination.PageIndex': params?.pageIndex ?? 0,
    'Pagination.PageSize': params?.pageSize, // حذف می‌شود اگر undefined باشد
    'Pagination.Filter': params?.filter,
  });

  const { data, error, isLoading, isValidating, mutate } = useSWR<any>(url, fetcher, swrOptions);

  const memo = useMemo(() => {
    const admins = data?.result?.admins ?? [];
    const paging = data?.result?.pagination ?? data?.result?.paging;
    const total = paging?.totalRow ?? 0;
    const size = paging?.pageSize ?? params?.pageSize ?? 20;
    const pageCount = Math.max(1, Math.ceil(total / Math.max(1, size)));

    return {
      admins,
      paging,
      pageCount,
      adminsLoading: isLoading,
      adminsError: error,
      adminsValidating: isValidating,
      refetchAdmins: mutate,
    };
  }, [data, error, isLoading, isValidating, mutate, params?.pageSize]);

  return memo;
}

// ---------- Backward-compatible APIs ----------
export async function addAdminApi(payload: {
  fullName: string;
  phone: string;
  password: string;
  email: string;
}) {
  const res = await axiosInstance.post(endpoints.admin.add, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

export async function updateAdminApi(payload: {
  fullName: string;
  phone: string;
  email: string;
  accountId: string;
}) {
  const res = await axiosInstance.post(endpoints.admin.update, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

export async function changeAdminPassApi(payload: { accountId: string; password: string }) {
  const res = await axiosInstance.post(endpoints.admin.changePass, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

// --- Login logs hook (بدون تغییر منطقی) ---
export function useGetLoginLogs() {
  const url = `${endpoints.admin?.loginLogs ?? '/Account/GetAccountLoginLogs'}?Paging.PageIndex=0`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<any>(url, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const memo = useMemo(() => {
    const logs = data?.result?.logs ?? [];
    const pagination = data?.result?.pagination;
    return {
      logs,
      pagination,
      logsLoading: isLoading,
      logsError: error,
      logsValidating: isValidating,
      refetchLogs: mutate,
    };
  }, [data, error, isLoading, isValidating, mutate]);

  return memo;
}
