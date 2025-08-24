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

import { createProductApi } from '../api/productsApi';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export default function AddProductDialog({ open, onClose, onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [sku, setSku] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { createProduct } = createProductApi();

  // ✅ Your preferred RTL setup
  const rtlCache = useMemo(
    () => createCache({ key: 'mui-rtl-edituser', stylisPlugins: [rtlPlugin] }),
    []
  );
  const outerTheme = useTheme();
  const rtlTheme = useMemo(() => createTheme(outerTheme, { direction: 'rtl' }), [outerTheme]);

  useEffect(() => {
    if (!image) {
      setPreview(null);
      return undefined; // ✅ fix: consistent-return
    }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const reset = () => {
    setTitle('');
    setPrice('');
    setSku('');
    setImage(null);
    setPreview(null);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('عنوان محصول را وارد کنید.');
      return;
    }
    setLoading(true);
    try {
      const res = await createProduct({
        title: title.trim(),
        price: price === '' ? undefined : Number(price),
        sku: sku.trim() || undefined,
        image,
      });
      const ok = res?.success ?? true;
      const msg = res?.message || (ok ? 'محصول با موفقیت اضافه شد.' : 'افزودن محصول ناموفق بود.');
      if (ok) {
        toast.success(msg);
        if (onCreated) onCreated(); // ✅ fix: no-unused-expressions
        onClose();
        reset();
      } else {
        toast.error(msg);
      }
    } catch (e: any) {
      toast.error(e?.message || 'خطا در افزودن محصول');
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
            افزودن محصول
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
              {loading ? 'در حال ذخیره...' : 'افزودن'}
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </CacheProvider>
  );
}
