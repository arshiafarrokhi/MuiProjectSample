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
  const url = `https://api.admin.arianamohajer.ir/api/Users/GetUsers?Pagination.PageIndex=${pageIndex}&ActiveUsers=${activeUsers}`;

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
