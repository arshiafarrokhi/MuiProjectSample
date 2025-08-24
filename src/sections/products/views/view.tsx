import type { Theme, SxProps } from '@mui/material/styles';

import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { deleteProductApi } from '../api/productsApi';
import AddProductDialog from '../components/AddProductDialog';
import EditProductDialog from '../components/EditProductDialog';

type Props = {
  sx?: SxProps<Theme>;
  products?: any[];
  activeOnly?: boolean;
  setActiveOnly?: (v: boolean) => void;
  onRefetch?: () => void;
};

export function ProductsView({ sx, products, activeOnly, setActiveOnly, onRefetch }: Props) {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [localActiveOnly, setLocalActiveOnly] = useState<boolean>(activeOnly ?? true);

  useEffect(() => {
    if (typeof activeOnly === 'boolean') setLocalActiveOnly(activeOnly);
  }, [activeOnly]);

  const { deleteProduct } = deleteProductApi();

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteProduct(id);
      const ok = res && typeof res.success !== 'undefined' ? !!res.success : true;
      const message = res?.message || (ok ? 'محصول حذف شد.' : 'حذف محصول ناموفق بود.');
      if (ok) {
        toast.success(message);
        if (onRefetch) onRefetch(); // ✅ fix: no-unused-expressions
      } else {
        toast.error(message);
      }
    } catch (err: any) {
      toast.error(err?.message || 'خطا در حذف محصول');
    }
  };

  const handleToggleActive = (value: boolean) => {
    setLocalActiveOnly(value);
    if (typeof setActiveOnly === 'function') setActiveOnly(value);
  };

  const safeProducts = Array.isArray(products) ? products : [];

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4">محصولات</Typography>

      <Box
        sx={[
          (theme) => ({
            p: 3,
            mt: 5,
            width: 1,
            border: `dashed 1px ${theme.vars.palette.divider}`,
            bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
          }),
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []), // ✅ robust handling if sx is undefined
        ]}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
          <Button startIcon={<AddIcon />} onClick={() => setOpenAddDialog(true)} color="primary">
            افزودن محصول
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!localActiveOnly}
                  onChange={(e) => handleToggleActive(e.target.checked)}
                  color="primary"
                />
              }
              label="محصول فعال"
            />
          </Box>

          {safeProducts.map((item: any) => (
            <Box
              key={item.id}
              sx={[
                (theme) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  paddingX: '15px',
                  paddingY: '15px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                }),
                ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
              ]}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: 90,
                }}
              >
                <img
                  src={item.image}
                  alt={item.title || item.name}
                  width={70}
                  style={{
                    borderRadius: 12,
                    objectFit: 'cover',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  {item.title ?? item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {item.sku ? `SKU: ${item.sku}` : '—'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.price != null
                    ? `قیمت: ${Number(item.price).toLocaleString('fa-IR')} ریال`
                    : 'قیمت: —'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <EditIcon
                  color="action"
                  sx={{ cursor: 'pointer', fontSize: 28 }}
                  onClick={() => {
                    setSelectedProduct({
                      id: item.id,
                      title: item.title ?? item.name ?? '',
                      price: item.price ?? '',
                      sku: item.sku ?? '',
                      image: item.image ?? '',
                    });
                    setOpenEditDialog(true);
                  }}
                  titleAccess="ویرایش محصول"
                />
                <DeleteOutlineRoundedIcon
                  color="error"
                  sx={{ cursor: 'pointer', fontSize: 26 }}
                  onClick={() => {
                    if (confirm('آیا از حذف این محصول مطمئن هستید؟')) {
                      handleDelete(item.id);
                    }
                  }}
                  titleAccess="حذف محصول"
                />
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <AddProductDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        onCreated={onRefetch}
      />
      <EditProductDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        product={selectedProduct}
        onUpdated={onRefetch}
      />
    </DashboardContent>
  );
}
