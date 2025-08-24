import { toast } from 'sonner';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
// src/sections/products/components/AddProductDialog.tsx
import React, { useMemo, useState } from 'react';

import { useTheme, createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Stack,
  Dialog,
  Button,
  Switch,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { createProductJson } from '../api/productsApi';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export default function AddProductDialog({ open, onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [isPublish, setIsPublish] = useState(true);
  const [loading, setLoading] = useState(false);

  // RTL (الگوی مورد علاقه شما)
  const rtlCache = useMemo(
    () => createCache({ key: 'mui-rtl-edituser', stylisPlugins: [rtlPlugin] }),
    []
  );
  const outerTheme = useTheme();
  const rtlTheme = useMemo(() => createTheme(outerTheme, { direction: 'rtl' }), [outerTheme]);

  const reset = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCategoryId('');
    setIsPublish(true);
  };

  const handleSubmit = async () => {
    if (!name.trim() || price === '' || categoryId === '') {
      toast.error('نام، قیمت و دسته را کامل وارد کنید.');
      return;
    }
    setLoading(true);
    try {
      const res = await createProductJson({
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        isPublish,
        status: 1,
        categoryId: Number(categoryId),
      });
      const ok = res?.success ?? true;
      const msg = res?.message || (ok ? 'محصول ایجاد شد.' : 'ایجاد محصول ناموفق بود.');
      if (ok) {
        toast.success(msg);
        if (onCreated) onCreated();
        onClose();
        reset();
      } else {
        toast.error(msg);
      }
    } catch (e: any) {
      toast.error(e?.message || 'خطا در ایجاد محصول');
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
          <DialogTitle>افزودن محصول</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="نام"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <TextField
                label="توضیحات"
                multiline
                minRows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <TextField
                label="قیمت"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
              />
              <TextField
                label="شناسه دسته (CategoryId)"
                type="number"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value === '' ? '' : Number(e.target.value))}
              />
              <FormControlLabel
                control={
                  <Switch checked={isPublish} onChange={(e) => setIsPublish(e.target.checked)} />
                }
                label="انتشار"
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
