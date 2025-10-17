import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import React, { useMemo, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import {
  Box,
  Tab,
  Tabs,
  Table,
  Paper,
  Stack,
  Button,
  Switch,
  TableRow,
  MenuItem,
  TableHead,
  TableBody,
  TableCell,
  TextField,
  Typography,
  IconButton,
  TableContainer,
  TablePagination,
  FormControlLabel,
} from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';

import AddProductSimDialog from '../components/AddProductSimDialog';
import EditProductSimDialog from '../components/EditProductSimDialog';
import ProductSimActivityTab from '../components/ProductSimActivityTab';
import {
  useGetCountries,
  useGetOperators,
  removeProductSim,
  GetProductSimsApi,
} from '../api/productSimApi';

type Props = { sx?: any; onRefetch?: () => void };

// Safe getters
const getId = (r: any) => r?.id ?? r?.productId ?? r?.guid ?? r?.Id;
const getInsertTs = (r: any) =>
  r?.insertTime ? new Date(r.insertTime).getTime() : typeof getId(r) === 'number' ? getId(r) : 0;

// Persian→Latin (project rule)
const toEnglishDigits = (input: string) => {
  const fa = '۰۱۲۳۴۵۶۷۸۹';
  const ar = '٠١٢٣٤٥٦٧٨٩';
  return (input ?? '').replace(/[۰-۹٠-٩]/g, (d) => {
    const faIdx = fa.indexOf(d);
    if (faIdx > -1) return String(faIdx);
    const arIdx = ar.indexOf(d);
    if (arIdx > -1) return String(arIdx);
    return d;
  });
};

export function ProductSimView({ sx, onRefetch }: Props) {
  const nav = useNavigate();

  // --- tabs ---
  const [tab, setTab] = useState(0);

  // --- server-side pagination (MUI 0-based; backend 1-based) ---
  const [page, setPage] = useState(0); // page 0 => send 1
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // --- filters (UI vs applied) ---
  type Filters = {
    filter?: string;
    operatorId?: number;
    countryId?: number;
    isRemoved?: boolean;
    internet?: boolean;
    daysFilter?: number;
  };

  const [filters, setFilters] = useState<Filters>({
    filter: '',
    operatorId: undefined,
    countryId: undefined,
    isRemoved: false,
    internet: undefined,
    daysFilter: undefined,
  });
  const [applied, setApplied] = useState<Filters>({ ...filters });

  // Fetch lookup lists
  const { countries } = useGetCountries(); // all countries
  const { operators } = useGetOperators(filters.countryId); // depends on selected country

  // Just-created overlay for page 1
  const [justCreated, setJustCreated] = useState<any | null>(null);

  // Fetch list with current pagination + applied filters
  const { productSims, productSimsLoading, refetchProductSims, pagination } = GetProductSimsApi(
    page + 1,
    rowsPerPage,
    applied
  );

  // Sort new -> old on FRONT; if we're on page 0 and have a newly created item,
  // optimistically prepend it and de-duplicate, then clamp length to rowsPerPage.
  const rows = useMemo(() => {
    const base = Array.isArray(productSims) ? [...productSims] : [];
    base.sort((a, b) => getInsertTs(b) - getInsertTs(a));

    if (page === 0 && justCreated) {
      const jcId = getId(justCreated);
      const merged = [justCreated, ...base.filter((x) => getId(x) !== jcId)];
      return merged.slice(0, rowsPerPage);
    }
    return base;
  }, [productSims, page, rowsPerPage, justCreated]);

  const handleDelete = async (id: string) => {
    if (!confirm('محصول حذف شود؟')) return;
    try {
      const res = await removeProductSim(id);
      await refetchProductSims();
      const ok = res?.success ?? true;
      const msg = res?.message || (ok ? 'محصول حذف شد.' : 'حذف ناموفق بود.');
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      ok ? toast.success(msg) : toast.error(msg);
      if (justCreated && String(getId(justCreated)) === String(id)) setJustCreated(null);
    } catch (e: any) {
      toast.error(e?.message || 'خطا در حذف');
    }
  };

  // --- dialogs ---
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // --- pagination handlers ---
  // const handleChangePage = (_: unknown, nextPage: number) => {
  //   setPage(nextPage);
  // };

  // const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const newSize = parseInt(e.target.value, 10);
  //   setRowsPerPage(newSize);
  //   setPage(0);
  // };

  // --- filter handlers ---
  const applyFilters = () => {
    setApplied({
      filter: (filters.filter ?? '').trim(),
      operatorId: filters.operatorId,
      countryId: filters.countryId,
      isRemoved: filters.isRemoved,
      internet: filters.internet,
      daysFilter: typeof filters.daysFilter === 'number' ? filters.daysFilter : undefined,
    });
    setPage(0);
  };

  const resetFilters = () => {
    const next: Filters = {
      filter: '',
      operatorId: undefined,
      countryId: undefined,
      isRemoved: false,
      internet: undefined,
      daysFilter: undefined,
    };
    setFilters(next);
    setApplied(next);
    setPage(0);
  };

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
            {/* Filters Bar */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
              sx={{ mb: 2 }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flex={1}>
                <TextField
                  label="جستجو"
                  placeholder="نام/توضیح/..."
                  value={filters.filter ?? ''}
                  onChange={(e) => setFilters((p) => ({ ...p, filter: e.target.value }))}
                  fullWidth
                />

                <TextField
                  select
                  label="کشور"
                  value={typeof filters.countryId === 'number' ? filters.countryId : ''} // number or ''
                  onChange={(e) => {
                    const v = e.target.value === '' ? undefined : Number(e.target.value);
                    setFilters((p) => ({ ...p, countryId: v, operatorId: undefined })); // reset operator when country changes
                  }}
                  sx={{ minWidth: 160 }}
                  SelectProps={{
                    displayEmpty: true,
                    MenuProps: { disablePortal: false }, // usually fine; remove if not needed
                  }}
                >
                  <MenuItem value="">همه</MenuItem>
                  {countries?.map((c: any) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="اپراتور"
                  value={typeof filters.operatorId === 'number' ? filters.operatorId : ''} // number or ''
                  onChange={(e) => {
                    const v = e.target.value === '' ? undefined : Number(e.target.value);
                    setFilters((p) => ({ ...p, operatorId: v }));
                  }}
                  sx={{ minWidth: 160 }}
                  disabled={!filters.countryId}
                  SelectProps={{
                    displayEmpty: true,
                    MenuProps: { disablePortal: false },
                  }}
                >
                  <MenuItem value="">همه</MenuItem>
                  {operators?.map((op: any) => (
                    <MenuItem key={op.id} value={op.id}>
                      {op.name}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="DaysFilter"
                  type="number"
                  value={filters.daysFilter ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFilters((p) => ({
                      ...p,
                      daysFilter: v === '' ? undefined : Number(toEnglishDigits(v)),
                    }));
                  }}
                  sx={{ width: 140 }}
                />
              </Stack>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!filters.internet}
                      onChange={(e) =>
                        setFilters((p) => ({ ...p, internet: e.target.checked || undefined }))
                      }
                    />
                  }
                  label="صرفاً اینترنت"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!filters.isRemoved}
                      onChange={(e) =>
                        setFilters((p) => ({ ...p, isRemoved: e.target.checked || undefined }))
                      }
                    />
                  }
                  label="نمایش حذف‌شده‌ها"
                />

                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" onClick={resetFilters}>
                    ریست
                  </Button>
                  <Button variant="contained" onClick={applyFilters}>
                    اعمال فیلتر
                  </Button>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => setOpenAdd(true)}
                    variant="contained"
                  >
                    افزودن محصول
                  </Button>
                </Stack>
              </Stack>
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
                          key={getId(r)}
                          hover
                          onDoubleClick={() =>
                            nav(`/dashboard/productSim/${getId(r)}`, { state: { name: r.name } })
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
                                  setSelectedId(String(getId(r)));
                                  setOpenEdit(true);
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>

                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(String(getId(r)))}
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

              {/* Server-side pagination */}
              <TablePagination
                component="div"
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  const newSize = parseInt(e.target.value, 10);
                  setRowsPerPage(newSize);
                  setPage(0);
                }}
                rowsPerPageOptions={[10, 25, 50]}
                count={typeof pagination?.totalRow === 'number' ? pagination.totalRow : 0}
                labelRowsPerPage="ردیف در صفحه"
              />
            </Paper>

            <AddProductSimDialog
              open={openAdd}
              onClose={() => setOpenAdd(false)}
              onCreated={async (created?: any) => {
                // Always jump to first page
                setPage(0);

                // If backend returns the created item, optimistically show it on top of page 1
                if (created && getId(created)) {
                  if (!created.insertTime) {
                    created = { ...created, insertTime: new Date().toISOString() };
                  }
                  setJustCreated(created);
                } else {
                  setJustCreated(null);
                }

                await refetchProductSims();
              }}
            />

            <EditProductSimDialog
              open={openEdit}
              productId={selectedId}
              onClose={() => setOpenEdit(false)}
              onUpdated={async () => {
                await refetchProductSims();
              }}
            />
          </>
        )}

        {tab === 1 && <ProductSimActivityTab />}
      </Box>
    </DashboardContent>
  );
}
