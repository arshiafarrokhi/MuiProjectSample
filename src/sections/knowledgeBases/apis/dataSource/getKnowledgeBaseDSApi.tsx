import type { SWRConfiguration } from 'swr';

import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/lib/axios';
const swrOptions: SWRConfiguration = {
  refreshInterval: 2000,
};

export function GetKnowledgeBaseDSApi(account_id: string, knowledge_base_id: string | undefined) {
  const url =
    account_id && knowledge_base_id
      ? endpoints.knowledgeBases.dataSource.getDS
          .replace('{account_id}', account_id)
          .replace('{knowledge_base_id}', knowledge_base_id)
      : null;

  const { data, isLoading, error, isValidating, mutate } = useSWR<any>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      knowledgeBaseDS: data,
      knowledgeBaseDSLoading: isLoading,
      knowledgeBaseDSError: error,
      knowledgeBaseDSValidating: isValidating,
      mutateKnowledgeBaseDS: mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );

  return memoizedValue;
}
