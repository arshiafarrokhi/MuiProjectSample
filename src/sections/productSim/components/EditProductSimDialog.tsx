import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Box,
  Typography,
} from '@mui/material';
import { toast } from 'sonner';

import { useTheme, createTheme, ThemeProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { getProductSim, updateProductSim } from '../api/productSimApi';

type Props = {
  open: boolean;
  productId: string | null;
  onClose: () => void;
  onUpdated?: () => void;
};

export default function EditProductSimDialog({ open, productId, onClose, onUpdated }: Props) {
  const rtlCache = useMemo(
    () => createCache({ key: 'mui-rtl-productsim', stylisPlugins: [rtlPlugin] }),
    []
  );
  const outerTheme = useTheme();
  const rtlTheme = useMemo(() => createTheme(outerTheme, { direction: 'rtl' }), [outerTheme]);

  const [name, setName] = useState('');
  const [price, setPrice] = useState<string>('');
  const [description, setDescription] = useState('');
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !productId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await getProductSim(productId);
        const p = res?.result?.product ?? res?.result ?? null;
        if (p) {
          setName(p.name ?? '');
          setPrice(String(p.price ?? ''));
          setDescription(p.description ?? '');
          setExistingImage(p.image ?? null);
        }
      } catch (e: any) {
        toast.error(e?.message || 'خطا در دریافت اطلاعات محصول');
      } finally {
        setLoading(false);
      }
    })();
  }, [open, productId]);

  const handleSubmit = async () => {
    if (!productId) return;
    if (!name.trim()) {
      toast.error('نام را وارد کنید.');
      return;
    }
    if (!price || isNaN(Number(price))) {
      toast.error('قیمت معتبر وارد کنید.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await updateProductSim({
        productId,
        name: name.trim(),
        price: Number(price),
        description: description.trim(),
        image: imageFile ?? undefined,
      });
      const ok = res?.success ?? true;
      const msg = res?.message || (ok ? 'ویرایش با موفقیت انجام شد.' : 'ویرایش ناموفق بود.');
      if (ok) {
        toast.success(msg);
        if (onUpdated) onUpdated();
        onClose();
      } else {
        toast.error(msg);
      }
    } catch (e: any) {
      toast.error(e?.message || 'خطا در ویرایش');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={rtlTheme}>
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" dir="rtl">
          <DialogTitle>ویرایش محصول سیم‌کارت</DialogTitle>
          <DialogContent dividers>
            {loading ? (
              <Typography>در حال بارگذاری...</Typography>
            ) : (
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
                  minRows={3}
                />

                <Stack direction="row" spacing={2} alignItems="center">
                  <Button variant="outlined" component="label">
                    انتخاب تصویر جدید
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                    />
                  </Button>

                  {imageFile ? (
                    <Box sx={{ width: 64, height: 64, borderRadius: 1, overflow: 'hidden' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(imageFile)}
                        alt="preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                  ) : existingImage ? (
                    <Typography variant="caption">تصویر فعلی: {existingImage}</Typography>
                  ) : null}
                </Stack>
              </Stack>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={onClose} color="inherit" disabled={submitting}>
              انصراف
            </Button>
            <Button onClick={handleSubmit} variant="contained" disabled={submitting || loading}>
              {submitting ? 'در حال ارسال...' : 'ذخیره'}
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </CacheProvider>
  );
}
