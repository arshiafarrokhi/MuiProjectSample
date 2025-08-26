import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import { useMemo } from 'react';

import axiosInstance, { fetcher, endpoints } from 'src/lib/axios';
import { GetProductSimResp, GetProductSimsResp } from '../types';
const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ---------- list (SWR hook) ----------
export function GetProductSimsApi(pageIndex = 0) {
  const base = endpoints.productSim?.list ?? '/ProductSIM/GetProducts';
  // per spec Paging.PageIndex=0 (server expects `Paging.PageIndex`)
  const url = `${base}?Paging.PageIndex=${pageIndex}`;

  const { data, isLoading, error, isValidating, mutate } = useSWR<GetProductSimsResp>(
    url,
    fetcher,
    swrOptions
  );

  const memoizedValue = useMemo(
    () => ({
      productSims: data?.result?.products ?? [],
      pagination: data?.result?.paging,
      productSimsLoading: isLoading,
      productSimsError: error,
      productSimsValidating: isValidating,
      refetchProductSims: mutate,
    }),
    [data, error, isLoading, isValidating, mutate]
  );

  return memoizedValue;
}

// ---------- get one ----------
export async function getProductSim(productId: string) {
  const url = endpoints.productSim?.getOne ?? '/ProductSIM/GetProduct';
  const res = await axiosInstance.get<GetProductSimResp>(url, { params: { ProductId: productId } });
  return res.data;
}

// ---------- add (multipart) ----------
export async function addProductSim(payload: {
  name: string;
  price: number | string;
  image: File;
  simOperatorId: number;
  description?: string;
}) {
  const url = endpoints.productSim?.add ?? '/api/ProductSIM/AddNewProduct';
  const form = new FormData();
  form.append('Name', String(payload.name));
  form.append('Price', String(payload.price));
  if (typeof payload.description !== 'undefined' && payload.description !== null) {
    form.append('Description', String(payload.description));
  }
  form.append('Image', payload.image);
  form.append('SIMOperatorId', String(payload.simOperatorId));

  // fields that must always be sent
  form.append('Status', '1');
  form.append('IsPublish', 'true');

  const res = await axiosInstance.post(url, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

// ---------- update (query params + optional form image) ----------
export async function updateProductSim(payload: {
  productId: string;
  name: string;
  price: number | string;
  description?: string;
  image?: File | null;
}) {
  const url = endpoints.productSim?.update ?? '/ProductSIM/UpdateProduct';
  const params: Record<string, string> = {
    ProductId: payload.productId,
    Price: String(payload.price),
    Name: String(payload.name),
  };
  if (typeof payload.description !== 'undefined' && payload.description !== null) {
    params.Description = String(payload.description);
  }

  const form = new FormData();
  if (payload.image) form.append('Image', payload.image);

  const res = await axiosInstance.post(url, form, {
    params,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

// ---------- delete (DELETE with body ProductId) ----------
export async function removeProductSim(productId: string) {
  const url = endpoints.productSim?.delete;
  const res = await axiosInstance.delete(url, {
    data: { ProductId: productId },
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

// ---------- countries & operators ----------
export async function getCountries() {
  const url = endpoints.productSim?.countries;
  const res = await axiosInstance.get(url);
  return res.data;
}

export async function getOperators(countryId: number) {
  // endpoints may contain the fixed query string for Paging/IsActive/IsRemoved
  const base = endpoints.productSim?.operators;
  const res = await axiosInstance.get(base, {
    params: { 'Paging.PageIndex': 0, IsActive: true, IsRemoved: false, CountryId: countryId },
  });
  return res.data;
}
