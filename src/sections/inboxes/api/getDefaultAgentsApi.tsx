import { useMemo } from 'react';
const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};
import type { SWRConfiguration } from 'swr';

import useSWR from 'swr';

import { fetcher, endpoints } from 'src/lib/axios';

export function GetDefaultAgentsApi(account_id: string, inbox_id: string) {
  const url =
    account_id && inbox_id
      ? endpoints.inboxes.getDefaultAgents
          .replace('{account_id}', account_id)
          .replace('{inbox_id}', inbox_id)
      : null;
  const { data, isLoading, error, isValidating , mutate } = useSWR<any>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      DefaultAgents: data?.agent_bot,
      DefaultAgentsLoading: isLoading,
      DefaultAgentsError: error,
      DefaultAgentsValidating: isValidating,
      DefaultAgentsmutate: mutate,
    }),
    [data, error, isLoading, isValidating , mutate]
  );

  return memoizedValue;
}
