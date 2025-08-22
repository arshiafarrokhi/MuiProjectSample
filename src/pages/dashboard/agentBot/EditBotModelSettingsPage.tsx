// import { Outlet } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { Navigate, useParams } from 'react-router';

import { CONFIG } from 'src/global-config';

import { LoadingScreen } from 'src/components/loading-screen';

import { GetLlmsApi } from 'src/sections/agentBots/api/getLlmsApi';
import { GetDefaultEditBot } from 'src/sections/agentBots/api/getDefaultEditBotApi';
import EditBotModelSettingsSettingView from 'src/sections/agentBots/views/EditBotModelSettingsView';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const metadata = { title: `AgentBots Page | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { user } = useAuthContext();
  const { botId } = useParams();

  const { DefaultEditBot, DefaultEditBotLoading, DefaultEditBotError, DefaultEditBotValidating } =
    GetDefaultEditBot(user?.account_id, botId);

  const { Llms, LlmsError, LlmsLoading, LlmsValidating, mutateLlms } = GetLlmsApi();

  if (
    !DefaultEditBot ||
    DefaultEditBotLoading ||
    DefaultEditBotValidating ||
    DefaultEditBotError ||
    LlmsLoading ||
    LlmsValidating
  ) {
    return <LoadingScreen />;
  }

  if (DefaultEditBotError || LlmsError) {
    return <Navigate to="/404" replace />;
  }
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>
      <EditBotModelSettingsSettingView
        DefaultEditBot={DefaultEditBot}
        Llms={Llms}
        mutateLlms={mutateLlms}
      />
    </>
  );
}
