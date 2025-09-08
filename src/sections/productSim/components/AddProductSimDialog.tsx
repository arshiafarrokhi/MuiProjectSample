// File: src/sections/productSim/components/AddProductSimDialog.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { toast } from 'sonner';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';

import { useTheme, ThemeProvider, createTheme } from '@mui/material/styles';
import {
  Box,
  Stack,
  Dialog,
  Button,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  DialogTitle,
  FormControl,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
} from '@mui/material';

import { getCountries, getOperators, addProductSim } from '../api/productSimApi';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

const INTERNET_TYPES = [
  { value: 1, label: 'روزانه (daily)' },
  { value: 2, label: 'آب‌وهوا (weather)' },
  { value: 3, label: 'ماهانه (monthly)' },
  { value: 4, label: 'سالانه (yearly)' },
];

const SIM_TYPES = [
  { value: 1, label: 'دائمی (permanent)' },
  { value: 2, label: 'اعتباری (credit)' },
];

const UNITS = [
  { value: 1, label: 'MB' },
  { value: 2, label: 'GB' },
];

export default function AddProductSimDialog({ open, onClose, onCreated }: Props) {
  // --- RTL pattern (no RtlScope)
  const rtlCache = useMemo(
    () => createCache({ key: 'mui-rtl-add-sim', stylisPlugins: [rtlPlugin] }),
    []
  );
  const outerTheme = useTheme();
  const rtlTheme = useMemo(() => createTheme(outerTheme, { direction: 'rtl' }), [outerTheme]);

  // --- Base fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState<string>('');
  const [description, setDescription] = useState('');
  const [countryId, setCountryId] = useState<number | ''>('');
  const [operatorId, setOperatorId] = useState<number | ''>('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  // --- Internet fields (NEW)
  const [internetHourly, setInternetHourly] = useState<boolean>(false);
  const [internetDays, setInternetDays] = useState<string>(''); // number-like
  const [internetVolume, setInternetVolume] = useState<string>(''); // number-like
  const [internetUnit, setInternetUnit] = useState<1 | 2>(1);
  const [internetSimType, setInternetSimType] = useState<1 | 2>(1);
  const [internetInternetType, setInternetInternetType] = useState<1 | 2 | 3 | 4>(1);

  const [countries, setCountries] = useState<any[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Reset & fetch countries on open
  useEffect(() => {
    if (!open) return;
    setName('');
    setPrice('');
    setDescription('');
    setCountryId('');
    setOperatorId('');
    setImageFile(null);

    // reset Internet fields
    setInternetHourly(false);
    setInternetDays('');
    setInternetVolume('');
    setInternetUnit(1);
    setInternetSimType(1);
    setInternetInternetType(1);

    (async () => {
      try {
        const res = await getCountries();
        const cs = res?.result?.countries ?? res?.result ?? [];
        setCountries(cs);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [open]);

  // Fetch operators by country
  useEffect(() => {
    if (!open) return;
    if (!countryId) {
      setOperators([]);
      setOperatorId('');
      return;
    }
    (async () => {
      try {
        const res = await getOperators(Number(countryId));
        const ops = res?.result?.operators ?? res?.result ?? [];
        setOperators(ops);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [countryId, open]);

  // Selected operator details
  useEffect(() => {
    if (!operatorId) {
      setSelectedOperator(null);
      return;
    }
    const op = operators.find((o) => o.id === operatorId || o.id === Number(operatorId));
    setSelectedOperator(op || null);
  }, [operatorId, operators]);

  const validate = () => {
    if (!name.trim()) {
      toast.error('نام را وارد کنید.');
      return false;
    }
    if (!price || isNaN(Number(price))) {
      toast.error('قیمت معتبر وارد کنید.');
      return false;
    }
    if (!countryId) {
      toast.error('کشور را انتخاب کنید.');
      return false;
    }
    if (!operatorId) {
      toast.error('اپراتور را انتخاب کنید.');
      return false;
    }
    if (!imageFile) {
      toast.error('تصویر انتخاب کنید.');
      return false;
    }
    // Internet fields
    if (internetDays === '' || isNaN(Number(internetDays)) || Number(internetDays) < 0) {
      toast.error('Days را صحیح وارد کنید.');
      return false;
    }
    if (internetVolume === '' || isNaN(Number(internetVolume)) || Number(internetVolume) <= 0) {
      toast.error('حجم (Volume) را صحیح وارد کنید.');
      return false;
    }
    if (![1, 2].includes(Number(internetUnit))) {
      toast.error('واحد (Unit) نامعتبر است.');
      return false;
    }
    if (![1, 2].includes(Number(internetSimType))) {
      toast.error('نوع سیم‌کارت (SimType) نامعتبر است.');
      return false;
    }
    if (![1, 2, 3, 4].includes(Number(internetInternetType))) {
      toast.error('نوع اینترنت (InternetType) نامعتبر است.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await addProductSim({
        name: name.trim(),
        price: Number(price),
        description: description.trim(),
        image: imageFile!,
        simOperatorId: Number(operatorId),

        // NEW internet fields
        internetHourly,
        internetDays: Number(internetDays),
        internetVolume: Number(internetVolume),
        internetUnit,
        internetSimType,
        internetInternetType,
      });

      const ok = res?.success ?? true;
      const msg = res?.message || (ok ? 'محصول ایجاد شد.' : 'ایجاد محصول ناموفق بود.');
      if (ok) {
        toast.success(msg);
        onCreated?.();
        onClose();
      } else {
        toast.error(msg);
      }
    } catch (e: any) {
      toast.error(e?.message || 'خطا در ایجاد محصول');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={rtlTheme}>
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" dir="rtl">
          <DialogTitle>افزودن محصول سیم‌کارت</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="نام"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
              />
              <TextField
                label="قیمت"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                fullWidth
                inputProps={{ inputMode: 'numeric' }}
              />
              {selectedOperator && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
                  حداقل: {selectedOperator.min ?? '—'} | حداکثر: {selectedOperator.max ?? '—'}
                </Typography>
              )}
              <TextField
                label="توضیحات"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                multiline
                minRows={2}
              />

              <FormControl fullWidth>
                <InputLabel>کشور</InputLabel>
                <Select
                  value={countryId}
                  label="کشور"
                  onChange={(e) => setCountryId(e.target.value as number)}
                >
                  {countries.map((c: any) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>اپراتور</InputLabel>
                <Select
                  value={operatorId}
                  label="اپراتور"
                  onChange={(e) => setOperatorId(e.target.value as number)}
                  disabled={!countryId}
                >
                  {operators.map((o: any) => (
                    <MenuItem key={o.id} value={o.id}>
                      {o.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* NEW: Internet Fields */}
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                اطلاعات اینترنت
              </Typography>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={internetHourly}
                    onChange={(e) => setInternetHourly(e.target.checked)}
                  />
                }
                label="ساعتی (Hourly)"
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="روز (Days)"
                  type="number"
                  value={internetDays}
                  onChange={(e) => setInternetDays(e.target.value)}
                />
                <TextField
                  label="حجم (Volume)"
                  type="number"
                  value={internetVolume}
                  onChange={(e) => setInternetVolume(e.target.value)}
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>واحد (Unit)</InputLabel>
                  <Select
                    label="واحد (Unit)"
                    value={internetUnit}
                    onChange={(e) => setInternetUnit(e.target.value as 1 | 2)}
                  >
                    {UNITS.map((u) => (
                      <MenuItem key={u.value} value={u.value}>
                        {u.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>نوع سیم‌کارت (SimType)</InputLabel>
                  <Select
                    label="نوع سیم‌کارت (SimType)"
                    value={internetSimType}
                    onChange={(e) => setInternetSimType(e.target.value as 1 | 2)}
                  >
                    {SIM_TYPES.map((s) => (
                      <MenuItem key={s.value} value={s.value}>
                        {s.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              <FormControl fullWidth>
                <InputLabel>نوع اینترنت (InternetType)</InputLabel>
                <Select
                  label="نوع اینترنت (InternetType)"
                  value={internetInternetType}
                  onChange={(e) => setInternetInternetType(e.target.value as 1 | 2 | 3 | 4)}
                >
                  {INTERNET_TYPES.map((t) => (
                    <MenuItem key={t.value} value={t.value}>
                      {t.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Stack direction="row" spacing={2} alignItems="center">
                <Button variant="outlined" component="label">
                  انتخاب تصویر
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  />
                </Button>
                {imageFile && (
                  <Box sx={{ width: 64, height: 64, borderRadius: 1, overflow: 'hidden' }}>
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                )}
              </Stack>
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={onClose} color="inherit" disabled={submitting}>
              انصراف
            </Button>
            <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
              {submitting ? 'در حال ارسال...' : 'ایجاد'}
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </CacheProvider>
  );
}
