// File: src/sections/productSim/components/AddProductSimDialog.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import { toast } from 'sonner';

import { useTheme, createTheme, ThemeProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { addProductSim, getCountries, getOperators } from '../api/productSimApi';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export default function AddProductSimDialog({ open, onClose, onCreated }: Props) {
  const rtlCache = useMemo(
    () => createCache({ key: 'mui-rtl-productsim', stylisPlugins: [rtlPlugin] }),
    []
  );
  const outerTheme = useTheme();
  const rtlTheme = useMemo(() => createTheme(outerTheme, { direction: 'rtl' }), [outerTheme]);

  const [name, setName] = useState('');
  const [price, setPrice] = useState<string>('');
  const [description, setDescription] = useState('');
  const [countryId, setCountryId] = useState<number | ''>('');
  const [operatorId, setOperatorId] = useState<number | ''>('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [countries, setCountries] = useState<any[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName('');
    setPrice('');
    setDescription('');
    setCountryId('');
    setOperatorId('');
    setImageFile(null);

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
      });
      const ok = res?.success ?? true;
      const msg = res?.message || (ok ? 'محصول ایجاد شد.' : 'ایجاد محصول ناموفق بود.');
      if (ok) {
        toast.success(msg);
        if (onCreated) onCreated();
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
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
