import { useMemo } from 'react';
const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};
import type { SWRConfiguration } from 'swr';

import useSWR from 'swr';

import { fetcher, endpoints } from 'src/lib/axios';

export function GetDefaultEditKnowledgeBases(
  account_id: string,
  KnowledgeBases_id: string | undefined
) {
  const url =
    account_id && KnowledgeBases_id
      ? endpoints.knowledgeBases.defaultEditKnowledgeBases
          .replace('{account_id}', account_id)
          .replace('{knowledge_base_id}', KnowledgeBases_id)
      : null;
  const { data, isLoading, error, isValidating } = useSWR<any>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      DefaultEditKnowledgeBases: data,
      DefaultEditKnowledgeBasesLoading: isLoading,
      DefaultEditKnowledgeBasesError: error,
      DefaultEditKnowledgeBasesValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
