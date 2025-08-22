import { useMemo } from 'react';
const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};
import type { SWRConfiguration } from 'swr';

import useSWR from 'swr';

import { fetcher, endpoints } from 'src/lib/axios';

export function GetKnowledgeBasesApi(account_id: string) {
  const url = account_id
    ? endpoints.knowledgeBases.getKnowledgeBases.replace('{account_id}', account_id)
    : null;

  const { data, isLoading, error, isValidating, mutate } = useSWR<any>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      knowledgeBases: data,
      knowledgeBasesLoading: isLoading,
      knowledgeBasesError: error,
      knowledgeBasesValidating: isValidating,
      mutateKnowledgeBases: mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );

  return memoizedValue;
}
