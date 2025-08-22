import { useMemo } from 'react';
const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};
import type { SWRConfiguration } from 'swr';

import useSWR from 'swr';

import { fetcher, endpoints } from 'src/lib/axios';

import type { BotsType } from '../types';

export function GetBotsApi(account_id: string) {
  const url = account_id ? endpoints.bots.getBots.replace('{account_id}', account_id) : null;

  const { data, isLoading, error, isValidating, mutate } = useSWR<BotsType[]>(
    url,
    fetcher,
    swrOptions
  );

  const memoizedValue = useMemo(
    () => ({
      bots: data,
      botsLoading: isLoading,
      botsError: error,
      botsValidating: isValidating,
      mutateBots: mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );

  return memoizedValue;
}
