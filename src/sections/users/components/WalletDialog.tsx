import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  createTheme,
  ThemeProvider,
} from '@mui/material';

import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';

import { userWalletApi } from '../api/userWalletApi';
import { toast } from 'sonner';

type WalletDialogProps = {
  open: boolean;
  onClose: () => void;
  user?: { id: string; fName?: string; lName?: string } | null;
};

const toFaDigits = (val: string | number | undefined | null) =>
  (val ?? '').toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

export default function WalletDialog({ open, onClose, user }: WalletDialogProps) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const [transactionsCount, setTransactionsCount] = useState<number | null>(null);
  const [apiMessage, setApiMessage] = useState<string | null>(null);

  const { getWalletBalance } = userWalletApi();

  // Scoped RTL (remove if your app is globally RTL)
  const rtlCache = useMemo(
    () => createCache({ key: 'mui-rtl-wallet', stylisPlugins: [prefixer, rtlPlugin] }),
    []
  );
  const rtlTheme = useMemo(() => createTheme({ direction: 'rtl' }), []);

  const fetchData = async () => {
    if (!user?.id) return;
    setLoading(true);
    setErr(null);
    try {
      const data = await getWalletBalance(user.id);
      const success = data?.success ?? true;
      const r = data?.result ?? {};
      setTotalAmount(typeof r.totalAmount === 'number' ? r.totalAmount : null);
      setTransactionsCount(typeof r.transactionsCount === 'number' ? r.transactionsCount : null);
      setApiMessage(data?.message ?? null);

      if (!success) {
        toast.error(data?.message || 'دریافت اطلاعات کیف‌پول ناموفق بود.');
        setErr(data?.message || 'ناموفق');
      }
    } catch (e: any) {
      const msg = e?.message || 'خطا در دریافت اطلاعات کیف‌پول';
      setErr(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && user?.id) fetchData();
    if (!open) {
      setErr(null);
      setTotalAmount(null);
      setTransactionsCount(null);
      setApiMessage(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user?.id]);

  const fullName = [user?.fName, user?.lName].filter(Boolean).join(' ');

  return (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={rtlTheme}>
        <Dialog
          dir="rtl"
          open={open}
          onClose={onClose}
          aria-labelledby="wallet-title"
          PaperProps={{ sx: { width: '100%', maxWidth: 520, borderRadius: 3, overflow: 'hidden' } }}
        >
          <DialogTitle id="wallet-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountBalanceWalletRoundedIcon />
            <Typography variant="h6" fontWeight={700}>
              کیف‌پول کاربر
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {fullName || '—'}
            </Typography>
          </DialogTitle>

          <Divider />

          <DialogContent sx={{ pt: 3 }}>
            {err && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {err}
              </Alert>
            )}
            {apiMessage && !err && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {apiMessage}
              </Alert>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 5 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box
                sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}
              >
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      موجودی کل
                    </Typography>
                    <Typography variant="h5" fontWeight={800}>
                      {totalAmount !== null ? toFaDigits(totalAmount) : '—'}
                    </Typography>
                  </CardContent>
                </Card>

                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      تراکنش‌های کل
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight={800}
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <ReceiptLongRoundedIcon fontSize="small" />
                      {transactionsCount !== null ? toFaDigits(transactionsCount) : '—'}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button
              startIcon={<RefreshRoundedIcon />}
              onClick={fetchData}
              disabled={loading || !user?.id}
              variant="outlined"
            >
              تازه‌سازی
            </Button>
            <Button
              startIcon={<CloseRoundedIcon />}
              onClick={onClose}
              color="inherit"
              variant="contained"
            >
              بستن
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </CacheProvider>
  );
}
