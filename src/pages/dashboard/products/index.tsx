// src/pages/dashboard/products/index.tsx
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate } from 'react-router';

import { Box, Tab, Tabs } from '@mui/material';

import { CONFIG } from 'src/global-config';

import { LoadingScreen } from 'src/components/loading-screen/loading-screen';

import { ProductsView } from 'src/sections/products/views/view';
import CategoriesTab from 'src/sections/products/views/CategoriesTab';
import { GetProductsApi } from 'src/sections/products/api/productsApi';

const metadata = { title: `Products | Dashboard - ${CONFIG.appName}` };

export default function ProductsPage() {
  const [categoryIdFilter, setCategoryIdFilter] = useState<number | null>(null);
  const { products, currency, productsLoading, refetchProducts } = GetProductsApi(
    0,
    categoryIdFilter ?? undefined
  );

  const location = useLocation();
  const nav = useNavigate();

  // بازگشت از صفحه‌ی ادیت → رفرش
  useEffect(() => {
    if ((location.state as any)?.refetch) {
      if (refetchProducts) refetchProducts(undefined, { revalidate: true });
      nav(location.pathname, { replace: true, state: null });
    }
  }, [location.state, refetchProducts, nav, location.pathname]);

  // مدیریت تب‌ها
  const [tab, setTab] = useState<number>(0); // 0: محصولات، 1: دسته‌بندی‌ها

  if (productsLoading && tab === 0) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <Box sx={{ px: { xs: 2, md: 3 }, pt: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="محصولات" />
          <Tab label="دسته‌بندی‌ها" />
        </Tabs>

        {tab === 0 && (
          <ProductsView
            products={products}
            currency={currency}
            onRefetch={() => refetchProducts?.(undefined, { revalidate: true })}
          />
        )}

        {tab === 1 && <CategoriesTab />}
      </Box>
    </>
  );
}
