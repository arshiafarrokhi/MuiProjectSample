import type {
  Theme} from '@mui/material';

import { toast } from 'sonner';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
// import { CacheProvider } from '@emotion/react';
// src/sections/products/components/AddCategoryDialog.tsx
import React, { useMemo, useState } from 'react';

import { useTheme, ThemeProvider } from '@mui/material/styles';
import {
  Stack,
  Dialog,
  Button,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

import { addCategory } from '../api/categoriesApi';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export default function AddCategoryDialog({ open, onClose, onCreated }: Props) {
  // RTL طبق قاعده‌ی شما
  const outerTheme = useTheme();

  const rtlTheme = useMemo(
    () => ({ ...(outerTheme as Theme), direction: 'rtl' }) as Theme,
    [outerTheme]
  );

  const rtlCache = useMemo(
    () => createCache({ key: 'mui-rtl-edituser', stylisPlugins: [rtlPlugin] }),
    []
  );

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('نام الزامی است.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await addCategory({
        name: name.trim(),
        description: description.trim() || undefined,
        parentId: parentId === '' ? 0 : Number(parentId),
      });
      const ok = res?.success ?? true;
      const msg = res?.message || (ok ? 'دسته‌بندی ایجاد شد.' : 'ایجاد ناموفق بود.');
      if (ok) {
        toast.success(msg);
        if (onCreated) onCreated();
        onClose();
        setName('');
        setDescription('');
        setParentId('');
      } else {
        toast.error(msg);
      }
    } catch (e: any) {
      toast.error(e?.message || 'خطا در ایجاد دسته‌بندی');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // <CacheProvider value={rtlCache}>
      <ThemeProvider theme={rtlTheme}>
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" dir="rtl">
          <DialogTitle>ایجاد دسته‌بندی</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="نام"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
              />
              <TextField
                label="توضیحات"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                multiline
                minRows={2}
              />
              <TextField
                label="شناسه والد (parentId)"
                type="number"
                value={parentId}
                onChange={(e) => setParentId(e.target.value === '' ? '' : Number(e.target.value))}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} color="inherit">
              انصراف
            </Button>
            <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
              ایجاد
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    // </CacheProvider>
  );
}
