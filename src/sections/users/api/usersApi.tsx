import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/lib/axios';

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

// ---------- Filters type ----------
export type UsersListFilters = {
  pageIndex?: number; // Pagination.PageIndex
  pageSize?: number; // اختیاری، اگر بک‌اند پشتیبانی کند
  filter?: string; // Pagination.Filter (جستجو)
  activeUsers?: boolean; // ActiveUsers (true/false)
};

// ---------- Hook: useGetUsers ----------
export function useGetUsers(params: UsersListFilters) {
  const base = endpoints.users?.get ? `${endpoints.users.get}GetUsers` : '/User/GetUsers';

  const url = buildQuery(base, {
    'Pagination.PageIndex': params.pageIndex ?? 0,
    'Pagination.PageSize': params.pageSize, // اگر لازم نیست، حذف می‌شود
    'Pagination.Filter': params.filter,
    ActiveUsers: typeof params.activeUsers === 'boolean' ? params.activeUsers : undefined,
  });

  const { data, isLoading, error, isValidating, mutate } = useSWR<any>(url, fetcher, swrOptions);

  const memo = useMemo(() => {
    const users = data?.result?.users ?? [];
    const paging = data?.result?.paging;
    const total = paging?.totalRow ?? 0;
    const size = paging?.pageSize ?? params.pageSize ?? 20;
    const pageCount = Math.max(1, Math.ceil(total / Math.max(1, size)));

    return {
      users,
      paging,
      pageCount,
      usersLoading: isLoading,
      usersError: error,
      usersValidating: isValidating,
      refetchUsers: mutate,
    };
  }, [data, error, isLoading, isValidating, mutate, params.pageSize]);

  return memo;
}

// ---------- Backward-compatible wrapper ----------
export function GetUsersApi(pageIndex = 1, activeUsers = true) {
  // توجه: قبلاً PageIndex از 1 شروع می‌شد؛ در اینجا همان را حفظ می‌کنیم
  return useGetUsers({ pageIndex, pageSize: 20, activeUsers, filter: undefined });
}
