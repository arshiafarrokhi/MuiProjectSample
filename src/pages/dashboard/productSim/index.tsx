import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate } from 'react-router';

import { Box } from '@mui/material';

import { CONFIG } from 'src/global-config';

import { ProductSimView } from 'src/sections/productSim/views/view';

const metadata = { title: `محصولات | داشبورد - ${CONFIG.appName}` };

export default function ProductsPage() {
  const location = useLocation();
  const nav = useNavigate();

  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <Box sx={{ px: { xs: 2, md: 3 }, pt: 2 }}>
        <ProductSimView />
      </Box>
    </>
  );
}
