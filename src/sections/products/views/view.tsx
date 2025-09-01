// src/sections/products/views/view.tsx
import type { Theme, SxProps } from '@mui/material/styles';

import { toast } from 'sonner';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { varAlpha } from 'minimal-shared/utils';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import {
  Box,
  Chip,
  Grid,
  Table,
  Paper,
  Stack,
  Button,
  Tooltip,
  Divider,
  TableRow,
  Collapse,
  TableHead,
  TableBody,
  TableCell,
  Typography,
  IconButton,
  TableContainer,
} from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';

import { removeProduct } from '../api/productsApi';
import AddProductDialog from '../components/AddProductDialog';
import EditProductDialog from '../components/EditProductDialog';

type Props = {
  sx?: SxProps<Theme>;
  products?: any[];
  currency?: string;
  onRefetch?: () => void;
};

// ---------- helpers ----------
const isPrimitive = (v: any) => ['string', 'number', 'boolean'].includes(typeof v) || v == null;

const renderCategory = (category: any, categoryId: any) => {
  if (category == null) return categoryId ?? '—';
  if (isPrimitive(category)) return String(category);
  return category.name ?? category.title ?? category.id ?? categoryId ?? '—';
};

const getCount = (v: any) => {
  if (Array.isArray(v)) return v.length;
  if (v && typeof v === 'object') return Object.keys(v).length || 1;
  if (typeof v === 'number') return v;
  return 0;
};

const toFaDigits = (val: any) =>
  (val ?? '—').toString().replace(/\d/g, (d: string) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

const formatFaDate = (iso?: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  try {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Tehran',
    }).format(d);
  } catch {
    return d.toLocaleString('fa-IR');
  }
};

const clamp2Lines = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical' as const,
  overflow: 'hidden',
};

