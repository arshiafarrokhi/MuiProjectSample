import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { varAlpha } from 'minimal-shared/utils';
import React, { useMemo, useState } from 'react';

import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import {
  Box,
  Tab,
  Chip,
  Tabs,
  Paper,
  Stack,
  Table,
  Select,
  Button,
  Dialog,
  Switch,
  Tooltip,
  TableRow,
  MenuItem,
  TableHead,
  TableCell,
  TableBody,
  TextField,
  IconButton,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  TablePagination,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';

import {
  getCreditIncreaseRequest,
  type CreditIncreaseFilters,
  useGetCreditIncreaseRequests,
} from '../api/creditIncreaseApi';
import { formatPrice } from 'src/sections/products/views/view';

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

export default function CreditIncreaseRequestsView() {
  const nav = useNavigate();

  // Filters (uncontrolled page → خودش دیتا می‌گیرد)
  const [filters, setFilters] = useState<CreditIncreaseFilters>({
    pageIndex: 1,
    pageSize: 20,
    filter: '',
    accepted: undefined,
    isRemoved: undefined,
    userId: '',
    insertTime: '', // yyyy-MM-dd
  });
  const [applied, setApplied] = useState<CreditIncreaseFilters>(filters);

  const { requests, paging, pageCount, requestsLoading, refetchRequests } =
    useGetCreditIncreaseRequests(applied);

  const rows = useMemo(() => {
    const arr = Array.isArray(requests) ? [...requests] : [];
    return arr.sort((a: any, b: any) => {
      const ta = a?.insertTime ? new Date(a.insertTime).getTime() : 0;
      const tb = b?.insertTime ? new Date(b.insertTime).getTime() : 0;
      return tb - ta;
    });
  }, [requests]);

  // Details modal
  const [openDetail, setOpenDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<any | null>(null);

  const openDetails = async (id: string) => {
    setOpenDetail(true);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await getCreditIncreaseRequest(id);
      setDetail(res?.result ?? null);
    } catch (e: any) {
      toast.error(e?.message || 'خطا در دریافت جزئیات درخواست');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4">درخواست‌های افزایش اعتبار</Typography>

      <Box
        sx={[
          (theme) => ({
            p: 3,
            mt: 5,
            width: 1,
            border: `dashed 1px ${theme.vars?.palette?.divider ?? theme.palette.divider}`,
            bgcolor: varAlpha(theme.vars?.palette?.grey?.['500Channel'] ?? '0,0,0', 0.04),
          }),
        ]}
      >
        {/* Filters bar */}
        <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems="center"
            sx={{ flexWrap: 'wrap' }}
          >
            <TextField
              size="small"
              label="جستجو"
              value={filters.filter ?? ''}
              onChange={(e) => setFilters((p) => ({ ...p, filter: e.target.value }))}
              sx={{ minWidth: { xs: 1, sm: 260 } }}
            />

            <TextField
              size="small"
              label="UserId"
              value={filters.userId ?? ''}
              onChange={(e) => setFilters((p) => ({ ...p, userId: e.target.value }))}
              sx={{ minWidth: { xs: 1, sm: 260 } }}
            />

            <Stack direction="row" spacing={0.5} alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    color="primary"
                    checked={filters.accepted === true}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        accepted: e.target.checked,
                      }))
                    }
                  />
                }
                label={
                  typeof filters.accepted === 'boolean'
                    ? `تأیید شده: ${filters.accepted ? 'بله' : 'خیر'}`
                    : 'تأیید شده: همه'
                }
                sx={{ ml: 0 }}
              />
              <Button
                size="small"
                onClick={() => setFilters((prev) => ({ ...prev, accepted: undefined }))}
                disabled={typeof filters.accepted !== 'boolean'}
              >
                همه
              </Button>
            </Stack>

            <Stack direction="row" spacing={0.5} alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    color="primary"
                    checked={filters.isRemoved === true}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        isRemoved: e.target.checked,
                      }))
                    }
                  />
                }
                label={
                  typeof filters.isRemoved === 'boolean'
                    ? `حذف‌شده: ${filters.isRemoved ? 'بله' : 'خیر'}`
                    : 'حذف‌شده: همه'
                }
                sx={{ ml: 0 }}
              />
              <Button
                size="small"
                onClick={() => setFilters((prev) => ({ ...prev, isRemoved: undefined }))}
                disabled={typeof filters.isRemoved !== 'boolean'}
              >
                همه
              </Button>
            </Stack>

            <TextField
              size="small"
              type="date"
              label="InsertTime"
              InputLabelProps={{ shrink: true }}
              value={filters.insertTime ?? ''}
              onChange={(e) => setFilters((p) => ({ ...p, insertTime: e.target.value }))}
              sx={{ minWidth: { xs: 1, sm: 170 } }}
            />

            <Select
              size="small"
              value={String(filters.pageSize ?? 20)}
              onChange={(e) =>
                setFilters((p) => ({ ...p, pageSize: Number(e.target.value), pageIndex: 1 }))
              }
              sx={{ minWidth: { xs: 1, sm: 120 } }}
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
                onClick={() =>
                  setFilters({
                    pageIndex: 1,
                    pageSize: 20,
                    filter: '',
                    accepted: undefined,
                    isRemoved: undefined,
                    userId: '',
                    insertTime: '',
                  })
                }
              >
                ریست
              </Button>
              <Button
                variant="contained"
                onClick={() =>
                  setApplied({
                    pageIndex: 1,
                    pageSize: filters.pageSize ?? 20,
                    filter: filters.filter?.trim() || undefined,
                    accepted: filters.accepted,
                    isRemoved: filters.isRemoved,
                    userId: filters.userId?.trim() || undefined,
                    insertTime: filters.insertTime || undefined,
                  })
                }
              >
                اعمال فیلتر
              </Button>
              <Button
                variant="text"
                onClick={() => refetchRequests?.()}
                disabled={!!requestsLoading}
              >
                تازه‌سازی
              </Button>
            </Stack>
          </Stack>

          {/* Active chips */}
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
            {(applied.filter ?? '').length > 0 && (
              <Chip
                label={`فیلتر: ${applied.filter}`}
                onDelete={() => setApplied((p) => ({ ...p, filter: undefined, pageIndex: 1 }))}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {typeof applied.accepted === 'boolean' && (
              <Chip
                label={`تأیید شده: ${applied.accepted ? 'بله' : 'خیر'}`}
                onDelete={() => setApplied((p) => ({ ...p, accepted: undefined, pageIndex: 1 }))}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {typeof applied.isRemoved === 'boolean' && (
              <Chip
                label={`حذف‌شده: ${applied.isRemoved ? 'بله' : 'خیر'}`}
                onDelete={() => setApplied((p) => ({ ...p, isRemoved: undefined, pageIndex: 1 }))}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {(applied.userId ?? '').length > 0 && (
              <Chip
                label={`UserId: ${applied.userId}`}
                onDelete={() => setApplied((p) => ({ ...p, userId: undefined, pageIndex: 1 }))}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {(applied.insertTime ?? '').length > 0 && (
              <Chip
                label={`InsertTime: ${applied.insertTime}`}
                onDelete={() => setApplied((p) => ({ ...p, insertTime: undefined, pageIndex: 1 }))}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {!!applied.pageSize && (
              <Chip label={`PageSize: ${applied.pageSize}`} size="small" variant="outlined" />
            )}
            <Chip
              label={`PageIndex: ${toFaDigits(applied.pageIndex ?? 1)} / ${toFaDigits(pageCount - 1)}`}
              size="small"
              variant="outlined"
            />
          </Stack>
        </Paper>

        {/* Table */}
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: { xs: '60vh', md: '70vh' } }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>کاربر</TableCell>
                  <TableCell>موبایل</TableCell>
                  <TableCell>مبلغ</TableCell>
                  <TableCell>توضیح</TableCell>
                  <TableCell>تاریخ</TableCell>
                  <TableCell>حذف‌شده؟</TableCell>
                  <TableCell align="center">اقدامات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requestsLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={20} />
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                      موردی یافت نشد.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r: any, idx: number) => {
                    const userId = r?.user?.userId ?? '';
                    const amount = typeof r?.ammount === 'number' ? r.ammount : r?.amount;
                    return (
                      <TableRow hover key={r.id}>
                        <TableCell>{toFaDigits(idx + 1)}</TableCell>
                        <TableCell title={r?.user?.userFullName || ''}>
                          <Typography noWrap fontWeight={600}>
                            {r?.user?.userFullName ?? '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>{r?.user?.userPhone ?? '—'}</TableCell>
                        <TableCell>{formatPrice(amount ?? '—')} تومان</TableCell>
                        <TableCell sx={{ maxWidth: 280 }}>
                          <Tooltip title={r?.description || ''}>
                            <Typography noWrap>{r?.description ?? '—'}</Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{formatFaDate(r?.insertTime)}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            variant="outlined"
                            color={r?.isRemoved ? 'warning' : 'default'}
                            label={r?.isRemoved ? 'بله' : 'خیر'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="جزئیات">
                              <IconButton size="small" onClick={() => openDetails(r.id)}>
                                <VisibilityRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {userId && (
                              <Tooltip title="مشاهده کاربر">
                                <IconButton
                                  size="small"
                                  onClick={() => nav(`/dashboard/users/${userId}`)}
                                >
                                  <PersonRoundedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination (API 1-based → MUI 0-based) */}
          <Box sx={{ px: 1, py: 0.5 }}>
            <TablePagination
              component="div"
              count={paging?.totalRow ?? 0}
              page={(paging?.pageIndex ?? applied.pageIndex ?? 1) - 1}
              onPageChange={(_, newPage) => setApplied((p) => ({ ...p, pageIndex: newPage + 1 }))}
              rowsPerPage={paging?.pagesize ?? applied.pageSize ?? 20}
              onRowsPerPageChange={(e) => {
                const newSize = Number(e.target.value);
                setApplied((p) => ({ ...p, pageSize: newSize, pageIndex: 1 }));
              }}
              rowsPerPageOptions={[10, 20, 50, 100]}
              labelRowsPerPage="تعداد در صفحه"
              labelDisplayedRows={({ from, to, count }) =>
                `${toFaDigits(from)}–${toFaDigits(to)} از ${toFaDigits(count)}`
              }
            />
          </Box>
        </Paper>
      </Box>

      {/* Detail dialog */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="sm" fullWidth>
        <DialogTitle>جزئیات درخواست</DialogTitle>
        <DialogContent dividers>
          {detailLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={22} />
            </Box>
          ) : !detail ? (
            <Typography color="text.secondary">چیزی برای نمایش نیست.</Typography>
          ) : (
            <Stack spacing={1.2}>
              <Typography>شناسه: {detail.id ?? '—'}</Typography>
              <Typography>کاربر: {detail.user?.userFullName ?? '—'}</Typography>
              <Typography>موبایل: {detail.user?.userPhone ?? '—'}</Typography>
              <Typography>مبلغ: {toFaDigits(detail.ammount ?? detail.amount ?? '—')}</Typography>
              <Typography>
                تاریخ: {detail.insertTime ? formatFaDate(detail.insertTime) : '—'}
              </Typography>
              <Typography>حذف‌شده: {detail.isRemoved ? 'بله' : 'خیر'}</Typography>
              <Typography sx={{ mt: 1 }}>توضیح: {detail.description ?? '—'}</Typography>
              {detail.depositSlipImage && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    فیش واریز:
                  </Typography>
                  {/* اگر URL/دادهٔ نمایشی باشد */}
                  <img
                    src={detail.depositSlipImage}
                    alt="فیش واریز"
                    style={{ maxWidth: '100%', borderRadius: 8 }}
                  />
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          {detail?.user?.userId && (
            <Button
              variant="outlined"
              onClick={() =>
                window.open(
                  `${window.location.origin}/dashboard/users/${detail.user.userId}`,
                  '_blank'
                )
              }
            >
              باز کردن صفحه کاربر
            </Button>
          )}
          <Button variant="contained" onClick={() => setOpenDetail(false)}>
            بستن
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
