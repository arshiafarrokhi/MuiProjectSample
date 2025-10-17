import type {
  Theme} from '@mui/material';

import { toast } from 'sonner';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
// import { CacheProvider } from '@emotion/react';
import React, { useMemo, useState, useEffect } from 'react';

import { useTheme, ThemeProvider } from '@mui/material/styles';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import PhoneIphoneRoundedIcon from '@mui/icons-material/PhoneIphoneRounded';
import {
  Box,
  Dialog,
  Button,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment
} from '@mui/material';

import { updateAdminApi } from '../api/adminApi';

type Props = {
  open: boolean;
  onClose: () => void;
  admin?: { accountId: string; fullName: string; phone: string; email: string } | null;
  onUpdated?: () => void;
};

export default function EditAdminDialog({ open, onClose, admin, onUpdated }: Props) {
  const [fullName, setFullName] = useState(admin?.fullName ?? '');
  const [phone, setPhone] = useState(admin?.phone ?? '');
  const [email, setEmail] = useState(admin?.email ?? '');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    setFullName(admin?.fullName ?? '');
    setPhone(admin?.phone ?? '');
    setEmail(admin?.email ?? '');
  }, [admin, open]);

  const outerTheme = useTheme();

  const rtlTheme = useMemo(
    () => ({ ...(outerTheme as Theme), direction: 'rtl' }) as Theme,
    [outerTheme]
  );

  const rtlCache = useMemo(
    () => createCache({ key: 'mui-rtl-edituser', stylisPlugins: [rtlPlugin] }),
    []
  );

  const handleSubmit = async () => {
    if (!admin?.accountId) {
      toast.error('شناسه ادمین نامعتبر است.');
      return;
    }
    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      toast.error('تمام فیلدها الزامی است.');
      return;
    }
    setPosting(true);
    try {
      const res = await updateAdminApi({
        accountId: admin.accountId,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
      });
      const ok = res?.success ?? true;
      toast[ok ? 'success' : 'error'](res?.message || (ok ? 'ویرایش شد.' : 'ویرایش ناموفق بود.'));
      if (ok && onUpdated) onUpdated();
    } catch (e: any) {
      toast.error(e?.message || 'خطا در ویرایش ادمین');
    } finally {
      setPosting(false);
    }
  };

  return (
    // <CacheProvider value={rtlCache}>
      <ThemeProvider theme={rtlTheme}>
        <Dialog
          open={open}
          onClose={onClose}
          dir="rtl"
          PaperProps={{ sx: { maxWidth: 560, width: 1 } }}
        >
          <DialogTitle>ویرایش ادمین</DialogTitle>
          <DialogContent>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
                mt: 1,
              }}
            >
              <TextField
                label="نام و نام خانوادگی"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="شماره موبایل"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIphoneRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="ایمیل"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutlineRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} color="inherit">
              انصراف
            </Button>
            <Button onClick={handleSubmit} disabled={posting} variant="contained">
              ذخیره
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    // </CacheProvider>
  );
}
