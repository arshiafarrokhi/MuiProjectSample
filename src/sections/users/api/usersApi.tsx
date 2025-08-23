import type { SWRConfiguration } from 'swr';

import useSWR from 'swr';
import { useMemo } from 'react';

const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};
import { fetcher, endpoints } from 'src/lib/axios';

export function GetUsersApi(pageIndex = 1, activeUsers = true) {
  const url = `${endpoints.users.get}GetUsers?Pagination.PageIndex=${pageIndex}&ActiveUsers=${activeUsers}`;

  const { data, isLoading, error, isValidating, mutate } = useSWR<any>(url, fetcher, swrOptions);
  const memoizedValue = useMemo(
    () => ({
      users: data?.result.users,
      usersLoading: isLoading,
      usersError: error,
      usersValidating: isValidating,
      refetchUsers: mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );

  return memoizedValue;
}
