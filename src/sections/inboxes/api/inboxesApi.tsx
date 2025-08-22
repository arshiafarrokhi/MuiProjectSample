import type { SWRConfiguration } from 'swr';

import useSWR from 'swr';
import { useMemo } from 'react';

const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};
import { fetcher, endpoints } from 'src/lib/axios';

export function GetInboxesApi(account_id: string) {
  const url = endpoints.inboxes.get.replace('{account_id}', account_id);

  const { data, isLoading, error, isValidating } = useSWR<any>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      inboxes: data?.payload,
      inboxesLoading: isLoading,
      inboxesError: error,
      inboxesValidating: isValidating,
    }),
    [data?.payload, error, isLoading, isValidating]
  );

  return memoizedValue;
}
