import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import { useMemo } from 'react';

import axiosInstance, { fetcher, endpoints } from 'src/lib/axios';

// ---------- Types ----------
export type Message = {
  id: number;
  fullName?: string;
  phone?: string;
  message?: string | null;
  seen?: boolean;
  insertTime?: string; // ISO
};

export type MessagesListResp = {
  result?: {
    paging?: {
      totalRow?: number;
      pageIndex?: number;
      pageSize?: number;
      filter?: string;
      phone?: string;
      insertTime?: string; // ISO date or date-only string
    };
    messages?: Message[];
  };
  success?: boolean;
  message?: string;
  code?: number;
};

export type MessageResp = {
  result?: { message?: Message };
  success?: boolean;
  message?: string;
  code?: number;
};

// ---------- SWR options ----------
const swrOpts: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ---------- helpers ----------
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
export type GetMessagesFilters = {
  pageIndex?: number; // Paging.PageIndex
  pageSize?: number; // Paging.PageSize (اختیاری اگر بک‌اند پشتیبانی کند)
  filter?: string; // Pagination.Filter (عبارت جستجو)
  phone?: string; // Phone
  insertTime?: string; // InsertTime (ISO یا yyyy-MM-dd)
  seen?: boolean | undefined; // Seen (اختیاری – اگر خواستی نگه‌دار)
};

// ---------- SWR hook ----------
export function useGetMessages(params?: GetMessagesFilters) {
  const base = endpoints.messages?.list ?? '/Other/GetMessages';

  const url = buildQuery(base, {
    'Paging.PageIndex': params?.pageIndex ?? 0,
    'Paging.PageSize': params?.pageSize, // اگر لازم نیست حذف می‌شود
    'Pagination.Filter': params?.filter,
    Phone: params?.phone,
    InsertTime: params?.insertTime, // مثال: '2025-09-08' یا ISO
    Seen: typeof params?.seen === 'boolean' ? params?.seen : undefined,
  });

  const { data, isLoading, error, isValidating, mutate } = useSWR<MessagesListResp>(
    url,
    fetcher,
    swrOpts
  );

  const memo = useMemo(() => {
    const messages = data?.result?.messages ?? [];
    const paging = data?.result?.paging ?? undefined;
    const total = paging?.totalRow ?? 0;
    const _pageSize = paging?.pageSize ?? params?.pageSize ?? 20;
    const pageCount = Math.max(1, Math.ceil(total / Math.max(1, _pageSize)));

    return {
      messages,
      paging,
      pageCount,
      messagesLoading: isLoading,
      messagesError: error,
      messagesValidating: isValidating,
      refetchMessages: mutate,
    };
  }, [data, error, isLoading, isValidating, mutate, params?.pageSize]);

  return memo;
}

export async function getMessage(messageId: number) {
  const url = endpoints.messages?.getOne ?? '/Other/GetMessage';
  const res = await axiosInstance.get<MessageResp>(url, { params: { MessageId: messageId } });
  return res.data;
}
