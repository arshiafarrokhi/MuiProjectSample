import { toast } from 'sonner';
import { varAlpha } from 'minimal-shared/utils';
// src/sections/products/views/CategoriesTab.tsx
import React, { useMemo, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import {
  Box,
  Table,
  Stack,
  Paper,
  Button,
  Tooltip,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Typography,
  IconButton,
  TableContainer,
} from '@mui/material';

import AddCategoryDialog from '../components/AddCategoryDialog';
import { removeCategory, GetCategoriesApi } from '../api/categoriesApi';

const clamp2Lines = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical' as const,
  overflow: 'hidden',
};

export default function CategoriesTab() {
  const { categories, categoriesLoading, refetchCategories } = GetCategoriesApi();
  const [openAdd, setOpenAdd] = useState(false);

  const safeCats = useMemo(() => (Array.isArray(categories) ? categories : []), [categories]);

  const handleDelete = async (categoryName: string) => {
    try {
      const res = await removeCategory(categoryName);
      const ok = res?.success ?? true;
      const msg = res?.message || (ok ? 'دسته‌بندی حذف شد.' : 'حذف ناموفق بود.');
      if (ok) {
        toast.success(msg);
        if (refetchCategories) refetchCategories(undefined, { revalidate: true });
      } else {
        toast.error(msg);
      }
    } catch (e: any) {
      toast.error(e?.message || 'خطا در حذف دسته‌بندی');
    }
  };

  return (
    <Box>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="space-between"
        sx={(theme) => ({
          mb: 2,
          p: 2,
          borderRadius: 2,
          bgcolor: varAlpha(theme.vars?.palette?.grey?.['500Channel'] ?? '120 120 120', 0.04),
        })}
      >
        <Typography variant="h6" fontWeight={700}>
          دسته‌بندی‌ها
        </Typography>
        <Button startIcon={<AddIcon />} variant="contained" onClick={() => setOpenAdd(true)}>
          افزودن دسته‌بندی
        </Button>
      </Stack>

      <TableContainer
        component={Paper}
        sx={{
          width: '100%',
          overflowY: 'auto',
          overflowX: 'auto',
          maxHeight: {
            xs: 'calc(100dvh - 260px)',
            sm: 'calc(100dvh - 280px)',
            md: 'calc(100dvh - 320px)',
          },
          borderRadius: 1.5,
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 80 }} align="center">
                حذف
              </TableCell>
              <TableCell sx={{ minWidth: 200 }}>نام</TableCell>
              <TableCell sx={{ minWidth: 300, maxWidth: 600 }}>توضیحات</TableCell>
              {/* <TableCell sx={{ width: 120 }} align="center">
                ID
              </TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {categoriesLoading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  در حال بارگذاری...
                </TableCell>
              </TableRow>
            ) : safeCats.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  دسته‌بندی‌ای یافت نشد.
                </TableCell>
              </TableRow>
            ) : (
              safeCats.map((c) => (
                <TableRow key={c.id}>
                  <TableCell align="center">
                    <Tooltip title="حذف دسته‌بندی">
                      <IconButton
                        color="error"
                        onClick={() => {
                          if (confirm(`حذف دسته «${c.name}»؟`)) {
                            handleDelete(c.name);
                          }
                        }}
                      >
                        <DeleteOutlineRoundedIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600} noWrap>
                      {c.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {c.description ? (
                      <Tooltip title={c.description}>
                        <Typography variant="body2" sx={clamp2Lines}>
                          {c.description}
                        </Typography>
                      </Tooltip>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  {/* <TableCell align="center">{c.id}</TableCell> */}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AddCategoryDialog
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onCreated={() => refetchCategories?.(undefined, { revalidate: true })}
      />
    </Box>
  );
}
