import { toast } from 'sonner';
import { prefixer } from 'stylis';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
// src/sections/users/components/EditUserDialog.tsx
import React, { useMemo, useState, useEffect } from 'react';

import { LoadingButton } from '@mui/lab';
import { ThemeProvider } from '@mui/material/styles';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import PhoneIphoneRoundedIcon from '@mui/icons-material/PhoneIphoneRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import {
  Box,
  Dialog,
  Button,
  Divider,
  TextField,
  IconButton,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  CircularProgress,
} from '@mui/material';

import { updateUserApi } from '../api/updateUserApi';

type EditUserDialogProps = {
  open: boolean;
  onClose: () => void;
  user?: {
    id: string;
    fName?: string;
    lName?: string;
    phone?: string;
  } | null;
  // Optional: notify parent to refresh list
  onUpdated?: () => void;
};

const PERSIAN_DIGITS = /[۰-۹]/g;
const toLatinDigits = (value: string) =>
  value.replace(PERSIAN_DIGITS, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));

export default function EditUserDialog({ open, onClose, user, onUpdated }: EditUserDialogProps) {
  const [fName, setFName] = useState(user?.fName ?? '');
  const [lName, setLName] = useState(user?.lName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Reset when user changes / dialog opens
  useEffect(() => {
    setFName(user?.fName ?? '');
    setLName(user?.lName ?? '');
    setPhone(user?.phone ?? '');
    setErrors({});
  }, [user, open]);

  const rtlCache = useMemo(
    () => createCache({ key: 'mui-rtl-edituser', stylisPlugins: [prefixer, rtlPlugin] }),
    []
  );

  const validate = () => {
    const next: Record<string, string> = {};
    if (!fName.trim()) next.fName = 'نام را وارد کنید.';
    if (!lName.trim()) next.lName = 'نام خانوادگی را وارد کنید.';

    const rawPhone = toLatinDigits(phone).replace(/\s|-/g, '');
    if (!rawPhone) next.phone = 'شماره موبایل را وارد کنید.';
    else if (!/^\d{10,15}$/.test(rawPhone)) next.phone = 'شماره معتبر نیست.';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const { updateUser } = updateUserApi();

  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error('شناسه کاربر نامعتبر است.');
      return;
    }
    if (!validate()) {
      toast.error('لطفاً خطاهای فرم را برطرف کنید.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        userId: user.id,
        fName: fName.trim(),
        lName: lName.trim(),
        phone: toLatinDigits(phone).replace(/\s|-/g, ''),
      };

      const res = await updateUser(payload);
      const ok = res && typeof res.success !== 'undefined' ? !!res.success : true;
      const message =
        res?.message || (ok ? 'اطلاعات کاربر بروزرسانی شد.' : 'بروزرسانی ناموفق بود.');

      if (ok) {
        toast.success(message);
        onClose();
        onUpdated?.();
      } else {
        toast.error(message);
      }
    } catch (err: any) {
      const msg = err?.message || 'بروزرسانی کاربر ناموفق بود.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={(outer) => ({ ...outer, direction: 'rtl' })}>
        <Dialog
          dir="rtl"
          open={open}
          onClose={onClose}
          aria-labelledby="edit-user-title"
          PaperProps={{
            sx: {
              width: '100%',
              maxWidth: 560,
              borderRadius: 3,
              overflow: 'hidden',
              bgcolor: 'background.paper',
            },
          }}
        >
          <DialogTitle
            component="div"
            id="edit-user-title"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              pr: 2,
              pl: 2,
              py: 1.5,
            }}
          >
            <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', gap: 1 }}>
              <div>ویرایش اطلاعات کاربر : </div>
              <div>
                {user?.fName} {user?.lName}
              </div>
            </Typography>
            <IconButton aria-label="بستن" onClick={onClose} edge="end">
              <CloseRoundedIcon />
            </IconButton>
          </DialogTitle>

          <Divider />

          <DialogContent sx={{ pt: 3 }}>
            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}
            >
              <TextField
                label="نام"
                placeholder="مثلاً: علی"
                value={fName}
                onChange={(e) => {
                  setFName(e.target.value);
                  setErrors((p) => ({ ...p, fName: '' }));
                }}
                error={!!errors.fName}
                helperText={errors.fName}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="نام خانوادگی"
                placeholder="مثلاً: رضایی"
                value={lName}
                onChange={(e) => {
                  setLName(e.target.value);
                  setErrors((p) => ({ ...p, lName: '' }));
                }}
                error={!!errors.lName}
                helperText={errors.lName}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="شماره موبایل"
                placeholder="مثلاً: 09123456789"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setErrors((p) => ({ ...p, phone: '' }));
                }}
                error={!!errors.phone}
                helperText={
                  errors.phone || 'فقط اعداد؛ ارقام فارسی خودکار به انگلیسی تبدیل می‌شوند.'
                }
                inputMode="tel"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIphoneRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2, gap: 1.5 }}>
            <Button
              onClick={onClose}
              color="inherit"
              variant="outlined"
              startIcon={<CloseRoundedIcon />}
            >
              انصراف
            </Button>
            <LoadingButton
              onClick={handleSubmit}
              //   variant="contained"
              color="primary"
              loading={submitting}
              loadingIndicator={<CircularProgress size={18} />}
            >
              ذخیره تغییرات
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </CacheProvider>
  );
}
