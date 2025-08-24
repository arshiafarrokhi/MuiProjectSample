import { toast } from 'sonner';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import React, { useMemo, useState, useEffect } from 'react';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';
import { useTheme, createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Stack,
  Dialog,
  Button,
  Avatar,
  TextField,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';

import { updateProductApi } from '../api/productsApi';

type Props = {
  open: boolean;
  onClose: () => void;
  product?: { id: string; title?: string; price?: number; sku?: string; image?: string } | null;
  onUpdated?: () => void;
};

export default function EditProductDialog({ open, onClose, product, onUpdated }: Props) {
  const [title, setTitle] = useState(product?.title ?? '');
  const [price, setPrice] = useState<number | ''>(product?.price ?? '');
  const [sku, setSku] = useState(product?.sku ?? '');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(product?.image ?? null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTitle(product?.title ?? '');
    setPrice(product?.price ?? '');
    setSku(product?.sku ?? '');
    setPreview(product?.image ?? null);
    setImage(null);
  }, [product, open]);

  useEffect(() => {
    if (!image) return undefined; // ✅ fix: consistent-return
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const { updateProduct } = updateProductApi();

  // ✅ Your preferred RTL setup
  const rtlCache = useMemo(
    () => createCache({ key: 'mui-rtl-edituser', stylisPlugins: [rtlPlugin] }),
    []
  );
  const outerTheme = useTheme();
  const rtlTheme = useMemo(() => createTheme(outerTheme, { direction: 'rtl' }), [outerTheme]);

  const handleSubmit = async () => {
    if (!product?.id) {
      toast.error('شناسه محصول نامعتبر است.');
      return;
    }
    if (!title.trim()) {
      toast.error('عنوان محصول را وارد کنید.');
      return;
    }
    setLoading(true);
    try {
      const res = await updateProduct({
        productId: product.id,
        title: title.trim(),
        price: price === '' ? undefined : Number(price),
        sku: sku.trim() || undefined,
        image,
      });
      const ok = res?.success ?? true;
      const msg = res?.message || (ok ? 'محصول بروزرسانی شد.' : 'بروزرسانی ناموفق بود.');
      if (ok) {
        toast.success(msg);
        if (onUpdated) onUpdated(); // ✅ fix: no-unused-expressions
        onClose();
      } else {
        toast.error(msg);
      }
    } catch (e: any) {
      toast.error(e?.message || 'خطا در بروزرسانی محصول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={rtlTheme}>
        <Dialog
          dir="rtl"
          open={open}
          onClose={onClose}
          PaperProps={{ sx: { borderRadius: 3, width: '100%', maxWidth: 560 } }}
        >
          <DialogTitle
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            ویرایش محصول
            <IconButton onClick={onClose}>
              <CloseRoundedIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar src={preview ?? undefined} sx={{ width: 64, height: 64 }} />
                <Button component="label" startIcon={<UploadRoundedIcon />} variant="outlined">
                  انتخاب تصویر
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                  />
                </Button>
              </Stack>
              <TextField
                label="عنوان"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <TextField
                label="قیمت"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">ریال</InputAdornment>,
                }}
              />
              <TextField
                label="شناسه کالا (SKU)"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={onClose} color="inherit" variant="outlined">
              انصراف
            </Button>
            <Button onClick={handleSubmit} variant="contained" disabled={loading}>
              {loading ? 'در حال ذخیره...' : 'ذخیره'}
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </CacheProvider>
  );
}
