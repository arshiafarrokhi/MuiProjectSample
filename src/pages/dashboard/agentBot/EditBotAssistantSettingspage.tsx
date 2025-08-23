// import { Outlet } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { Navigate, useParams } from 'react-router';

import { CONFIG } from 'src/global-config';

import { LoadingScreen } from 'src/components/loading-screen';

import { GetDefaultEditBot } from 'src/sections/agentBots/api/getDefaultEditBotApi';
import EditBotAssistantSettingsView from 'src/sections/agentBots/views/EditBotAssistantSettingsView';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const metadata = { title: `AgentBots Page | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { user } = useAuthContext();
  const { botId } = useParams();

  const { DefaultEditBot, DefaultEditBotLoading, DefaultEditBotError, DefaultEditBotValidating } =
    GetDefaultEditBot(user?.account_id, botId);

  // if (!DefaultEditBot || DefaultEditBotLoading || DefaultEditBotValidating || DefaultEditBotError) {
  //   return <LoadingScreen />;
  // }

  // if (DefaultEditBotError) {
  //   return <Navigate to="/404" replace />;
  // }
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>
      <EditBotAssistantSettingsView DefaultEditBot={DefaultEditBot} />
    </>
  );
}
