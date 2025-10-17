// src/sections/products/components/EditProductDialog.tsx
import { toast } from 'sonner';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import React, { useMemo, useState, useEffect } from 'react';

import { useTheme, ThemeProvider, createTheme } from '@mui/material/styles';
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
  FormControl,
  FormHelperText,
  CircularProgress,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';

import { updateProductJson } from '../api/productsApi';
import { GetCategoriesApi } from '../api/categoriesApi';
import type { Category } from '../api/categoriesApi';

// Persian → Latin digits
function toLatinDigits(input: string) {
  const map: Record<string, string> = {
    '۰': '0',
    '۱': '1',
    '۲': '2',
    '۳': '3',
    '۴': '4',
    '۵': '5',
    '۶': '6',
    '۷': '7',
    '۸': '8',
    '۹': '9',
  };
  return input.replace(/[۰-۹]/g, (d) => map[d] ?? d);
}

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

  // Load categories (names shown, id stored)
  const { categories, categoriesLoading, categoriesError } = GetCategoriesApi();

  useEffect(() => {
    setName(product?.name ?? '');
    setDescription(product?.description ?? '');
    setPrice(product?.price ?? '');
    setCategoryId(product?.categoryId ?? '');
    setIsPublish(product?.isPublish ?? true);
  }, [product, open]);

  // RTL
  const outerTheme = useTheme();
  const rtlTheme = useMemo(() => createTheme(outerTheme, { direction: 'rtl' }), [outerTheme]);
  const rtlCache = useMemo(
    () => createCache({ key: 'mui-rtl-editproduct', stylisPlugins: [rtlPlugin] }),
    []
  );

  const selectedCategory = useMemo<Category | null>(() => {
    if (categoryId === '') return null;
    return categories.find((c) => c.id === Number(categoryId)) ?? null;
  }, [categoryId, categories]);

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
        categoryId: Number(categoryId), // send id only
        price: Number(price),
        status: 1,
        isPublished: isPublish,
      });

      const ok = res?.success ?? true;
      const msg = res?.message || (ok ? 'محصول بروزرسانی شد.' : 'بروزرسانی ناموفق بود.');
      if (ok) {
        toast.success(msg);
        onUpdated?.(); // parent should SWR mutate()
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

              {/* Keep as text to accept Persian digits; normalize -> Number */}
              <TextField
                label="قیمت"
                type="text"
                value={price}
                onChange={(e) => {
                  const normalized = toLatinDigits(e.target.value).replace(/[^\d]/g, '');
                  setPrice(normalized === '' ? '' : Number(normalized));
                }}
                inputProps={{ inputMode: 'numeric' }}
              />

              {/* Category selector: show names, store id */}
              <FormControl error={categoryId === ''} fullWidth>
                <Autocomplete<Category, false, false, false>
                  options={categories}
                  loading={categoriesLoading}
                  value={selectedCategory}
                  onChange={(_, option) => setCategoryId(option ? option.id : '')}
                  getOptionLabel={(opt) => opt?.name ?? ''}
                  noOptionsText={categoriesLoading ? 'در حال بارگذاری...' : 'موردی یافت نشد'}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="دسته‌بندی"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {categoriesLoading ? (
                              <CircularProgress size={18} sx={{ mr: 1 }} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
                {categoryId === '' && <FormHelperText>انتخاب دسته اجباری است</FormHelperText>}
                {categoriesError && <FormHelperText error>خطا در بارگذاری دسته‌ها</FormHelperText>}
              </FormControl>

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
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading || categoriesLoading}
            >
              {loading ? 'در حال ذخیره...' : 'ذخیره'}
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </CacheProvider>
  );
}
