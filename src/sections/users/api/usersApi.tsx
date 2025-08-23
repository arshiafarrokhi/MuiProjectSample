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

  console.log(endpoints.users.get);
  const { data, isLoading, error, isValidating } = useSWR<any>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      users: data?.payload,
      usersLoading: isLoading,
      usersError: error,
      usersValidating: isValidating,
    }),
    [data?.payload, error, isLoading, isValidating]
  );

  return memoizedValue;
}
