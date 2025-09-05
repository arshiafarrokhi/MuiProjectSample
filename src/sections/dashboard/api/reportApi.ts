import useSWR from 'swr';
import { useMemo } from 'react';
import type { SWRConfiguration } from 'swr';
import { fetcher, endpoints } from 'src/lib/axios';

const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

export type DashboardReport = {
  usersCount: number;
  adminsCount: number;
  creditIncreaseRequestsCount: number;
  unfulfilledOrdersCount: number;
  completedOrdersCount: number;
  inaxCredit: number;
  gameProductsCount: number;
  simProductCount: number;
  simActiveOperatorsCount: number;
  simOperatorsCount: number;
};

export function useGetDashboardReport() {
  const url = endpoints?.dashboard?.get ?? '/Report/GetDashboard';

  const { data, error, isLoading, isValidating, mutate } = useSWR<{
    result?: DashboardReport;
    success?: boolean;
    message?: string;
  }>(url, fetcher, swrOptions);

  return useMemo(
    () => ({
      report: data?.result,
      reportLoading: isLoading,
      reportError: error,
      reportValidating: isValidating,
      refetchReport: mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );
}
