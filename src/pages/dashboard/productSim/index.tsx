// src/pages/dashboard/products/index.tsx
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate } from 'react-router';
import { CONFIG } from 'src/global-config';
import { LoadingScreen } from 'src/components/loading-screen/loading-screen';
import { ProductsView } from 'src/sections/products/views/view';
import { GetProductsApi } from 'src/sections/products/api/productsApi';

import { Box, Tabs, Tab } from '@mui/material';
import CategoriesTab from 'src/sections/products/views/CategoriesTab';
import { ProductSimView } from 'src/sections/productSim/views/view';

const metadata = { title: `Products | Dashboard - ${CONFIG.appName}` };

export default function ProductsPage() {
  // const [categoryIdFilter, setCategoryIdFilter] = useState<number | null>(null);
  // const { products, currency, productsLoading, refetchProducts } = GetProductsApi(
  //   0,
  //   categoryIdFilter ?? undefined
  // );



  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <Box sx={{ px: { xs: 2, md: 3 }, pt: 2 }}>


        <ProductSimView
          productSim={products}
          onRefetch={() => refetchProducts?.(undefined, { revalidate: true })}
        />

      </Box>
    </>
  );
}
