import { toast } from 'sonner';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
// src/sections/products/components/EditProductDialog.tsx
import React, { useMemo, useState, useEffect } from 'react';

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

import { updateProductJson } from '../api/productSimApi';

type Props = {
  open: boolean;
  onClose: () => void;
  product?: {
    id: string;
    name?: string;
    description?: string;
    price?: number;
    categoryId?: number;
    isPublish?: boolean;
  } | null;
  onUpdated?: () => void;
};

export default function EditProductDialog({ open, onClose, product, onUpdated }: Props) {
  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState<number | ''>(product?.price ?? '');
  const [categoryId, setCategoryId] = useState<number | ''>(product?.categoryId ?? '');
  const [isPublish, setIsPublish] = useState<boolean>(product?.isPublish ?? true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(product?.name ?? '');
    setDescription(product?.description ?? '');
    setPrice(product?.price ?? '');
    setCategoryId(product?.categoryId ?? '');
    setIsPublish(product?.isPublish ?? true);
  }, [product, open]);

  // RTL
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
    if (!name.trim() || price === '' || categoryId === '') {
      toast.error('نام، قیمت و دسته را کامل وارد کنید.');
      return;
    }
    setLoading(true);
    try {
      const res = await updateProductJson({
        productId: product.id,
        name: name.trim(),
        description: description.trim(),
        categoryId: Number(categoryId),
        price: Number(price),
        status: 1,
      });
      const ok = res?.success ?? true;
      const msg = res?.message || (ok ? 'محصول بروزرسانی شد.' : 'بروزرسانی ناموفق بود.');
      if (ok) {
        toast.success(msg);
        if (onUpdated) onUpdated();
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
          <DialogTitle>ویرایش محصول</DialogTitle>
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
                label="انتشار (نمایشی)"
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
