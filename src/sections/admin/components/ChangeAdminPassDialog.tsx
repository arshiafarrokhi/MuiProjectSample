import type {
  Theme} from '@mui/material';

import { toast } from 'sonner';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
// import { CacheProvider } from '@emotion/react';
import React, { useMemo, useState } from 'react';

import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import { useTheme, ThemeProvider } from '@mui/material/styles';
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

import { changeAdminPassApi } from '../api/adminApi';

type Props = {
  open: boolean;
  onClose: () => void;
  accountId?: string;
  onChanged?: () => void;
};

export default function ChangeAdminPassDialog({ open, onClose, accountId, onChanged }: Props) {
  const [password, setPassword] = useState('');
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
    if (!accountId) {
      toast.error('شناسه ادمین نامعتبر است.');
      return;
    }
    if (!password || password.length < 6) {
      toast.error('رمز عبور حداقل ۶ کاراکتر باشد.');
      return;
    }
    setPosting(true);
    try {
      const res = await changeAdminPassApi({ accountId, password });
      const ok = res?.success ?? true;
      toast[ok ? 'success' : 'error'](
        res?.message || (ok ? 'رمز عبور تغییر کرد.' : 'تغییر رمز ناموفق بود.')
      );
      if (ok && onChanged) onChanged();
    } catch (e: any) {
      toast.error(e?.message || 'خطا در تغییر رمز');
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
          PaperProps={{ sx: { maxWidth: 480, width: 1 } }}
        >
          <DialogTitle>تغییر رمز عبور</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1 }}>
              <TextField
                fullWidth
                type="password"
                label="رمز جدید"
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
              ذخیره
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    // </CacheProvider>
  );
}
