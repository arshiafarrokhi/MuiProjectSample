import { useMemo } from 'react';
const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};
import type { SWRConfiguration } from 'swr';

import useSWR from 'swr';

import { fetcher, endpoints } from 'src/lib/axios';

import type { inboxesType } from '../types';

export function GetAgentApi(account_id: string) {
  const url = account_id ? endpoints.users.get.replace('{account_id}', account_id) : null;

  const { data, isLoading, error, isValidating } = useSWR<inboxesType[]>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      agents: data,
      agentsLoading: isLoading,
      agentsError: error,
      agentsValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
