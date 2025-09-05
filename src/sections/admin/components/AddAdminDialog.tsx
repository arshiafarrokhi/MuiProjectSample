import type {
  Theme} from '@mui/material';

import { toast } from 'sonner';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import React, { useMemo, useState } from 'react';

import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
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

import { addAdminApi } from '../api/adminApi';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export default function AddAdminDialog({ open, onClose, onCreated }: Props) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [posting, setPosting] = useState(false);

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
    if (!fullName.trim() || !phone.trim() || !password || !email.trim()) {
      toast.error('تمام فیلدها الزامی است.');
      return;
    }
    setPosting(true);
    try {
      const res = await addAdminApi({
        fullName: fullName.trim(),
        phone: phone.trim(),
        password,
        email: email.trim(),
      });
      const ok = res?.success ?? true;
      toast[ok ? 'success' : 'error'](
        res?.message || (ok ? 'ادمین افزوده شد.' : 'افزودن ناموفق بود.')
      );
      if (ok && onCreated) onCreated();
    } catch (e: any) {
      toast.error(e?.message || 'خطا در افزودن ادمین');
    } finally {
      setPosting(false);
    }
  };

  return (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={rtlTheme}>
        <Dialog
          open={open}
          onClose={onClose}
          dir="rtl"
          PaperProps={{ sx: { maxWidth: 560, width: 1 } }}
        >
          <DialogTitle>افزودن ادمین</DialogTitle>
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
              <TextField
                label="رمز عبور"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <KeyRoundedIcon fontSize="small" />
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
              افزودن
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </CacheProvider>
  );
}
