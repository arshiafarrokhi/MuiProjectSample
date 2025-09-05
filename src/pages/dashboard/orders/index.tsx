import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/global-config';
import { Box } from '@mui/material';
import OrdersView from 'src/sections/orders/views/view';
// import OrdersView from 'src/sections/orders/views/view';

const metadata = { title: `Orders | Dashboard - ${CONFIG.appName}` };

export default function OrdersPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <Box sx={{ px: { xs: 2, md: 3 }, pt: 2 }}>
        <OrdersView />
      </Box>
    </>
  );
}
