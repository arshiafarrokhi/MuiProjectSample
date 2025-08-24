// src/sections/products/api/productsApi.ts
import type { SWRConfiguration } from 'swr';

import useSWR from 'swr';
import { useMemo } from 'react';

import axiosInstance, { fetcher, endpoints } from 'src/lib/axios';

const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// GET لیست محصولات
export function GetProductsApi(pageIndex = 1, activeProducts = true) {
  const url = `${endpoints.products.list}?Pagination.PageIndex=${pageIndex}&ActiveProducts=${activeProducts}`;
  const { data, isLoading, error, isValidating, mutate } = useSWR<any>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      products: data?.result?.products ?? data?.result ?? [], // تدافعی
      productsLoading: isLoading,
      productsError: error,
      productsValidating: isValidating,
      refetchProducts: mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );

  return memoizedValue;
}

// DELETE محصول
export function deleteProductApi() {
  const url = endpoints.products.delete;
  const deleteProduct = async (productId: string) => {
    const res = await axiosInstance.post(
      url,
      { productId },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return res.data;
  };
  return { deleteProduct };
}

// CREATE محصول (multipart برای تصویر)
export function createProductApi() {
  const url = endpoints.products.create;
  const createProduct = async (payload: {
    title: string;
    price?: number;
    sku?: string;
    image?: File | null;
  }) => {
    const form = new FormData();
    form.append('title', payload.title);
    if (payload.price != null) form.append('price', String(payload.price));
    if (payload.sku) form.append('sku', payload.sku);
    if (payload.image) form.append('image', payload.image);

    const res = await axiosInstance.post(url, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  };
  return { createProduct };
}

// UPDATE محصول
export function updateProductApi() {
  const url = endpoints.products.update;
  const updateProduct = async (payload: {
    productId: string;
    title?: string;
    price?: number;
    sku?: string;
    image?: File | null;
  }) => {
    const form = new FormData();
    form.append('productId', payload.productId);
    if (payload.title) form.append('title', payload.title);
    if (payload.price != null) form.append('price', String(payload.price));
    if (payload.sku) form.append('sku', payload.sku);
    if (payload.image) form.append('image', payload.image);

    const res = await axiosInstance.post(url, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  };
  return { updateProduct };
}
