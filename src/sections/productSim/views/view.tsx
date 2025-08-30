import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import React, { useMemo, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import {
  Box,
  Tabs,
  Tab,
  Table,
  Paper,
  Stack,
  Button,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Typography,
  IconButton,
  TableContainer,
} from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';

import AddProductSimDialog from '../components/AddProductSimDialog';
import EditProductSimDialog from '../components/EditProductSimDialog';
import { removeProductSim, GetProductSimsApi } from '../api/productSimApi';
import ProductSimActivityTab from '../components/ProductSimActivityTab';

type Props = { sx?: any; onRefetch?: () => void };

export function ProductSimView({ sx, onRefetch }: Props) {
  const nav = useNavigate();
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { productSims, productSimsLoading, refetchProductSims } = GetProductSimsApi(0);

  const rows = useMemo(() => {
    if (!Array.isArray(productSims)) return [];
    return [...productSims].sort((a: any, b: any) => {
      const ta = a?.insertTime ? new Date(a.insertTime).getTime() : 0;
      const tb = b?.insertTime ? new Date(b.insertTime).getTime() : 0;
      return tb - ta;
    });
  }, [productSims]);

  const handleDelete = async (id: string) => {
    if (!confirm('محصول حذف شود؟')) return;
    try {
      const res = await removeProductSim(id);
      refetchProductSims();
      const ok = res?.success ?? true;
      const msg = res?.message || (ok ? 'محصول حذف شد.' : 'حذف ناموفق بود.');
      if (ok) {
        toast.success(msg);
      } else {
        toast.error(msg);
      }
    } catch (e: any) {
      toast.error(e?.message || 'خطا در حذف');
    }
  };

  // --- tabs ---
  const [tab, setTab] = useState(0);

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4">محصولات سیم‌کارت</Typography>

      <Box sx={[{ p: 3, mt: 5 }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ mb: 2 }}
          variant="scrollable"
          allowScrollButtonsMobile
        >
          <Tab label="لیست محصولات" />
          <Tab label="فعال‌سازی کشور/اپراتور" />
        </Tabs>

        {tab === 0 && (
          <>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Button startIcon={<AddIcon />} onClick={() => setOpenAdd(true)} variant="contained">
                افزودن محصول
              </Button>
            </Stack>

            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <TableContainer sx={{ maxHeight: { xs: '60vh', md: '70vh' } }}>
                <Table size="small" stickyHeader aria-label="product-sim-table">
                  <TableHead>
                    <TableRow>
                      <TableCell>نام</TableCell>
                      <TableCell>توضیحات</TableCell>
                      <TableCell>قیمت</TableCell>
                      <TableCell>اپراتور</TableCell>
                      <TableCell>کشور</TableCell>
                      <TableCell>تاریخ</TableCell>
                      <TableCell align="center">حذف</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(!rows || rows.length === 0) && !productSimsLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                          موردی یافت نشد.
                        </TableCell>
                      </TableRow>
                    ) : (
                      rows.map((r: any) => (
                        <TableRow
                          key={r.id}
                          hover
                          onDoubleClick={() =>
                            nav(`/dashboard/productSim/${r.id}`, { state: { name: r.name } })
                          }
                        >
                          <TableCell>{r.name ?? '—'}</TableCell>
                          <TableCell sx={{ maxWidth: 360 }}>{r.description ?? '—'}</TableCell>
                          <TableCell>
                            {typeof r.price === 'number'
                              ? new Intl.NumberFormat('fa-IR').format(r.price)
                              : '—'}
                          </TableCell>
                          <TableCell>{r.operator?.name ?? '—'}</TableCell>
                          <TableCell>{r.country?.name ?? '—'}</TableCell>
                          <TableCell>
                            {r.insertTime ? new Date(r.insertTime).toLocaleString('fa-IR') : '—'}
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedId(r.id);
                                  setOpenEdit(true);
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>

                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(r.id)}
                              >
                                <DeleteOutlineRoundedIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            <AddProductSimDialog
              open={openAdd}
              onClose={() => setOpenAdd(false)}
              onCreated={() => refetchProductSims && refetchProductSims()}
            />

            <EditProductSimDialog
              open={openEdit}
              productId={selectedId}
              onClose={() => setOpenEdit(false)}
              onUpdated={() => refetchProductSims && refetchProductSims()}
            />
          </>
        )}

        {tab === 1 && <ProductSimActivityTab />}
      </Box>
    </DashboardContent>
  );
}
