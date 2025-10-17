// src/sections/products/api/categoriesApi.ts
import type { SWRConfiguration } from 'swr';

import useSWR from 'swr';
import { useMemo } from 'react';

import axiosInstance, { fetcher, endpoints } from 'src/lib/axios';

export type Category = {
  id: number;
  name: string;
  description?: string | null;
};

export type GetCategoriesResp = {
  result: Category[];
  success: boolean;
  message?: string;
  code?: number;
};

const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

export function GetCategoriesApi() {
  const url = endpoints.products.categories.list;
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetCategoriesResp>(
    url,
    fetcher,
    swrOptions
  );

  return useMemo(
    () => ({
      categories: data?.result ?? [],
      categoriesLoading: isLoading,
      categoriesError: error,
      categoriesValidating: isValidating,
      refetchCategories: mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );
}

export async function addCategory(payload: {
  name: string;
  description?: string;
}) {
  const url = endpoints.products.categories.add;
  const body = {
    name: payload.name,
    description: payload.description ?? null,
  };
  const res = await axiosInstance.post(url, body, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

export async function removeCategory(categoryName: string) {
  const url = endpoints.products.categories.remove;
  // ✅ فقط از query استفاده می‌کنیم
  const res = await axiosInstance.delete(url, { params: { CategoryName: categoryName } });
  return res.data;
}
