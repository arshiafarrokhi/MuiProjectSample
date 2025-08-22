import { Navigate } from 'react-router';
import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { LoadingScreen } from 'src/components/loading-screen';

import { KnowledgeBasesView } from 'src/sections/knowledgeBases/views/view';
import { GetKnowledgeBasesApi } from 'src/sections/knowledgeBases/apis/getKnowledgeBasesApi';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const metadata = { title: `knowledgeBases Page | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { user } = useAuthContext();

  const { knowledgeBases, knowledgeBasesError, knowledgeBasesLoading, mutateKnowledgeBases } =
    GetKnowledgeBasesApi(user?.account_id);

  if (knowledgeBasesLoading) {
    return <LoadingScreen />;
  }

  if (knowledgeBasesError) {
    return <Navigate to="/404" replace />;
  }
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <KnowledgeBasesView
        knowledgeBases={knowledgeBases}
        mutateKnowledgeBases={mutateKnowledgeBases}
      />
    </>
  );
}
