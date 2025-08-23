import { Navigate } from 'react-router';
import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

// import { LoadingScreen } from 'src/components/loading-screen';

import { UsersView } from 'src/sections/users/views/view';
import { GetAgentApi } from 'src/sections/users/api/getAgentsApi';
import { GetUsersApi } from 'src/sections/users/api/usersApi';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const metadata = { title: `users Page | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { user } = useAuthContext();

  const { users, usersError, usersLoading } = GetUsersApi(1, true);

  // if (usersLoading) {
  //   return <LoadingScreen />;
  // }

  // if (usersError) {
  //   return <Navigate to="/404" replace />;
  // }

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <UsersView users={users} />
    </>
  );
}
