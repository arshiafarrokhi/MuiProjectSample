import { useMemo } from 'react';
const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};
import type { SWRConfiguration } from 'swr';

import useSWR from 'swr';

import { fetcher, endpoints } from 'src/lib/axios';

export function GetChunkMethodsApi() {
  const url = endpoints.ChunkMethods;

  const { data, isLoading, error, isValidating, mutate } = useSWR<any>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      ChunkMethods: data,
      ChunkMethodsLoading: isLoading,
      ChunkMethodsError: error,
      ChunkMethodsValidating: isValidating,
      mutateChunkMethods: mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );

  return memoizedValue;
}
