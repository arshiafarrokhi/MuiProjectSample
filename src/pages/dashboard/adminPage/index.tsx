import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

import { Box, Tabs, Tab } from '@mui/material';

import { CONFIG } from 'src/global-config';
import { LoadingScreen } from 'src/components/loading-screen/loading-screen';

import { useGetAdmins } from 'src/sections/admin/api/adminApi';
import { AdminsView } from 'src/sections/admin/view';
import AdminLoginLogsTab from 'src/sections/admin/components/AdminLoginLogsTab';

const metadata = { title: `Admin Management | Dashboard - ${CONFIG.appName}` };

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

  // همون هوک قبلی برای تب "ادمین‌ها"
  const { admins, adminsLoading, refetchAdmins } = useGetAdmins();

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

        {/* تب ادمین‌ها: همون AdminsView بدون تغییر */}
        <TabPanel value={tab} index={0}>
          {adminsLoading ? (
            <LoadingScreen />
          ) : (
            <AdminsView
              admins={admins}
              onRefetch={() => refetchAdmins(undefined, { revalidate: true })}
            />
          )}
        </TabPanel>

        {/* تب لاگ‌های ورود: تب جدید */}
        <TabPanel value={tab} index={1}>
          <AdminLoginLogsTab />
        </TabPanel>
      </Box>
    </>
  );
}
