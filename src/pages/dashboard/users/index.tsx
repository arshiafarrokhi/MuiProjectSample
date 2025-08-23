import { Navigate } from 'react-router';
import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

// import { LoadingScreen } from 'src/components/loading-screen';

import { UsersView } from 'src/sections/inboxes/views/view';
import { GetAgentApi } from 'src/sections/inboxes/api/getAgentsApi';
import { GetInboxesApi } from 'src/sections/inboxes/api/inboxesApi';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const metadata = { title: `users Page | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { user } = useAuthContext();

  const { inboxes, inboxesError, inboxesLoading } = GetInboxesApi(user?.account_id);

  // if (inboxesLoading) {
  //   return <LoadingScreen />;
  // }

  // if (inboxesError) {
  //   return <Navigate to="/404" replace />;
  // }

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      {/* <UsersView inboxes={inboxes} /> */}
    </>
  );
}
