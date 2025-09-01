import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/global-config';
import { LoadingScreen } from 'src/components/loading-screen/loading-screen';
import { useGetAdmins } from 'src/sections/admin/api/adminApi';
import { AdminsView } from 'src/sections/admin/view';

const metadata = { title: `Admin Management | Dashboard - ${CONFIG.appName}` };

export default function AdminPage() {
  const { admins, adminsLoading, refetchAdmins } = useGetAdmins();

  if (adminsLoading) return <LoadingScreen />;

  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <AdminsView
        admins={admins}
        onRefetch={() => refetchAdmins(undefined, { revalidate: true })}
      />
    </>
  );
}
