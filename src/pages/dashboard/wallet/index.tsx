import { Helmet } from 'react-helmet-async';
import { Box } from '@mui/material';

import { CONFIG } from 'src/global-config';
import { LoadingScreen } from 'src/components/loading-screen/loading-screen';
import CreditIncreaseRequestsView from 'src/sections/wallet/views/CreditIncreaseRequestsView';
import { useGetCreditIncreaseRequests } from 'src/sections/wallet/api/creditIncreaseApi';

const metadata = { title: `Credit Increase Requests | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  // initial load for smoother UX
  const { requestsLoading } = useGetCreditIncreaseRequests({ pageIndex: 1, pageSize: 20 });

  if (requestsLoading) return <LoadingScreen />;

  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>
      <Box sx={{ px: { xs: 2, md: 3 }, pt: 2 }}>
        <CreditIncreaseRequestsView />
      </Box>
    </>
  );
}
