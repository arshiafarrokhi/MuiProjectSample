import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

// import { LoadingScreen } from 'src/components/loading-screen';
import { LoadingScreen } from 'src/components/loading-screen/loading-screen';

import { UsersView } from 'src/sections/users/views/view';
import { GetUsersApi } from 'src/sections/users/api/usersApi';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const metadata = { title: `users Page | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { user } = useAuthContext();

  const [activeOnly, setActiveOnly] = useState(true);

  const { users, usersError, usersLoading, refetchUsers } = GetUsersApi(1, activeOnly);
  console.log(users);

  if (usersLoading) {
    return <LoadingScreen />;
  }

  // if (usersError) {
  //   return <Navigate to="/404" replace />;
  // }

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <UsersView
        users={users}
        activeOnly={activeOnly}
        setActiveOnly={setActiveOnly}
        onRefetch={() => refetchUsers(undefined, { revalidate: true })}
      />
    </>
  );
}
