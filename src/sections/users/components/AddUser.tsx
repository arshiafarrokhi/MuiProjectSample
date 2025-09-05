/* eslint-disable */
import { toast } from 'sonner';
import { prefixer } from 'stylis';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
// RTL support (scoped to this dialog)
import { CacheProvider } from '@emotion/react';
import React, { useMemo, useState, useEffect } from 'react';

import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import { LoadingButton } from '@mui/lab';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';
import PhoneIphoneRoundedIcon from '@mui/icons-material/PhoneIphoneRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
// MUI
import {
  Box,
  Dialog,
  Button,
  Avatar,
  Divider,
  Tooltip,
  TextField,
  IconButton,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  InputAdornment,
  FormHelperText,
  CircularProgress,
  Theme,
} from '@mui/material';

// api
import { createUserApi } from '../api/createUserApi';

type Props = {
  openAddDialog: boolean;
  handleClose: () => void;
  onCreated: any;
};

const MAX_AVATAR_MB = 2;
const PERSIAN_DIGITS = /[۰-۹]/g;

// convert Persian digits to Latin
const toLatinDigits = (value: string) =>
  value.replace(PERSIAN_DIGITS, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));

export default function AddUserDialog({ openAddDialog, handleClose, onCreated }: Props) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fName, setFName] = useState('');
  const [lName, setLName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const fullScreen = useMediaQuery('(max-width:600px)');
  const { setAgentBot } = createUserApi();

  const outerTheme = useTheme();

  const rtlTheme = useMemo(
    () => ({ ...(outerTheme as Theme), direction: 'rtl' }) as Theme,
    [outerTheme]
  );

  const rtlCache = useMemo(
    () => createCache({ key: 'mui-rtl-edituser', stylisPlugins: [rtlPlugin] }),
    []
  );

  useEffect(() => {
    let url: string | undefined;

    if (avatarFile) {
      url = URL.createObjectURL(avatarFile);
      setAvatarPreview(url);
    } else {
      setAvatarPreview(null);
    }
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [avatarFile]);

  const validate = () => {
    const next: Record<string, string> = {};

    if (!fName.trim()) next.fName = 'نام را وارد کنید.';
    if (!lName.trim()) next.lName = 'نام خانوادگی را وارد کنید.';

    const rawPhone = toLatinDigits(phone).replace(/\s|-/g, '');
    if (!rawPhone) {
      next.phone = 'شماره موبایل را وارد کنید.';
    } else if (!/^\d{10,15}$/.test(rawPhone)) {
      next.phone = 'شماره معتبر نیست.';
    }

    if (!password) next.password = 'رمز عبور را وارد کنید.';
    else if (password.length < 6) next.password = 'حداقل ۶ کاراکتر.';

    if (avatarFile) {
      const mb = avatarFile.size / (1024 * 1024);
      if (mb > MAX_AVATAR_MB) next.avatar = `حجم تصویر نباید بیش از ${MAX_AVATAR_MB}MB باشد.`;
      if (!/^image\/(png|jpe?g|webp|gif)$/i.test(avatarFile.type))
        next.avatar = 'فرمت تصویر معتبر نیست (PNG/JPG/WEBP/GIF).';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleAvatarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setAvatarFile(f);
    setErrors((prev) => ({ ...prev, avatar: '' }));
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('لطفاً خطاهای فرم را برطرف کنید.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await setAgentBot({
        Phone: toLatinDigits(phone).replace(/\s|-/g, ''),
        Password: password,
        fName: fName.trim(),
        lName: lName.trim(),
        Avatar: avatarFile,
      });

      const ok = res && typeof res.success !== 'undefined' ? !!res.success : true;
      const message =
        res?.message || (ok ? 'کاربر با موفقیت ایجاد شد.' : 'ایجاد کاربر ناموفق بود.');

      if (ok) {
        toast.success(message);
        onCreated?.();
        handleClose();
      } else {
        toast.error(message);
      }
    } catch (err: any) {
      const msg = err?.message || 'ایجاد کاربر ناموفق بود.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setPhone('');
    setPassword('');
    setFName('');
    setLName('');
    setAvatarFile(null);
    setAvatarPreview(null);
    setErrors({});
  };

  // reset when dialog closes
  useEffect(() => {
    if (!openAddDialog) resetForm();
  }, [openAddDialog]);

  return (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={rtlTheme}>
        <Dialog
          dir="rtl"
          open={!!openAddDialog}
          onClose={handleClose}
          fullScreen={fullScreen}
          aria-labelledby="add-user-title"
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
            id="add-user-title"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              pr: 2,
              pl: 2,
              py: 1.5,
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              افزودن کاربر جدید
            </Typography>
            <IconButton aria-label="بستن" onClick={handleClose} edge="end">
              <CloseRoundedIcon />
            </IconButton>
          </DialogTitle>

          <Divider />

          <DialogContent sx={{ pt: 3 }}>
            {/* Avatar picker */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 3,
                flexWrap: 'wrap',
              }}
            >
              <Avatar
                src={avatarPreview ?? undefined}
                alt="avatar"
                sx={{ width: 64, height: 64, fontSize: 18, bgcolor: 'primary.main' }}
              >
                {fName?.[0] || lName?.[0] || '?'}
              </Avatar>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Button component="label" variant="outlined" startIcon={<UploadRoundedIcon />}>
                  انتخاب تصویر
                  <input type="file" accept="image/*" hidden onChange={handleAvatarPick} />
                </Button>
                {avatarFile && (
                  <Tooltip title="حذف تصویر">
                    <IconButton
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarPreview(null);
                      }}
                    >
                      <CloseRoundedIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
            {errors.avatar && (
              <FormHelperText error sx={{ mt: -2, mb: 2 }}>
                {errors.avatar}
              </FormHelperText>
            )}

            {/* Fields */}
            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}
            >
              <TextField
                label="نام"
                // placeholder="مثلاً: علی"
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
                // placeholder="مثلاً: رضایی"
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
                // placeholder="مثلاً: 09123456789"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setErrors((p) => ({ ...p, phone: '' }));
                }}
                error={!!errors.phone}
                helperText={errors.phone || 'فقط اعداد، تبدیل ارقام فارسی به انگلیسی انجام می‌شود.'}
                required
                inputMode="tel"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIphoneRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="رمز عبور"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((p) => ({ ...p, password: '' }));
                }}
                error={!!errors.password}
                helperText={errors.password || 'حداقل ۶ کاراکتر.'}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <KeyRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <FormHelperText>
                با ثبت کاربر، اطلاعات بالا ذخیره می‌شود. لطفاً از صحت شماره موبایل اطمینان حاصل
                کنید.
              </FormHelperText>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2, gap: 1.5 }}>
            <Button
              onClick={handleClose}
              color="inherit"
              variant="outlined"
              startIcon={<CloseRoundedIcon />}
            >
              انصراف
            </Button>

            <LoadingButton
              onClick={handleSubmit}
              // variant="contained"
              color="primary"
              loading={submitting}
              loadingIndicator={<CircularProgress size={18} />}
            >
              افزودن کاربر
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </CacheProvider>
  );
}
