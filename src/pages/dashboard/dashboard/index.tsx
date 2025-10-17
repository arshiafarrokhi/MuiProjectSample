import { Helmet } from 'react-helmet-async';

import { Box } from '@mui/material';

import { CONFIG } from 'src/global-config';

import { LoadingScreen } from 'src/components/loading-screen/loading-screen';

import { DashboardReportView } from 'src/sections/dashboard/view/view';
import { useGetDashboardReport } from 'src/sections/dashboard/api/reportApi';

// import { useGetDashboardReport } from 'src/sections/report/api/reportApi';
// import { DashboardReportView } from 'src/sections/report/views/DashboardReportView';

const metadata = { title: `گزارش‌ها | داشبورد - ${CONFIG.appName}` };

export default function ReportPage() {
  const { report, reportLoading, reportValidating, refetchReport } = useGetDashboardReport();

  if (reportLoading) return <LoadingScreen />;

  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <Box sx={{ px: { xs: 2, md: 3 }, pt: 2 }}>
        <DashboardReportView
          report={report}
          validating={reportValidating}
          onRefresh={() => refetchReport(undefined, { revalidate: true })}
        />
      </Box>
    </>
  );
}
