import { useState } from 'react';
// src/pages/dashboard/products/index.tsx
import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { LoadingScreen } from 'src/components/loading-screen/loading-screen';

import { ProductsView } from 'src/sections/products/views/view';
import { GetProductsApi } from 'src/sections/products/api/productsApi';

const metadata = { title: `Products | Dashboard - ${CONFIG.appName}` };

export default function ProductsPage() {
  const [activeOnly, setActiveOnly] = useState(true);
  const { products, productsLoading, productsError, refetchProducts } = GetProductsApi(
    1,
    activeOnly
  );

  if (productsLoading) return <LoadingScreen />;

  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <ProductsView
        products={products}
        activeOnly={activeOnly}
        setActiveOnly={setActiveOnly}
        onRefetch={() => refetchProducts(undefined, { revalidate: true })}
      />
    </>
  );
}