// ---------- component ----------
export function ProductsView({ sx, products, currency, onRefetch }: Props) {
  const nav = useNavigate();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // مرتب‌سازی محصولات از جدیدترین به قدیمی‌ترین بر اساس inserTime
  const safeProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return [...products].sort((a, b) => {
      const dateA = new Date(a.inserTime).getTime();
      const dateB = new Date(b.inserTime).getTime();
      return dateB - dateA; // جدیدترین اول
    });
  }, [products]);

  const handleDelete = async (productId: string) => {
    try {
      const res = await removeProduct(productId);
      const ok = res?.success ?? true;
      const msg = res?.message || (ok ? 'محصول حذف شد.' : 'حذف محصول ناموفق بود.');
      if (ok) {
        toast.success(msg);
        if (onRefetch) onRefetch();
      } else {
        toast.error(msg);
      }
    } catch (e: any) {
      toast.error(e?.message || 'خطا در حذف محصول');
    }
  };

  const toggleExpand = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

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
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ]}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Button
            startIcon={<AddIcon />}
            onClick={() => setOpenAddDialog(true)}
            variant="contained"
          >
            افزودن محصول
          </Button>
          <Stack direction="row" spacing={1} alignItems="center">
            <InfoOutlinedIcon fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              واحد پول: {currency || 'IRT'}
            </Typography>
          </Stack>
        </Stack>

        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer
            sx={{
              width: '100%',
              // اسکرول عمودی و افقی
              overflowY: 'auto',
              overflowX: 'auto',
              // ارتفاع واکنش‌گرا؛ با توجه به هدر/پدینگ‌ها قابل تنظیمه
              maxHeight: {
                xs: 'calc(100dvh - 240px)', // موبایل: ارتفاع ویوپورت داینامیک
                sm: 'calc(100dvh - 260px)',
                md: 'calc(100dvh - 300px)',
                lg: 'calc(100dvh - 340px)',
              },
              borderRadius: 1.5,
              bgcolor: 'background.paper',
            }}
          >
            <Table size="small" aria-label="products">
              <TableHead>
                <TableRow>
                  <TableCell width={56} />
                  <TableCell width={56}>ویرایش</TableCell>
                  <TableCell sx={{ minWidth: 160 }}>نام</TableCell>
                  <TableCell sx={{ minWidth: 260, maxWidth: 360 }}>توضیحات</TableCell>
                  <TableCell sx={{ width: 120 }}>قیمت</TableCell>
                  <TableCell sx={{ width: 100 }}>انتشار</TableCell>
                  <TableCell sx={{ minWidth: 120 }}>دسته</TableCell>
                  <TableCell sx={{ width: 140 }}>ایجاد</TableCell>
                  <TableCell sx={{ width: 140 }}>بروزرسانی</TableCell>
                  <TableCell align="center" width={72}>
                    حذف
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {safeProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                      محصولی یافت نشد.
                    </TableCell>
                  </TableRow>
                ) : (
                  safeProducts.map((p: any) => {
                    const imgCount = getCount(p.images);
                    const cmtCount = getCount(p.comments);
                    const qaCount = getCount(p.questions);
                    const expandedRow = !!expanded[p.id];

                    return (
                      <>
                        <TableRow
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={(e) => {
                            // کلیک روی سلول‌های قابل توقف، ناوبری نکند
                            const stopper = (e.target as HTMLElement).closest('[data-stop]');
                            if (stopper) return;
                            nav(`/dashboard/products/${p.id}`, { state: { name: p.name } });
                          }}
                        >
                          <TableCell data-stop width={56}>
                            <IconButton size="small" onClick={() => toggleExpand(p.id)}>
                              {expandedRow ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                            </IconButton>
                          </TableCell>

                          <TableCell data-stop width={56}>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedProduct({
                                  id: p.id,
                                  name: p.name ?? '',
                                  description: p.description ?? '',
                                  price: p.price ?? 0,
                                  categoryId: p.categoryId ?? null,
                                  isPublish: p.isPublish ?? true,
                                });

                                setOpenEditDialog(true);
                              }}
                              title="ویرایش"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </TableCell>

                          <TableCell sx={{ maxWidth: 240 }}>
                            <Tooltip title={p.name || ''}>
                              <Typography noWrap fontWeight={600}>
                                {p.name ?? '—'}
                              </Typography>
                            </Tooltip>
                            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                              <Chip
                                size="small"
                                variant={p.isPublish ? 'filled' : 'outlined'}
                                color={p.isPublish ? 'success' : 'default'}
                                label={p.isPublish ? 'منتشر' : 'پیش‌نویس'}
                              />
                              {p.isRemoved && (
                                <Chip
                                  size="small"
                                  color="warning"
                                  variant="outlined"
                                  label="حذف‌شده"
                                />
                              )}
                            </Stack>
                          </TableCell>

                          <TableCell sx={{ minWidth: 260, maxWidth: 360 }}>
                            {p.description ? (
                              <Tooltip title={p.description}>
                                <Typography variant="body2" sx={clamp2Lines}>
                                  {p.description}
                                </Typography>
                              </Tooltip>
                            ) : (
                              '—'
                            )}
                          </TableCell>

                          <TableCell sx={{ width: 120 }}>
                            {isPrimitive(p.price) ? toFaDigits(p.price) : '—'}
                          </TableCell>

                          <TableCell sx={{ width: 100 }}>{p.isPublish ? 'بله' : 'خیر'}</TableCell>

                          <TableCell sx={{ minWidth: 120 }}>
                            <Tooltip
                              title={
                                isPrimitive(p.category)
                                  ? String(p.category ?? p.categoryId ?? '—')
                                  : (p.category?.name ?? p.category?.title ?? p.category?.id ?? '—')
                              }
                            >
                              <Typography noWrap>
                                {renderCategory(p.category, p.categoryId)}
                              </Typography>
                            </Tooltip>
                          </TableCell>

                          <TableCell sx={{ width: 140 }}>
                            <Typography variant="body2">{formatFaDate(p.inserTime)}</Typography>
                          </TableCell>

                          <TableCell sx={{ width: 140 }}>
                            <Typography variant="body2">
                              {p.lastUpdate ? formatFaDate(p.lastUpdate) : '—'}
                            </Typography>
                          </TableCell>

                          <TableCell data-stop align="center" width={72}>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => {
                                if (confirm('محصول حذف شود؟')) handleDelete(p.id);
                              }}
                              title="حذف محصول"
                            >
                              <DeleteOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>

                        {/* جزئیات جمع‌شونده */}
                        <TableRow>
                          <TableCell colSpan={10} sx={{ p: 0, bgcolor: 'background.default' }}>
                            <Collapse in={expandedRow} timeout="auto" unmountOnExit>
                              <Box sx={{ px: 2.5, pt: 1.5, pb: 2 }}>
                                <Grid container spacing={2}>
                                  <Grid item xs={12} md={6}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <Typography variant="body2" color="text.secondary">
                                        GUID:
                                      </Typography>
                                      <Tooltip title={p.guid ?? '—'}>
                                        <Typography variant="body2" sx={{ maxWidth: 360 }} noWrap>
                                          {isPrimitive(p.guid) ? p.guid || '—' : '—'}
                                        </Typography>
                                      </Tooltip>
                                    </Stack>
                                  </Grid>
                                  <Grid item xs={12} md={6}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <Typography variant="body2" color="text.secondary">
                                        واحد پول:
                                      </Typography>
                                      <Typography variant="body2">{currency ?? 'IRT'}</Typography>
                                    </Stack>
                                  </Grid>

                                  <Grid item xs={12}>
                                    <Divider sx={{ my: 0.5 }} />
                                  </Grid>

                                  <Grid item xs={12} md={4}>
                                    <Chip
                                      icon={<PhotoLibraryOutlinedIcon />}
                                      label={`تصاویر: ${toFaDigits(imgCount)}`}
                                      variant="outlined"
                                      size="small"
                                    />
                                  </Grid>
                                  <Grid item xs={12} md={4}>
                                    <Chip
                                      icon={<CommentOutlinedIcon />}
                                      label={`نظرات: ${toFaDigits(cmtCount)}`}
                                      variant="outlined"
                                      size="small"
                                    />
                                  </Grid>
                                  <Grid item xs={12} md={4}>
                                    <Chip
                                      icon={<QuestionAnswerOutlinedIcon />}
                                      label={`سوالات: ${toFaDigits(qaCount)}`}
                                      variant="outlined"
                                      size="small"
                                    />
                                  </Grid>
                                </Grid>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
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
