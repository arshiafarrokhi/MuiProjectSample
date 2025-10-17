import { toast } from 'sonner';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import React, { useMemo, useState } from 'react';

import Autocomplete from '@mui/material/Autocomplete';
import { useTheme, createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Stack,
  Dialog,
  Button,
  Switch,
  TextField,
  DialogTitle,
  FormControl,
  DialogContent,
  DialogActions,
  FormHelperText,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';

import { createProductJson } from '../api/productsApi';
import { GetCategoriesApi } from '../api/categoriesApi';

import type { Category } from '../api/categoriesApi';

// Persian → Latin digits (minimal & local)
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
  onCreated?: () => void; // parent should call mutate() on products list
};

export default function AddProductDialog({ open, onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState<number | ''>(''); // keep only id
  const [isPublish, setIsPublish] = useState(true);
  const [loading, setLoading] = useState(false);

  const { categories, categoriesLoading, categoriesError } = GetCategoriesApi();

  // RTL
  const rtlCache = useMemo(
    () => createCache({ key: 'mui-rtl-addproduct', stylisPlugins: [rtlPlugin] }),
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
        categoryId: Number(categoryId), // ✅ send id only
      });

      const ok = res?.success ?? true;
      const msg = res?.message || (ok ? 'محصول ایجاد شد.' : 'ایجاد محصول ناموفق بود.');
      if (ok) {
        toast.success(msg);
        onCreated?.(); // parent should call mutate()
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

              {/* Keep price as text to allow Persian digits; normalize before Number() */}
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

              {/* Category: show names, store only id */}
              <FormControl error={categoryId === ''} fullWidth>
                <Autocomplete<Category, false, false, false>
                  options={categories}
                  loading={categoriesLoading}
                  // value is derived from categoryId; find the option by id
                  value={
                    categoryId === ''
                      ? null
                      : (categories.find((c) => c.id === Number(categoryId)) ?? null)
                  }
                  onChange={(_, option) => {
                    setCategoryId(option ? option.id : '');
                  }}
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
              {loading ? 'در حال ذخیره...' : 'افزودن'}
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </CacheProvider>
  );
}
