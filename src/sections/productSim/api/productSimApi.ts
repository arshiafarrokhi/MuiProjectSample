import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';
import { useMemo } from 'react';

import axiosInstance, { fetcher, endpoints } from 'src/lib/axios';

import type { GetProductSimResp, GetProductSimsResp } from '../types';

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
  const qs = usp.toString();
  return qs ? `${base}?${qs}` : base;
}

export type ProductSimFilters = {
  filter?: string; // -> Paging.Filter
  operatorId?: number; // -> OperatorId
  countryId?: number; // -> CountryId
  isRemoved?: boolean; // -> IsRemoved
  internet?: boolean; // -> Internet
  daysFilter?: number; // -> DaysFilter
};

// ---------- list (SWR hook) ----------
// Default: Paging.PageIndex=1 and Paging.PageSize=10
export function GetProductSimsApi(pageIndex = 1, pageSize = 10, filters?: ProductSimFilters) {
  const base = endpoints.productSim?.list ?? '/ProductSIM/GetProducts';

  const url = buildQuery(base, {
    'Paging.PageIndex': pageIndex,
    'Paging.PageSize': pageSize,
    'Paging.Filter': filters?.filter,
    OperatorId: filters?.operatorId,
    CountryId: filters?.countryId,
    IsRemoved: typeof filters?.isRemoved === 'boolean' ? filters?.isRemoved : undefined,
    Internet: typeof filters?.internet === 'boolean' ? filters?.internet : undefined,
    DaysFilter: typeof filters?.daysFilter === 'number' ? filters?.daysFilter : undefined,
  });

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
  image: File; // فقط این در body (binary)
  simOperatorId: number; // Query
  description?: string;
  internetHourly: boolean; // Internet.Hourly
  internetDays: number | string; // Internet.Days
  internetVolume: number | string; // Internet.Volume
  internetUnit: 1 | 2; // Internet.Unit (1=MB, 2=GB)
  internetSimType: 1 | 2; // Internet.SimType (1=permanent, 2=credit)
  internetInternetType: 1 | 2 | 3 | 4; // Internet.InternetType
}) {
  const url = endpoints.productSim?.add ?? '/api/ProductSIM/AddNewProduct';

  const form = new FormData();
  form.append('Image', payload.image);

  const params: Record<string, any> = {
    Name: payload.name,
    Price: payload.price,
    SIMOperatorId: payload.simOperatorId,
    Status: 1,
    IsPublish: true,
    'Internet.Hourly': payload.internetHourly,
    'Internet.Days': payload.internetDays,
    'Internet.Volume': payload.internetVolume,
    'Internet.Unit': payload.internetUnit,
    'Internet.SimType': payload.internetSimType,
    'Internet.InternetType': payload.internetInternetType,
  };

  if (payload.description != null && String(payload.description).trim() !== '') {
    params.Description = payload.description;
  }

  const res = await axiosInstance.post(url, form, {
    params,
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

// ---------- delete (DELETE with params) ----------
export async function removeProductSim(productId: string) {
  const url = endpoints.productSim?.delete;
  const res = await axiosInstance.delete(url, {
    params: { ProductId: productId },
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
  const base = endpoints.productSim?.operators;
  const res = await axiosInstance.get(base, {
    params: { 'Paging.PageIndex': 0, IsActive: true, IsRemoved: false, CountryId: countryId },
  });
  return res.data;
}

/* ---------- countries ---------- */
export function useGetCountries(isActive?: boolean) {
  const base = endpoints.productSim.countries;
  const url = typeof isActive === 'boolean' ? `${base}?IsActive=${isActive}` : `${base}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<any>(url, fetcher, swrOptions);

  const raw = Array.isArray(data?.result?.countries) ? data.result.countries : [];
  // ✅ normalize to { id: number, name: string }
  const countries = raw
    .map((c: any) => ({
      id: Number(c.id ?? c.countryId ?? c.Id),
      name: c.name ?? c.title ?? c.Name ?? '',
    }))
    .filter((c: any) => Number.isFinite(c.id));

  return {
    countries,
    countriesLoading: isLoading,
    countriesError: error,
    countriesValidating: isValidating,
    refetchCountries: mutate,
  };
}

// ---- Operators (وابسته به CountryId) ----
export function useGetOperators(countryId?: number, isActive?: boolean) {
  const base = endpoints.productSim.operators;

  const qs = new URLSearchParams();
  qs.set('Paging.PageIndex', '0');
  if (countryId) qs.set('CountryId', String(countryId));
  if (typeof isActive === 'boolean') qs.set('IsActive', String(isActive));

  const url = countryId ? `${base}?${qs.toString()}` : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<any>(url, fetcher, swrOptions);

  const raw = Array.isArray(data?.result?.operators) ? data.result.operators : [];
  // ✅ normalize to { id: number, name: string }
  const operators = raw
    .map((op: any) => ({
      id: Number(op.id ?? op.operatorId ?? op.Id),
      name: op.name ?? op.title ?? op.Name ?? '',
    }))
    .filter((op: any) => Number.isFinite(op.id));

  return {
    operators,
    operatorsLoading: isLoading,
    operatorsError: error,
    operatorsValidating: isValidating,
    refetchOperators: mutate,
  };
}
export async function changeCountryActivity(args: { countryId: number; active: boolean }) {
  const base = endpoints.productSim.changeCountryActivity;
  const fullUrl = `${base}?CountryId=${args.countryId}&Active=${args.active}`;
  const res = await axiosInstance.put(fullUrl);
  return res.data;
}

export async function changeOperatorActivity(args: { operatorId: number; active: boolean }) {
  const base = endpoints.productSim.changeOperatorActivity;
  const fullUrl = `${base}?OperatorId=${args.operatorId}&Active=${args.active}`;
  const res = await axiosInstance.put(fullUrl);
  return res.data;
}
