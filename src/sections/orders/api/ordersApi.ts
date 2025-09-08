import type { SWRConfiguration } from 'swr';

import useSWR from 'swr';
import { useMemo } from 'react';

import axiosInstance, { fetcher, endpoints } from 'src/lib/axios';

const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

function buildQuery(base: string, params: Record<string, any>) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    usp.set(k, String(v));
  });
  return `${base}?${usp.toString()}`;
}

// ---------- Orders ----------
export type OrdersFilters = {
  userId?: string;
  orderStatus?: number;
  productType?: number;
  regionType?: number;
  phone?: string;
  gameAccountId?: string;
};

export function useGetOrders(filters: OrdersFilters) {
  const base = endpoints.orders?.list ?? '/Order/GetOrders';

  const url = buildQuery(base, {
    'Paging.PageIndex': 0,
    UserId: filters.userId,
    OrderStatus: filters.orderStatus,
    ProductType: filters.productType,
    RegionType: filters.regionType,
    Phone: filters.phone,
    GameAccountId: filters.gameAccountId,
  });

  const { data, error, isLoading, isValidating, mutate } = useSWR<any>(url, fetcher, swrOptions);

  const memo = useMemo(() => {
    const orders = data?.result?.orders ?? [];
    const paging = data?.result?.paging;
    return {
      orders,
      paging,
      ordersLoading: isLoading,
      ordersError: error,
      ordersValidating: isValidating,
      refetchOrders: mutate,
    };
  }, [data, error, isLoading, isValidating, mutate]);

  return memo;
}

export async function updateOrderApi(payload: {
  orderId: string;
  status: number;
  rejectDescription?: string | null;
  notifyTheUser?: boolean;
  returnAmountToUserWallet?: boolean;
  amount?: number;
}) {
  const url = endpoints.orders?.update ?? '/Order/UpdateOrder';
  const res = await axiosInstance.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

// ---------- Local SIM Orders ----------
export type LocalFilters = {
  orderStatus?: number;
  userId?: string;
  operator?: number;
  phone?: string;
};

export function useGetLocalSIMOrders(filters: LocalFilters) {
  const base = endpoints.orders?.listLocal ?? '/Order/GetLocalSIMOrders';

  const url = buildQuery(base, {
    'Paging.PageIndex': 0,
    OrderStatus: filters.orderStatus,
    UserId: filters.userId,
    Operator: filters.operator,
    Phone: filters.phone,
  });

  const { data, error, isLoading, isValidating, mutate } = useSWR<any>(url, fetcher, swrOptions);

  const memo = useMemo(() => {
    const orders = data?.result?.orders ?? data?.result?.localSIMOrders ?? [];
    const paging = data?.result?.paging;
    return {
      localOrders: orders,
      paging,
      localLoading: isLoading,
      localError: error,
      localValidating: isValidating,
      refetchLocal: mutate,
    };
  }, [data, error, isLoading, isValidating, mutate]);

  return memo;
}

export type ProductProfitItem = {
  percentage: number;
  type: number; // 1,2,3
};

// enum براساس توضیح کارفرما
export enum ProductType {
  Game = 1,
  SIMChargeGlobal = 2,
  SIMInternetGloabl = 3, // (عین نوشتاری که دادی نگه داشتم)
}

export const PRODUCT_TYPE_LABEL: Record<number, string> = {
  [ProductType.Game]: 'بازی',
  [ProductType.SIMChargeGlobal]: 'شارژ جهانی سیم',
  [ProductType.SIMInternetGloabl]: 'اینترنت جهانی سیم',
};

// GET: /api/Order/GetProductsProfitPercentage
export function useGetProductsProfitPercentage() {
  const url = endpoints.orders?.profitGet ?? '/Order/GetProductsProfitPercentage';

  const { data, error, isLoading, isValidating, mutate } = useSWR<any>(url, fetcher, swrOptions);

  const memo = useMemo(() => {
    const items: ProductProfitItem[] = data?.result ?? [];
    // اطمینان از داشتن ۳ آیتم: 1,2,3 (در صورت نبودن از ۰ پر می‌کنیم)
    const byType = new Map<number, ProductProfitItem>();
    items.forEach((i) =>
      byType.set(Number(i.type), { type: Number(i.type), percentage: Number(i.percentage) || 0 })
    );

    const normalized: ProductProfitItem[] = [1, 2, 3].map((t) => ({
      type: t,
      percentage: byType.get(t)?.percentage ?? 0,
    }));

    return {
      profitItems: normalized,
      profitLoading: isLoading,
      profitError: error,
      profitValidating: isValidating,
      refetchProfit: mutate,
    };
  }, [data, error, isLoading, isValidating, mutate]);

  return memo;
}

// POST: /api/Order/UpdateProductsProfitPercentage
export async function updateProductsProfitPercentage(payload: {
  percentage: number;
  type: number; // 1,2,3
}) {
  const url = endpoints.orders?.profitUpdate ?? '/api/Order/UpdateProductsProfitPercentage';
  const res = await axiosInstance.post(
    url,
    {
      percentage: Number(payload.percentage),
      type: Number(payload.type),
    },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return res.data;
}
