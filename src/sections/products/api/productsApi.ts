// src/sections/products/api/productsApi.ts
import type { SWRConfiguration } from 'swr';

import useSWR from 'swr';
import { useMemo } from 'react';

import axiosInstance, { fetcher, endpoints } from 'src/lib/axios';

// ---------- Types ----------
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  guid?: string | null;
  url?: string | null;
  isPublish: boolean;
  status: number;
  categoryId?: number | null;
  category?: any;
  images?: any;
  comments?: any;
  questions?: any;
  isRemoved: boolean;
  inserTime?: string | null;
  lastUpdate?: string | null;
  removeTime?: string | null;
};

export type GetProductsResp = {
  result: {
    pagination: { totalRow: number; pageIndex: number; pagesize: number; filter: string };
    products: Product[];
    currency: string;
  };
  success: boolean;
  message?: string;
  code?: number;
};

export type GetProductResp = {
  result: Product;
  success: boolean;
  message?: string;
  code?: number;
};

// ---------- SWR options ----------
const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ---------- SWR: list ----------
export function GetProductsApi(pageIndex = 0, categoryId?: number | null) {
  const base = endpoints.products.list; // '/Product/GetProducts'
  const url =
    typeof categoryId === 'number'
      ? `${base}?Pagination.PageIndex=${pageIndex}&CategoryId=${categoryId}`
      : `${base}?Pagination.PageIndex=${pageIndex}`;

  const { data, isLoading, error, isValidating, mutate } = useSWR<GetProductsResp>(
    url,
    fetcher,
    swrOptions
  );

  const memoizedValue = useMemo(
    () => ({
      products: data?.result?.products ?? [],
      currency: data?.result?.currency ?? 'IRT',
      pagination: data?.result?.pagination,
      productsLoading: isLoading,
      productsError: error,
      productsValidating: isValidating,
      refetchProducts: mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );

  return memoizedValue;
}

// ---------- get one ----------
export async function getProduct(productId: string) {
  const url = endpoints.products.getOne;
  const res = await axiosInstance.get<GetProductResp>(url, { params: { ProductId: productId } });
  return res.data;
}

// ---------- create (JSON) ----------
export async function createProductJson(payload: {
  name: string;
  description: string;
  price: number;
  isPublish: boolean;
  status?: number; // always 1 per requirement
  categoryId: number;
}) {
  const url = endpoints.products.add;
  const body = { ...payload, status: 1 }; // enforce status=1
  const res = await axiosInstance.post(url, body, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

// ---------- add image (multipart) ----------
export async function addProductImage(payload: { productId: string; image: File }) {
  const url = endpoints.products.addImage;
  const form = new FormData();
  form.append('ProductId', payload.productId);
  form.append('Images', payload.image);
  const res = await axiosInstance.post(url, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

// ---------- update (JSON) ----------
export async function updateProductJson(payload: {
  productId: string;
  name: string;
  description: string;
  categoryId: number;
  price: number;
  status?: number; // always 1
}) {
  const url = endpoints.products.update;
  const body = { ...payload, status: 1 };
  const res = await axiosInstance.post(url, body, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

// ---------- delete product (DELETE ?ProductId=) ----------
export async function removeProduct(productId: string) {
  const url = endpoints.products.delete;
  const res = await axiosInstance.delete(url, { params: { ProductId: productId } });
  return res.data;
}

// ---------- delete product image (DELETE ?ProductId=) ----------
export async function removeProductImage(payload: { productId: string; imageId: number }) {
  const url = endpoints.products.removeImage; // '/Product/RemoveProductImage'
  const res = await axiosInstance.delete(url, {
    data: payload, // 👈 بدنه‌ی DELETE اینجاست
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

