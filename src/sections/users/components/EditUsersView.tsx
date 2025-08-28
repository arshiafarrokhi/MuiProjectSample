// src/sections/users/components/EditUsersView.tsx
import { toast } from 'sonner';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router';

import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useTheme, createTheme, ThemeProvider } from '@mui/material/styles';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import {
  Box,
  Tab,
  Grid,
  Card,
  Tabs,
  Table,
  Paper,
  Stack,
  Button,
  Divider,
  TableRow,
  TextField,
  TableBody,
  TableCell,
  TableHead,
  CardHeader,
  Typography,
  CardContent,
  InputAdornment,
  CircularProgress,
} from '@mui/material';

import { formatFaDate } from 'src/utils/formatDate';

import { userWalletApi } from 'src/sections/users/api/userWalletApi';
import WalletRequestsTab from 'src/sections/users/components/WalletRequestsTab';

const toFaDigits = (val: string | number | undefined | null) =>
  (val ?? '').toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

export default function EditUsersPage() {
  const nav = useNavigate();
  const { state } = useLocation() as { state?: { fName?: string; lName?: string } };
  const { userId } = useParams<{ userId: string }>();

  const fullName = [state?.fName, state?.lName].filter(Boolean).join(' ') || '—';

  const [tab, setTab] = useState<number>(0);

  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingTx, setLoadingTx] = useState(false);
  const [summary, setSummary] = useState<{
    totalAmount: number | null;
    transactionsCount: number | null;
  }>({
    totalAmount: null,
    transactionsCount: null,
  });

  const [txItems, setTxItems] = useState<any[]>([]);
  const [posting, setPosting] = useState(false);

  const [incAmount, setIncAmount] = useState<number | ''>('');
  const [incDesc, setIncDesc] = useState('');
  const paymentMethod = 1; // ثابت؛ برای جلوگیری از هشدار ESLint

  const [decAmount, setDecAmount] = useState<number | ''>('');
  const [decDesc, setDecDesc] = useState('');

  const {
    getWalletBalance,
    getWalletTransactionsAll,
    walletCreditIncrease,
    walletCreditReduction,
  } = userWalletApi();

  // ✅ RTL طبق قانون شما
  const rtlCache = useMemo(
    () => createCache({ key: 'mui-rtl-edituser', stylisPlugins: [rtlPlugin] }),
    []
  );
  const outerTheme = useTheme();
  const rtlTheme = useMemo(() => createTheme(outerTheme, { direction: 'rtl' }), [outerTheme]);

  const fetchSummary = async () => {
    if (!userId) return;
    setLoadingSummary(true);
    try {
      const data = await getWalletBalance(userId);
      const ok = data?.success ?? true;
      const r = data?.result ?? {};
      setSummary({
        totalAmount: typeof r.totalAmount === 'number' ? r.totalAmount : null,
        transactionsCount: typeof r.transactionsCount === 'number' ? r.transactionsCount : null,
      });
      if (!ok) toast.error(data?.message || 'دریافت موجودی ناموفق بود.');
    } catch (e: any) {
      toast.error(e?.message || 'خطا در دریافت موجودی');
    } finally {
      setLoadingSummary(false);
    }
  };

  // فقط PageIndex=0 و UserId (بدون Type و Pagination)
  const fetchTransactions = async () => {
    if (!userId) return;
    setLoadingTx(true);
    try {
      const data = await getWalletTransactionsAll(userId);
      const ok = data?.success ?? true;

      // انعطاف نسبت به ساختار پاسخ
      const items =
        (data as any)?.result?.items ??
        (data as any)?.result?.transactions ??
        (Array.isArray((data as any)?.result) ? (data as any)?.result : []);

      setTxItems(Array.isArray(items) ? items : []);
      if (!ok) toast.error(data?.message || 'دریافت تراکنش‌ها ناموفق بود.');
    } catch (e: any) {
      toast.error(e?.message || 'خطا در دریافت تراکنش‌ها');
    } finally {
      setLoadingTx(false);
    }
  };

  useEffect(() => {
    // هنگام ورود به صفحه، تب کیف‌پول (۰) را می‌آورد
    fetchSummary();
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleIncrease = async () => {
    if (!userId || !incAmount || incAmount <= 0) {
      toast.error('مبلغ افزایش اعتبار را صحیح وارد کنید.');
      return;
    }
    setPosting(true);
    try {
      const res = await walletCreditIncrease({
        userId,
        amount: Number(incAmount),
        description: incDesc || '',
        paymentMethod,
      });
      const ok = res && typeof res.success !== 'undefined' ? !!res.success : true;
      const msg =
        res?.message || (ok ? 'افزایش اعتبار با موفقیت انجام شد.' : 'افزایش اعتبار ناموفق بود.');
      if (ok) {
        toast.success(msg);
        setIncAmount('');
        setIncDesc('');
        await Promise.all([fetchSummary(), fetchTransactions()]);
      } else {
        toast.error(msg);
      }
    } catch (e: any) {
      toast.error(e?.message || 'خطا در افزایش اعتبار');
    } finally {
      setPosting(false);
    }
  };

  const handleReduction = async () => {
    if (!userId || !decAmount || decAmount <= 0) {
      toast.error('مبلغ کاهش اعتبار را صحیح وارد کنید.');
      return;
    }
    setPosting(true);
    try {
      const res = await walletCreditReduction({
        userId,
        amount: Number(decAmount),
        description: decDesc || '',
      });
      const ok = res && typeof res.success !== 'undefined' ? !!res.success : true;
      const msg =
        res?.message || (ok ? 'کاهش اعتبار با موفقیت انجام شد.' : 'کاهش اعتبار ناموفق بود.');
      if (ok) {
        toast.success(msg);
        setDecAmount('');
        setDecDesc('');
        await Promise.all([fetchSummary(), fetchTransactions()]);
      } else {
        toast.error(msg);
      }
    } catch (e: any) {
      toast.error(e?.message || 'خطا در کاهش اعتبار');
    } finally {
      setPosting(false);
    }
  };

  return (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={rtlTheme}>
        <Box dir="rtl" sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
            <Button
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => nav(-1)}
              variant="outlined"
              color="inherit"
            >
              بازگشت
            </Button>
            {/* عنوان = نام کاربر */}
            <Typography variant="h5" fontWeight={800} sx={{ mr: 1 }}>
              {fullName}
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Button
              startIcon={<RefreshRoundedIcon />}
              onClick={() => {
                if (tab === 0) {
                  fetchSummary();
                  fetchTransactions();
                }
                // تب درخواست‌ها خودش داده‌ها را از طریق SWR تازه‌سازی می‌کند
                toast.success('به‌روزرسانی انجام شد');
              }}
            >
              تازه‌سازی
            </Button>
          </Box>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label="کیف‌پول" />
            <Tab label="درخواست‌ها" />
          </Tabs>

          {/* تب ۰: کیف‌پول */}
          {tab === 0 && (
            <>
              {/* Summary cards */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardHeader
                      avatar={<AccountBalanceWalletRoundedIcon />}
                      title={
                        <Typography variant="subtitle2" color="text.secondary">
                          موجودی کل
                        </Typography>
                      }
                    />
                    <CardContent>
                      {loadingSummary ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Typography variant="h4" fontWeight={800}>
                          {summary.totalAmount !== null ? toFaDigits(summary.totalAmount) : '—'}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardHeader
                      avatar={<ReceiptLongRoundedIcon />}
                      title={
                        <Typography variant="subtitle2" color="text.secondary">
                          تراکنش‌های کل
                        </Typography>
                      }
                    />
                    <CardContent>
                      {loadingSummary ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Typography variant="h4" fontWeight={800}>
                          {summary.transactionsCount !== null
                            ? toFaDigits(summary.transactionsCount)
                            : '—'}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Actions: Increase / Reduce */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
                    <CardHeader title="افزایش اعتبار" />
                    <CardContent>
                      <Stack spacing={2}>
                        <TextField
                          label="مبلغ"
                          type="number"
                          value={incAmount}
                          onChange={(e) =>
                            setIncAmount(e.target.value === '' ? '' : Number(e.target.value))
                          }
                          InputProps={{
                            startAdornment: <InputAdornment position="start">ریال</InputAdornment>,
                          }}
                        />
                        <TextField
                          label="توضیحات"
                          multiline
                          minRows={2}
                          value={incDesc}
                          onChange={(e) => setIncDesc(e.target.value)}
                        />
                        <Button
                          variant="contained"
                          onClick={handleIncrease}
                          disabled={posting || !userId}
                        >
                          {posting ? 'در حال ارسال...' : 'افزایش'}
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
                    <CardHeader title="کاهش اعتبار" />
                    <CardContent>
                      <Stack spacing={2}>
                        <TextField
                          label="مبلغ"
                          type="number"
                          value={decAmount}
                          onChange={(e) =>
                            setDecAmount(e.target.value === '' ? '' : Number(e.target.value))
                          }
                          InputProps={{
                            startAdornment: <InputAdornment position="start">ریال</InputAdornment>,
                          }}
                        />
                        <TextField
                          label="توضیحات"
                          multiline
                          minRows={2}
                          value={decDesc}
                          onChange={(e) => setDecDesc(e.target.value)}
                        />
                        <Button
                          variant="contained"
                          color="error"
                          onClick={handleReduction}
                          disabled={posting || !userId}
                        >
                          {posting ? 'در حال ارسال...' : 'کاهش'}
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Transactions (بدون ستون نوع، بدون Pagination) */}
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardHeader sx={{ p: 2 }} title="لیست تراکنش‌ها" />
                <Divider />
                <CardContent sx={{ p: 0 }}>
                  {loadingTx ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <Paper sx={{ width: '100%', overflowX: 'auto' }}>
                      <Table size="small" aria-label="transactions">
                        <TableHead>
                          <TableRow>
                            <TableCell>ردیف</TableCell>
                            <TableCell>مبلغ</TableCell>
                            <TableCell>توضیحات</TableCell>
                            <TableCell>تاریخ</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {txItems.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                موردی یافت نشد.
                              </TableCell>
                            </TableRow>
                          ) : (
                            txItems.map((it: any, idx: number) => {
                              const amount = it.amount ?? it.Amount ?? it.value ?? '—';
                              const desc = it.description ?? it.Description ?? '—';
                              return (
                                <TableRow key={idx}>
                                  <TableCell>{toFaDigits(idx + 1)}</TableCell>
                                  <TableCell>{toFaDigits(amount)}</TableCell>
                                  <TableCell>{desc}</TableCell>
                                  <TableCell>{formatFaDate(it.insertTime)}</TableCell>
                                </TableRow>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>
                    </Paper>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* تب ۱: درخواست‌ها */}
          {tab === 1 && (
            <>
              {!userId ? (
                <Typography color="error">شناسه کاربر معتبر نیست.</Typography>
              ) : (
                <WalletRequestsTab userId={userId} />
              )}
            </>
          )}
        </Box>
      </ThemeProvider>
    </CacheProvider>
  );
}
