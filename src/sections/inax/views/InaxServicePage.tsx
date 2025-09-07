import React, { useMemo, useState } from 'react';
import { Box, Paper, Stack, Typography, Button, Divider, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useTheme, createTheme, ThemeProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { useInaxCredit, inaxCreditIncrease, inaxTransactionInquiry } from '../api/inaxApi';

export default function InaxServicePage() {
  // RTL setup (local scope) — طبق الگوی پروژه
  const rtlCache = useMemo(
    () => createCache({ key: 'mui-rtl-inax', stylisPlugins: [rtlPlugin] }),
    []
  );
  const outerTheme = useTheme();
  const rtlTheme = useMemo(() => createTheme(outerTheme, { direction: 'rtl' }), [outerTheme]);

  const { amount, loading, mutate } = useInaxCredit();

  // Increase Credit
  const [incAmount, setIncAmount] = useState<string>('');
  const [incLoading, setIncLoading] = useState(false);

  // Transaction Inquiry
  const [transId, setTransId] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [inqLoading, setInqLoading] = useState(false);
  // ✅ مهم: unknown → any تا در JSX خطای ReactNode ندهد
  const [inqResult, setInqResult] = useState<any>(null);

  const faPrice = new Intl.NumberFormat('fa-IR').format(amount);

  const handleIncrease = async () => {
    const parsed = Number(incAmount);
    if (!Number.isFinite(parsed) || parsed < 1000) return;

    setIncLoading(true);
    try {
      const data = await inaxCreditIncrease(parsed);
      // اگر URL پرداخت برگشت، ریدایرکت کنیم
      const url =
        (data?.result && (data.result.paymentUrl || data.result.url)) ||
        (typeof data?.result === 'string' ? data.result : undefined);
      if (url && typeof url === 'string') {
        window.location.href = url;
      } else {
        await mutate();
      }
    } finally {
      setIncLoading(false);
    }
  };

  const handleInquiry = async () => {
    const t = Number(transId);
    const o = Number(orderId);
    if (!Number.isFinite(t) || !Number.isFinite(o) || t <= 0 || o <= 0) return;

    setInqLoading(true);
    try {
      const data = await inaxTransactionInquiry({ transId: t, orderNumberOrId: o });
      setInqResult(data);
    } finally {
      setInqLoading(false);
    }
  };

  return (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={rtlTheme}>
        <Box dir="rtl" p={2}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Inax Service
          </Typography>

          <Stack spacing={2}>
            {/* Credit */}
            <Paper variant="outlined">
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  اعتبار فعلی
                </Typography>
                <Typography variant="h4" sx={{ mb: 1 }}>
                  {faPrice} تومان
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button onClick={() => mutate()} disabled={loading} variant="outlined">
                    بروزرسانی اعتبار
                  </Button>
                </Stack>
              </Box>
            </Paper>

            {/* Increase Credit */}
            <Paper variant="outlined">
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  افزایش اعتبار
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="مبلغ (تومان)"
                    type="number"
                    value={incAmount}
                    onChange={(e) => setIncAmount(e.target.value)}
                    sx={{ maxWidth: 280 }}
                    inputProps={{ min: 0 }}
                    helperText="حداقل ۱۰۰۰ تومان"
                  />
                  <LoadingButton
                    loading={incLoading}
                    onClick={handleIncrease}
                    variant="contained"
                    disabled={!incAmount || Number(incAmount) < 1000}
                  >
                    ثبت و انتقال به پرداخت
                  </LoadingButton>
                </Stack>
              </Box>
            </Paper>

            {/* Transaction Inquiry */}
            <Paper variant="outlined">
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  پیگیری تراکنش
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Transaction Id"
                    type="number"
                    value={transId}
                    onChange={(e) => setTransId(e.target.value)}
                    sx={{ maxWidth: 280 }}
                  />
                  <TextField
                    label="Order Number/Id"
                    type="number"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    sx={{ maxWidth: 280 }}
                  />
                  <LoadingButton
                    loading={inqLoading}
                    onClick={handleInquiry}
                    variant="contained"
                    disabled={!transId || !orderId}
                  >
                    پیگیری
                  </LoadingButton>
                </Stack>

                {/* ✅ FIX: بولی‌کردن شرط + children همیشه string */}
                {!!inqResult && (
                  <Box
                    component="pre"
                    sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: 'grey.100',
                      borderRadius: 1,
                      overflow: 'auto',
                      maxHeight: 280,
                      fontSize: 13,
                    }}
                  >
                    {JSON.stringify(inqResult, null, 2)}
                  </Box>
                )}
              </Box>
            </Paper>
          </Stack>
        </Box>
      </ThemeProvider>
    </CacheProvider>
  );
}
