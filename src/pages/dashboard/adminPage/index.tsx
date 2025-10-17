import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

import { Box, Tab, Tabs } from '@mui/material';

import { CONFIG } from 'src/global-config';

import { AdminsView } from 'src/sections/admin/view';
import AdminLoginLogsTab from 'src/sections/admin/components/AdminLoginLogsTab';

const metadata = { title: `مدیریت ادمین | داشبورد - ${CONFIG.appName}` };

function a11yProps(index: number) {
  return { id: `admin-tab-${index}`, 'aria-controls': `admin-tabpanel-${index}` };
}

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState(0);

  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <Box sx={{ px: { xs: 2, md: 3 }, pt: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="ادمین‌ها" {...a11yProps(0)} />
          <Tab label="لاگ‌های ورود" {...a11yProps(1)} />
        </Tabs>

        <TabPanel value={tab} index={0}>
          {/* بدون props → ویو خودش دیتا را می‌گیرد و کنترل فیلترها دست کاربر است */}
          <AdminsView />
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <AdminLoginLogsTab />
        </TabPanel>
      </Box>
    </>
  );
}
