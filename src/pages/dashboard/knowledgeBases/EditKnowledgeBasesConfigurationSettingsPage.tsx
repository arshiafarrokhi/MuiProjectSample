// import { Outlet } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { Navigate, useParams } from 'react-router';

import { CONFIG } from 'src/global-config';

import { LoadingScreen } from 'src/components/loading-screen';

import { GetChunkMethodsApi } from 'src/sections/knowledgeBases/apis/getChunkMethodsApi';
import { GetDefaultEditKnowledgeBases } from 'src/sections/knowledgeBases/apis/getDefaultEditKnowledgeBasesApi';
import EditKnowledgeBasesConfigurationSettingsView from 'src/sections/knowledgeBases/views/EditKnowledgeBasesConfigurationSettingsView';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const metadata = { title: `AgentBots Page | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { user } = useAuthContext();
  const { knId } = useParams();
  const { ChunkMethods } = GetChunkMethodsApi();

  const {
    DefaultEditKnowledgeBases,
    DefaultEditKnowledgeBasesError,
    DefaultEditKnowledgeBasesLoading,
    DefaultEditKnowledgeBasesValidating,
  } = GetDefaultEditKnowledgeBases(user?.account_id, knId);

  if (
    !DefaultEditKnowledgeBases ||
    DefaultEditKnowledgeBasesLoading ||
    DefaultEditKnowledgeBasesValidating ||
    DefaultEditKnowledgeBasesError
    // LlmsLoading ||
    // LlmsValidating
  ) {
    return <LoadingScreen />;
  }

  // if (DefaultEditKnowledgeBasesError) {
  //   return <Navigate to="/404" replace />;
  // }
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>
      <EditKnowledgeBasesConfigurationSettingsView
        ChunkMethods={ChunkMethods}
        DefaultEditKnowledgeBases={DefaultEditKnowledgeBases}
      />
    </>
  );
}
