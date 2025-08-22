// import { Outlet } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { Navigate, useParams } from 'react-router';

import { CONFIG } from 'src/global-config';

import { LoadingScreen } from 'src/components/loading-screen';

import { GetKnowledgeBaseDSApi } from 'src/sections/knowledgeBases/apis/dataSource/getKnowledgeBaseDSApi';
import EditKnowledgeBasesDatasetSettingsView from 'src/sections/knowledgeBases/views/EditKnowledgeBasesDatasetSettingsView';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const metadata = { title: `AgentBots Page | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { user } = useAuthContext();
  const { knId } = useParams();
  const {
    knowledgeBaseDS,
    knowledgeBaseDSError,
    knowledgeBaseDSLoading,
    knowledgeBaseDSValidating,
    mutateKnowledgeBaseDS,
  } = GetKnowledgeBaseDSApi(user?.account_id, knId);

  if (knowledgeBaseDSError) {
    return <Navigate to="/404" replace />;
  }
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>
      <EditKnowledgeBasesDatasetSettingsView
        knowledgeBaseDSError={knowledgeBaseDSError}
        knowledgeBaseDS={knowledgeBaseDS}
        knowledgeBaseDSLoading={knowledgeBaseDSLoading}
        knowledgeBaseDSValidating={knowledgeBaseDSValidating}
        mutateKnowledgeBaseDS={mutateKnowledgeBaseDS}
      />
    </>
  );
}
