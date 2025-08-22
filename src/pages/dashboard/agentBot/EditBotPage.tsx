import { removeLastSlash } from 'minimal-shared/utils';
import { Outlet, useParams, useLocation } from 'react-router';

import { Tab, Tabs } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import SettingsIcon from '@mui/icons-material/Settings';

import { RouterLink } from 'src/routes/components';

import { useTranslate } from 'src/locales';
import { DashboardContent } from 'src/layouts/dashboard';

export default function Page() {
  const { botId, botName } = useParams();
  const location = useLocation();
  const pathname = removeLastSlash(location.pathname);
  const authTrans = useTranslate('bots');

  const NAV_ITEMS = [
    {
      label: authTrans.t('َAssistant Setting'),
      icon: <SettingsIcon />,
      href: `/dashboard/agentBots/${botId}/${botName}/edit`,
    },
    {
      label: authTrans.t('Model Setting'),
      icon: <SchoolIcon />,
      href: `/dashboard/agentBots/${botId}/${botName}/edit/model-settings`,
    },
  ];

  return (
    <DashboardContent>
      <Tabs value={pathname} sx={{ mb: { xs: 3, md: 5 } }}>
        {NAV_ITEMS.map((tab) => (
          <Tab
            component={RouterLink}
            key={tab.href}
            label={tab.label}
            icon={tab.icon}
            value={tab.href}
            href={tab.href}
          />
        ))}
      </Tabs>
      <Outlet />
    </DashboardContent>
  );
}
