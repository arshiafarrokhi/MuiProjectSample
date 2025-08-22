import { useMemo } from 'react';
const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};
import type { SWRConfiguration } from 'swr';

import useSWR from 'swr';

import { fetcher, endpoints } from 'src/lib/axios';

import type { LLMModelType } from '../types';

export function GetLlmsApi() {
  const url = endpoints.llm;

  const { data, isLoading, error, isValidating, mutate } = useSWR<LLMModelType[]>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      Llms: data,
      LlmsLoading: isLoading,
      LlmsError: error,
      LlmsValidating: isValidating,
      mutateLlms: mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );

  return memoizedValue;
}
