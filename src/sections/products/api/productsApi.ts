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
    pagination: { totalRow: number; pageIndex: number; pagesize: number; filter?: string };
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

// ---------- helpers ----------
function buildQuery(base: string, params: Record<string, any>) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    usp.set(k, String(v));
  });
  const qs = usp.toString();
  return qs ? `${base}?${qs}` : base;
}

// ---------- Filters type (export) ----------
export type ProductListFilters = {
  pageIndex?: number;          // Pagination.PageIndex
  pageSize?: number;           // Pagination.PageSize
  filter?: string;             // Pagination.Filter
  categoryId?: number | null;  // CategoryId
};

// ---------- Core hook (export) ----------
export function useGetProducts(params: ProductListFilters) {
  const base = endpoints.products?.list ?? '/Product/GetProducts';
  const url = buildQuery(base, {
    'Pagination.PageIndex': params.pageIndex ?? 0,
    'Pagination.PageSize': params.pageSize ?? 20,
    'Pagination.Filter': params.filter,
    CategoryId: typeof params.categoryId === 'number' ? params.categoryId : undefined,
  });

  const { data, isLoading, error, isValidating, mutate } = useSWR<GetProductsResp>(
    url,
    fetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const products = data?.result?.products ?? [];
    const currency = data?.result?.currency ?? 'IRT';
    const pagination = data?.result?.pagination;
    const total = pagination?.totalRow ?? 0;
    const pageSize = pagination?.pagesize ?? (params.pageSize ?? 20);
    const pageCount = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));

    return {
      products,
      currency,
      pagination,
      pageCount,
      productsLoading: isLoading,
      productsError: error,
      productsValidating: isValidating,
      refetchProducts: mutate,
    };
  }, [data, error, isLoading, isValidating, mutate, params.pageSize]);

  return memoizedValue;
}

// ---------- Backward-compatible wrapper (export) ----------
export function GetProductsApi(pageIndex = 0, categoryId?: number | null) {
  return useGetProducts({
    pageIndex,
    pageSize: 20,
    filter: undefined,
    categoryId: typeof categoryId === 'number' ? categoryId : undefined,
  });
}

// ---------- get one ----------
export async function getProduct(productId: string) {
  const url = endpoints.products?.getOne ?? '/Product/GetProduct';
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
  const url = endpoints.products?.add ?? '/Product/AddProduct';
  const body = { ...payload, status: 1 }; // enforce status=1
  const res = await axiosInstance.post(url, body, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

// ---------- add image (multipart) ----------
export async function addProductImage(payload: { productId: string; image: File }) {
  const url = endpoints.products?.addImage ?? '/Product/AddProductImage';
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
  isPublished:boolean
}) {
  const url = endpoints.products?.update ?? '/Product/UpdateProduct';
  const body = { ...payload, status: 1 };
  const res = await axiosInstance.post(url, body, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

// ---------- delete product (DELETE ?ProductId=) ----------
export async function removeProduct(productId: string) {
  const url = endpoints.products?.delete ?? '/Product/RemoveProduct';
  const res = await axiosInstance.delete(url, { params: { ProductId: productId } });
  return res.data;
}

// ---------- delete product image (DELETE with JSON body) ----------
export async function removeProductImage(payload: { productId: string; imageId: number }) {
  const url = endpoints.products?.removeImage ?? '/Product/RemoveProductImage';
  const res = await axiosInstance.delete(url, {
    data: payload,
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

// ---------- comments ----------
export async function getProductComments(params: {
  productId: string;
  status?: boolean;
  isRemoved?: boolean;
  pageIndex?: number;
}) {
  const url = endpoints.products?.comment?.get ?? '/Product/GetProductComments';
  const res = await axiosInstance.get(url, {
    params: {
      'CommentFilters.ProductId': params.productId,
      'CommentFilters.Status': params.status ?? false,
      'CommentFilters.IsRemoved': params.isRemoved ?? false,
      'Pagination.PageIndex': params.pageIndex ?? 0,
    },
  });
  return res.data;
}

export async function changeProductCommentStatus(params: { commentId: string; status: boolean }) {
  const url = endpoints.products?.comment?.edit ?? '/Product/ChangeProductCommentStatus';
  const res = await axiosInstance.post(url, null, {
    params: { CommentId: params.commentId, Status: params.status },
  });
  return res.data;
}
