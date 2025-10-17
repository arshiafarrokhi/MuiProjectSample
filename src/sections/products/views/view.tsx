import type { Theme, SxProps } from '@mui/material/styles';

import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { varAlpha } from 'minimal-shared/utils';
import { useMemo, useState, Fragment } from 'react';

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
  Tab,
  Chip,
  Grid,
  Tabs,
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
  TextField,
  Select,
  MenuItem,
  TablePagination,
} from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';

import { removeProduct } from '../api/productsApi';
import AddProductDialog from '../components/AddProductDialog';
import EditProductDialog from '../components/EditProductDialog';
// NEW: data hook & types
import { useGetProducts, type ProductListFilters } from '../api/productsApi';
import { GetCategoriesApi } from '../api/categoriesApi';

export type Props = {
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


export function formatPrice(price: any): string {
  return new Intl.NumberFormat('fa-IR').format(price);
}

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
export function ProductsView({
  sx,
  products: productsProp,
  currency: currencyProp,
  onRefetch,
}: Props) {
  const nav = useNavigate();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [tab, setTab] = useState<number>(0); // 0: فعال، 1: حذف‌شده

  // ---------- Filters (فقط وقتی از prop داده نشده باشد) ----------
  const controlled = Array.isArray(productsProp); // اگر از بیرون محصول می‌آید، UI فیلتر نشان نده
  const [filters, setFilters] = useState<ProductListFilters>({
    pageIndex: 0,
    pageSize: 20,
    filter: '',
    categoryId: undefined,
  });
  const [applied, setApplied] = useState<ProductListFilters>(filters);

  const {
    products: fetchedProducts,
    currency: currencyHook,
    pagination,
    pageCount,
    productsLoading,
    refetchProducts,
  } = useGetProducts(applied);
  const { categories, categoriesLoading } = GetCategoriesApi();
  const categoryMap = useMemo(() => {
    const map = new Map<number, string>();
    (categories ?? []).forEach((cat) => {
      map.set(cat.id, cat.name ?? `#${cat.id}`);
    });
    return map;
  }, [categories]);

  const effectiveProducts = controlled ? (productsProp ?? []) : (fetchedProducts ?? []);
  const effectiveCurrency = controlled ? (currencyProp ?? 'IRT') : (currencyHook ?? 'IRT');

  // مرتب‌سازی از جدید به قدیم
  const safeProducts = useMemo(() => {
    if (!Array.isArray(effectiveProducts)) return [];
    return [...effectiveProducts].sort((a, b) => {
      const dateA = new Date(a.inserTime).getTime();
      const dateB = new Date(b.inserTime).getTime();
      return dateB - dateA;
    });
  }, [effectiveProducts]);

  const activeProducts = useMemo(() => safeProducts.filter((p) => !p?.isRemoved), [safeProducts]);
  const removedProducts = useMemo(() => safeProducts.filter((p) => !!p?.isRemoved), [safeProducts]);

  const handleDelete = async (productId: string) => {
    try {
      const res = await removeProduct(productId);
      const ok = res?.success ?? true;
      const msg = res?.message || (ok ? 'محصول حذف شد.' : 'حذف محصول ناموفق بود.');
      if (ok) {
        toast.success(msg);
        if (controlled) onRefetch?.();
        else refetchProducts?.();
      } else {
        toast.error(msg);
      }
    } catch (e: any) {
      toast.error(e?.message || 'خطا در حذف محصول');
    }
  };

  const toggleExpand = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const renderTable = (rows: any[]) => (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer
        sx={{
          width: '100%',
          overflowY: 'auto',
          overflowX: 'auto',
          maxHeight: {
            xs: 'calc(100dvh - 360px)',
            sm: 'calc(100dvh - 380px)',
            md: 'calc(100dvh - 420px)',
            lg: 'calc(100dvh - 460px)',
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
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                  {productsLoading ? 'در حال بارگذاری...' : 'محصولی یافت نشد.'}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((p: any) => {
                const imgCount = getCount(p.images);
                const cmtCount = getCount(p.comments);
                const qaCount = getCount(p.questions);
                const expandedRow = !!expanded[p.id];

                return (
                  <Fragment key={p.id}>
                    <TableRow
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={(e) => {
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
                            <Chip size="small" color="warning" variant="outlined" label="حذف‌شده" />
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
                        {isPrimitive(p.price) ? `${formatPrice(p.price)} تومان` : '—'}
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
                          <Typography noWrap>{renderCategory(p.category, p.categoryId)}</Typography>
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
                                  <Typography variant="body2">
                                    {effectiveCurrency ?? 'IRT'}
                                  </Typography>
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
                  </Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination فقط وقتی کنترل داخل صفحه است */}
      {!controlled && (
        <Box sx={{ px: 1, py: 0.5 }}>
          <TablePagination
            component="div"
            count={pagination?.totalRow ?? 0}
            page={pagination?.pageIndex ?? applied.pageIndex ?? 0}
            onPageChange={(_, newPage) => {
              setApplied((p) => ({ ...p, pageIndex: newPage }));
            }}
            rowsPerPage={pagination?.pagesize ?? applied.pageSize ?? 20}
            onRowsPerPageChange={(e) => {
              const newSize = Number(e.target.value);
              setApplied((p) => ({ ...p, pageSize: newSize, pageIndex: 0 }));
            }}
            rowsPerPageOptions={[10, 20, 50, 100]}
            labelRowsPerPage="تعداد در صفحه"
            labelDisplayedRows={({ from, to, count }) =>
              `${toFaDigits(from)}–${toFaDigits(to)} از ${toFaDigits(count)}`
            }
          />
        </Box>
      )}
    </Paper>
  );

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
          sx={{ mb: 1 }}
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
              واحد پول: {effectiveCurrency || 'IRT'}
            </Typography>
          </Stack>
        </Stack>

        {/* نوار فیلترها (فقط وقتی محصولات از prop نیامده) */}
        {!controlled && (
          <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
              <TextField
                size="small"
                label="جستجو"
                value={filters.filter ?? ''}
                onChange={(e) => setFilters((p) => ({ ...p, filter: e.target.value }))}
                sx={{ minWidth: { xs: 1, sm: 280 } }}
              />

              <Select
                size="small"
                value={
                  typeof filters.categoryId === 'number' ? String(filters.categoryId) : ''
                }
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters((prev) => ({
                    ...prev,
                    categoryId: value === '' ? undefined : Number(value),
                  }));
                }}
                sx={{ minWidth: { xs: 1, sm: 200 } }}
                displayEmpty
                disabled={categoriesLoading}
                renderValue={(selected) => {
                  if (selected === '') return 'انتخاب دسته';
                  const id = Number(selected);
                  return categoryMap.get(id) ?? `شناسه ${id}`;
                }}
              >
                <MenuItem value="">
                  <em>همه دسته‌ها</em>
                </MenuItem>
                {(categories ?? []).map((cat) => (
                  <MenuItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>

              <Select
                size="small"
                value={String(filters.pageSize ?? 20)}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, pageSize: Number(e.target.value), pageIndex: 0 }))
                }
                sx={{ minWidth: { xs: 1, sm: 140 } }}
                displayEmpty
              >
                {[10, 20, 50, 100].map((n) => (
                  <MenuItem key={n} value={String(n)}>
                    {n}
                  </MenuItem>
                ))}
              </Select>

              <Box sx={{ flex: 1 }} />

              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setFilters({ pageIndex: 0, pageSize: 20, filter: '', categoryId: undefined });
                  }}
                >
                  ریست
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    setApplied({
                      pageIndex: 0,
                      pageSize: filters.pageSize ?? 20,
                      filter: filters.filter?.trim() || undefined,
                      categoryId: filters.categoryId,
                    });
                  }}
                >
                  اعمال فیلتر
                </Button>
                <Button
                  variant="text"
                  onClick={() => refetchProducts?.()}
                  disabled={!!productsLoading}
                >
                  تازه‌سازی
                </Button>
              </Stack>
            </Stack>

            {/* خلاصه فیلترهای فعال */}
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
              {(applied.filter ?? '').length > 0 && (
                <Chip
                  label={`فیلتر: ${applied.filter}`}
                  onDelete={() => setApplied((p) => ({ ...p, filter: undefined, pageIndex: 0 }))}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {typeof applied.categoryId === 'number' && (
                <Chip
                  label={`دسته: ${categoryMap.get(applied.categoryId) ?? applied.categoryId}`}
                  onDelete={() =>
                    setApplied((p) => ({ ...p, categoryId: undefined, pageIndex: 0 }))
                  }
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {!!applied.pageSize && (
                <Chip label={`PageSize: ${applied.pageSize}`} size="small" variant="outlined" />
              )}
              <Chip
                label={`PageIndex: ${toFaDigits(applied.pageIndex ?? 0)} / ${toFaDigits((pageCount ?? 1) - 1)}`}
                size="small"
                variant="outlined"
              />
            </Stack>
          </Paper>
        )}

        {/* Tabs: Active / Removed */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }} aria-label="product tabs">
          <Tab
            label={`فعال (${toFaDigits(activeProducts.length)})`}
            id="products-tab-0"
            aria-controls="products-panel-0"
          />
          <Tab
            label={`حذف‌شده (${toFaDigits(removedProducts.length)})`}
            id="products-tab-1"
            aria-controls="products-panel-1"
          />
        </Tabs>

        <Box
          role="tabpanel"
          id="products-panel-0"
          aria-labelledby="products-tab-0"
          hidden={tab !== 0}
        >
          {tab === 0 && renderTable(activeProducts)}
        </Box>

        <Box
          role="tabpanel"
          id="products-panel-1"
          aria-labelledby="products-tab-1"
          hidden={tab !== 1}
        >
          {tab === 1 && renderTable(removedProducts)}
        </Box>
      </Box>

      <AddProductDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        onCreated={() => {
          if (controlled) onRefetch?.();
          else refetchProducts?.();
        }}
      />

      <EditProductDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        product={selectedProduct}
        onUpdated={() => {
          if (controlled) onRefetch?.();
          else refetchProducts?.();
        }}
      />
    </DashboardContent>
  );
}
