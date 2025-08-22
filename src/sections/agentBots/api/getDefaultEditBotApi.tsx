import { useMemo } from 'react';
const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};
import type { SWRConfiguration } from 'swr';

import useSWR from 'swr';

import { fetcher, endpoints } from 'src/lib/axios';

import type { BotsDetailType } from '../types';

export function GetDefaultEditBot(account_id: string, bot_id: string | undefined) {
  const url =
    account_id && bot_id
      ? endpoints.bots.defaultEditBot
          .replace('{account_id}', account_id)
          .replace('{bot_id}', bot_id)
      : null;
  const { data, isLoading, error, isValidating } = useSWR<BotsDetailType>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      DefaultEditBot: data,
      DefaultEditBotLoading: isLoading,
      DefaultEditBotError: error,
      DefaultEditBotValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
