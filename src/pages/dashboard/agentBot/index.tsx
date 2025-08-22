import { Navigate } from 'react-router';
// import { Outlet } from 'react-router';
import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { LoadingScreen } from 'src/components/loading-screen';

import { AgentBotsView } from 'src/sections/agentBots/views/view';
import { GetBotsApi } from 'src/sections/agentBots/api/getBotsApi';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const metadata = { title: `AgentBots Page | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { user } = useAuthContext();

  const { bots, botsError, botsLoading, mutateBots } = GetBotsApi(user?.account_id);

  if (botsLoading) {
    return <LoadingScreen />;
  }

  if (botsError) {
    return <Navigate to="/404" replace />;
  }
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <AgentBotsView bots={bots} mutateBots={mutateBots} />
    </>
  );
}
