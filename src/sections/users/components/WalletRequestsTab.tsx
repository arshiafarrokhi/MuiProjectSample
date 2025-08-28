import { toast } from 'sonner';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
// src/sections/users/components/WalletRequestsTab.tsx
import React, { useMemo, useState } from 'react';

import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { useTheme, createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Box,
  Stack,
  Table,
  Paper,
  Switch,
  Button,
  Dialog,
  Tooltip,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  TextField,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  FormControlLabel,
} from '@mui/material';

import {
  getCreditIncreaseRequest,
  useCreditIncreaseRequests,
  useWalletTransactionsAdmin,
  updateCreditIncreaseRequestState,
} from 'src/sections/users/api/walletRequestsApi';

const clamp2 = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical' as const,
  overflow: 'hidden',
};

const formatFaDate = (iso?: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  try {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Tehran',
    }).format(d);
  } catch {
    return d.toLocaleString('fa-IR');
  }
};

type Props = { userId: string };

export default function WalletRequestsTab({ userId }: Props) {
  // RTL (طبق قانون شما)
  const rtlCache = React.useMemo(
    () => createCache({ key: 'mui-rtl-edituser', stylisPlugins: [rtlPlugin] }),
    []
  );
  const outerTheme = useTheme();
  const rtlTheme = React.useMemo(() => createTheme(outerTheme, { direction: 'rtl' }), [outerTheme]);

  const [accepted, setAccepted] = useState<boolean>(true);
  const [isRemoved, setIsRemoved] = useState<boolean>(false);

  const { requests, loading, refetchRequests } = useCreditIncreaseRequests(
    userId,
    accepted,
    isRemoved
  );

  const { transactions, txLoading, refetchTx } = useWalletTransactionsAdmin();

  // دیالوگ جزئیات
  const [open, setOpen] = useState(false);
  const [reqDetail, setReqDetail] = useState<any | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const safeList = useMemo(() => (Array.isArray(requests) ? requests : []), [requests]);

  const handleOpenDetail = async (id: string) => {
    try {
      const res = await getCreditIncreaseRequest(id);
      const ok = res?.success ?? true;
      if (!ok) return toast.error(res?.message || 'عدم دریافت جزئیات');
      setReqDetail(res?.result || null);
      setActionNote('');
      setOpen(true);
    } catch (e: any) {
      toast.error(e?.message || 'خطا در دریافت جزئیات');
    }
  };

  const handleAction = async (isAccepted: boolean) => {
    if (!reqDetail?.id) return;
    setSubmitting(true);
    try {
      const res = await updateCreditIncreaseRequestState({
        id: reqDetail.id,
        isAccepted,
        description: actionNote || undefined,
      });
      const ok = res?.success ?? true;
      const msg = res?.message || (ok ? 'ثبت شد.' : 'ثبت ناموفق بود.');
      if (ok) {
        toast.success(msg);
        setOpen(false);
        // رفرش لیست درخواست‌ها + تراکنش‌ها
        await refetchRequests?.(undefined, { revalidate: true });
        await refetchTx?.(undefined, { revalidate: true });
      } else {
        toast.error(msg);
      }
    } catch (e: any) {
      toast.error(e?.message || 'خطا در ثبت وضعیت');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={rtlTheme}>
        <Box dir="rtl">
          {/* فیلترها */}
          <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
              }
              label="قبول شده ها"
            />
            <FormControlLabel
              control={
                <Switch checked={isRemoved} onChange={(e) => setIsRemoved(e.target.checked)} />
              }
              label="حذف شده ها "
            />
          </Stack>

          {/* جدول درخواست‌ها */}
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 2,
              maxHeight: { xs: 'calc(100dvh - 360px)', md: 'calc(100dvh - 420px)' },
              overflowY: 'auto',
            }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 90 }} align="center">
                    مشاهده
                  </TableCell>
                  <TableCell sx={{ minWidth: 180 }}>شناسه درخواست</TableCell>
                  <TableCell sx={{ width: 140 }}>مبلغ</TableCell>
                  <TableCell sx={{ minWidth: 240 }}>توضیحات</TableCell>
                  <TableCell sx={{ width: 180 }}>تاریخ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      در حال بارگذاری...
                    </TableCell>
                  </TableRow>
                ) : safeList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      درخواستی یافت نشد.
                    </TableCell>
                  </TableRow>
                ) : (
                  safeList.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell align="center">
                        <IconButton color="primary" onClick={() => handleOpenDetail(r.id)}>
                          <VisibilityRoundedIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={r.id}>
                          <Typography noWrap fontWeight={600}>
                            {r.id}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{r.ammount ?? '—'}</TableCell>
                      <TableCell>
                        {r.description ? (
                          <Tooltip title={r.description}>
                            <Typography variant="body2" sx={clamp2}>
                              {r.description}
                            </Typography>
                          </Tooltip>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatFaDate(r.insertTime)}</Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* تراکنش‌های اخیر (ادمین) */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
              تراکنش‌های اخیر (ادمین)
            </Typography>
            <TableContainer component={Paper} sx={{ borderRadius: 2, maxHeight: 360 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>شناسه</TableCell>
                    <TableCell>مبلغ</TableCell>
                    <TableCell>توضیحات</TableCell>
                    <TableCell>تاریخ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {txLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                        در حال بارگذاری...
                      </TableCell>
                    </TableRow>
                  ) : (transactions ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                        تراکنشی یافت نشد.
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((t: any) => (
                      <TableRow key={t.id}>
                        <TableCell>
                          <Tooltip title={t.id}>
                            <Typography noWrap fontWeight={600}>
                              {t.id}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{t.amount ?? '—'}</TableCell>
                        <TableCell>
                          {t.description ? (
                            <Tooltip title={t.description}>
                              <Typography variant="body2" sx={clamp2}>
                                {t.description}
                              </Typography>
                            </Tooltip>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{formatFaDate(t.insertTime)}</Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* دیالوگ جزئیات */}
          <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle>جزئیات درخواست</DialogTitle>
            <DialogContent dividers>
              {reqDetail ? (
                <Stack spacing={1.25}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      شناسه:
                    </Typography>
                    <Typography variant="body2">{reqDetail.id}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      مبلغ:
                    </Typography>
                    <Typography variant="body2">{reqDetail.ammount}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      تاریخ:
                    </Typography>
                    <Typography variant="body2">{formatFaDate(reqDetail.insertTime)}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      کاربر:
                    </Typography>
                    <Typography variant="body2">
                      {reqDetail.user?.userFullName} — {reqDetail.user?.userPhone}
                    </Typography>
                  </Stack>
                  {reqDetail.depositSlipImage && (
                    <Box sx={{ mt: 1 }}>
                      <img
                        src={reqDetail.depositSlipImage}
                        alt="رسید واریز"
                        style={{ maxWidth: '100%', borderRadius: 8 }}
                      />
                    </Box>
                  )}

                  <TextField
                    label="یادداشت (اختیاری)"
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    fullWidth
                    multiline
                    minRows={2}
                    sx={{ mt: 1 }}
                  />
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  در حال بارگذاری...
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                startIcon={<CloseRoundedIcon />}
                color="error"
                disabled={submitting}
                onClick={() => handleAction(false)}
              >
                رد درخواست
              </Button>
              <Button
                startIcon={<DoneRoundedIcon />}
                variant="contained"
                disabled={submitting}
                onClick={() => handleAction(true)}
              >
                تایید افزایش
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </ThemeProvider>
    </CacheProvider>
  );
}
