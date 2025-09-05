import useSWR from 'swr';
import { useMemo } from 'react';
import axiosInstance, { fetcher, endpoints } from 'src/lib/axios';

type MessagesListResp = {
  result?: {
    paging?: any;
    messages?: Array<{
      id: number;
      fullName?: string;
      phone?: string;
      message?: string | null;
      seen?: boolean;
      insertTime?: string;
    }>;
  };
  success?: boolean;
  message?: string;
  code?: number;
};

type MessageResp = {
  result?: {
    message?: {
      id: number;
      fullName?: string;
      phone?: string;
      message?: string | null;
      seen?: boolean;
      insertTime?: string;
    };
  };
  success?: boolean;
  message?: string;
  code?: number;
};

const swrOpts = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

export function useGetMessages(seen?: boolean) {
  // فقط PageIndex=0 ثابت
  const base = endpoints.messages?.list ?? '/Other/GetMessages';
  const url =
    typeof seen === 'boolean'
      ? `${base}?Paging.PageIndex=0&Seen=${seen}`
      : `${base}?Paging.PageIndex=0`;

  const { data, isLoading, error, isValidating, mutate } = useSWR<MessagesListResp>(
    url,
    fetcher,
    swrOpts
  );

  return useMemo(
    () => ({
      messages: data?.result?.messages ?? [],
      paging: data?.result?.paging,
      messagesLoading: isLoading,
      messagesError: error,
      messagesValidating: isValidating,
      refetchMessages: mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );
}

export async function getMessage(messageId: number) {
  const url = endpoints.messages?.getOne ?? '/Other/GetMessage';
  const res = await axiosInstance.get<MessageResp>(url, { params: { MessageId: messageId } });
  return res.data;
}
