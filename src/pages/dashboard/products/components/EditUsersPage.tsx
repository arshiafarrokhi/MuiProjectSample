import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import EditUsersView from 'src/sections/users/components/EditUsersView';

// ----------------------------------------------------------------------

const metadata = { title: `users Edit Page | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <EditUsersView />
    </>
  );
}
