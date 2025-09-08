// ============================
import { Helmet } from 'react-helmet-async';
import { Box, Tab, Tabs } from '@mui/material';

import { CONFIG } from 'src/global-config';
import { UsersView } from 'src/sections/users/views/view';

const metadata = { title: `users Page | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <Box sx={{ px: { xs: 2, md: 3 }, pt: 2 }}>
        {/* بدون props → ویو خودش دیتا را می‌گیرد و کنترل فیلترها دست کاربر است */}
        <UsersView />
      </Box>
    </>
  );
}
