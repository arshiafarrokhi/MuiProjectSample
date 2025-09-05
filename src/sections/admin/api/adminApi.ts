import useSWR from 'swr';
import { useMemo } from 'react';
import axiosInstance, { endpoints, fetcher } from 'src/lib/axios';
import type { SWRConfiguration } from 'swr';

const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

export function useGetAdmins() {
  const url = `${endpoints.admin.get}?Pagination.PageIndex=0`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<any>(url, fetcher, swrOptions);

  const memo = useMemo(() => {
    const admins = data?.result?.admins ?? [];
    return {
      admins,
      adminsLoading: isLoading,
      adminsError: error,
      adminsValidating: isValidating,
      refetchAdmins: mutate,
    };
  }, [data, error, isLoading, isValidating, mutate]);

  return memo;
}

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


// --- ADD: Login logs hook ---
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
