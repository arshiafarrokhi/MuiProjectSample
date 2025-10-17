import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Box, Tab, Tabs } from '@mui/material';

import { CONFIG } from 'src/global-config';
import { ProductsView } from 'src/sections/products/views/view';
import CategoriesTab from 'src/sections/products/views/CategoriesTab';

const metadata = { title: `محصولات | داشبورد - ${CONFIG.appName}` };

export default function ProductsPage() {
  const [tab, setTab] = useState<number>(0); // 0: محصولات، 1: دسته‌بندی‌ها

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
          // بدون props → ویو خودش دیتا را می‌گیرد و کنترل فیلترها را به کاربر می‌دهد
          <ProductsView />
        )}

        {tab === 1 && <CategoriesTab />}
      </Box>
    </>
  );
}
