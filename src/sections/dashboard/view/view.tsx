import { toast } from 'sonner';
import { useMemo } from 'react';

import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import SimCardRoundedIcon from '@mui/icons-material/SimCardRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import RequestPageRoundedIcon from '@mui/icons-material/RequestPageRounded';
import AssignmentLateRoundedIcon from '@mui/icons-material/AssignmentLateRounded';
import VideogameAssetRoundedIcon from '@mui/icons-material/VideogameAssetRounded';
import SignalCellularAltRoundedIcon from '@mui/icons-material/SignalCellularAltRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import {
  Box,
  Grid,
  Card,
  Stack,
  Button,
  Divider,
  Typography,
  CardHeader,
  CardContent,
  LinearProgress,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import type { DashboardReport } from '../api/reportApi';
// import type { DashboardReport } from '../api/reportApi';

const toFaDigits = (val: string | number | undefined | null) =>
  (val ?? '').toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

const formatNumberFa = (n?: number | null) =>
  typeof n === 'number' ? toFaDigits(new Intl.NumberFormat('fa-IR').format(n)) : '—';

type Props = {
  report?: DashboardReport;
  onRefresh?: () => void;
  validating?: boolean;
};

export function DashboardReportView({ report, onRefresh, validating }: Props) {
  const router = useRouter()
  const safe = useMemo<DashboardReport>(
    () => ({
      usersCount: report?.usersCount ?? 0,
      adminsCount: report?.adminsCount ?? 0,
      creditIncreaseRequestsCount: report?.creditIncreaseRequestsCount ?? 0,
      unfulfilledOrdersCount: report?.unfulfilledOrdersCount ?? 0,
      completedOrdersCount: report?.completedOrdersCount ?? 0,
      inaxCredit: report?.inaxCredit ?? 0,
      gameProductsCount: report?.gameProductsCount ?? 0,
      simProductCount: report?.simProductCount ?? 0,
      simActiveOperatorsCount: report?.simActiveOperatorsCount ?? 0,
      simOperatorsCount: report?.simOperatorsCount ?? 0,
    }),
    [report]
  );

  const activeOpsPercent =
    safe.simOperatorsCount > 0
      ? Math.min(100, Math.round((safe.simActiveOperatorsCount / safe.simOperatorsCount) * 100))
      : 0;

  const itemsTop = [
    {
      label: 'کاربران',
      value: safe.usersCount,
      icon: <PeopleAltRoundedIcon />,
      path: '/dashboard/users',
    },
    {
      label: 'ادمین‌ها',
      value: safe.adminsCount,
      icon: <AdminPanelSettingsRoundedIcon />,
      path: '/dashboard/admin',
    },
    {
      label: 'درخواست‌های افزایش اعتبار',
      value: safe.creditIncreaseRequestsCount,
      icon: <RequestPageRoundedIcon />,
      path: '/dashboard/creditIncreaseRequests',
    },
  ];

  const itemsOrders = [
    {
      label: 'سفارش‌های انجام نشده',
      value: safe.unfulfilledOrdersCount,
      icon: <AssignmentLateRoundedIcon />,
    },
    {
      label: 'سفارش‌های تکمیل‌شده',
      value: safe.completedOrdersCount,
      icon: <TaskAltRoundedIcon />,
    },
  ];

  const itemsProducts = [
    { label: 'محصولات بازی', value: safe.gameProductsCount, icon: <VideogameAssetRoundedIcon /> },
    { label: 'محصولات سیم‌کارت', value: safe.simProductCount, icon: <SimCardRoundedIcon /> },
  ];

  return (
    <DashboardContent maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4">گزارش‌ها</Typography>
        <Button
          startIcon={<RefreshRoundedIcon />}
          onClick={() => {
            onRefresh?.();
            toast.info('در حال تازه‌سازی...');
          }}
          disabled={!!validating}
          variant="outlined"
        >
          تازه‌سازی
        </Button>
      </Stack>

      {/* ردیف بالا */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {itemsTop.map((it) => (
          <Grid key={it.label} item xs={12} md={4}>
            <Card variant="outlined" sx={{ borderRadius: 2, cursor:'pointer' }} onClick={() => router.push(`${it.path}`)}>
              <CardHeader
                avatar={it.icon}
                
                title={
                  <Typography variant="subtitle2" color="text.secondary">
                    {it.label}
                  </Typography>
                }
              />
              <CardContent>
                <Typography variant="h4" fontWeight={800}>
                  {formatNumberFa(it.value)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* سفارش‌ها + اعتبار اینکس */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
            <CardHeader
              title={
                <Typography variant="subtitle2" color="text.secondary">
                  وضعیت سفارش‌ها
                </Typography>
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                {itemsOrders.map((it) => (
                  <Grid key={it.label} item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      {it.icon}
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {it.label}
                        </Typography>
                        <Typography variant="h5" fontWeight={800}>
                          {formatNumberFa(it.value)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                {itemsProducts.map((it) => (
                  <Grid key={it.label} item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      {it.icon}
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {it.label}
                        </Typography>
                        <Typography variant="h5" fontWeight={800}>
                          {formatNumberFa(it.value)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
            <CardHeader
              avatar={<AccountBalanceWalletRoundedIcon />}
              title={
                <Typography variant="subtitle2" color="text.secondary">
                  اعتبار اینکس
                </Typography>
              }
            />
            <CardContent>
              <Typography variant="h4" fontWeight={800}>
                {formatNumberFa(safe.inaxCredit)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                جمع اعتبار ثبت‌شده
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* وضعیت اپراتورها */}
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardHeader
          avatar={<SignalCellularAltRoundedIcon />}
          title={
            <Typography variant="subtitle2" color="text.secondary">
              اپراتورهای سیم‌کارت
            </Typography>
          }
        />
        <CardContent>
          <Stack spacing={1} sx={{ mb: 1 }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2">
                فعال: {formatNumberFa(safe.simActiveOperatorsCount)}
              </Typography>
              <Typography variant="body2">کل: {formatNumberFa(safe.simOperatorsCount)}</Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={activeOpsPercent}
              sx={{ height: 10, borderRadius: 999 }}
            />
            <Typography variant="caption" color="text.secondary">
              {toFaDigits(activeOpsPercent)}٪ اپراتورها فعال هستند.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </DashboardContent>
  );
}
