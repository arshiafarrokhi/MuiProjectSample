import { toast } from 'sonner';
import { useMemo, useState } from 'react';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import {
  Box,
  Paper,
  Stack,
  Table,
  Button,
  Select,
  Dialog,
  TableRow,
  MenuItem,
  TableHead,
  TableBody,
  TableCell,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  CircularProgress,
  TextField,
  TablePagination,
} from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';

import { getMessage, useGetMessages, type GetMessagesFilters } from '../api/messagesApi';

function toFa(n?: number | string | null) {
  if (n === null || typeof n === 'undefined') return '—';
  return String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);
}

export default function MessagesView() {
  // ---------- filters state ----------
  const [filters, setFilters] = useState<GetMessagesFilters>({
    pageIndex: 0,
    pageSize: 20,
    filter: '', // Pagination.Filter
    phone: '', // Phone
    insertTime: '', // InsertTime (yyyy-MM-dd)
    seen: undefined, // Seen (اختیاری)
  });
  const [applied, setApplied] = useState<GetMessagesFilters>(filters);

  const { messages, paging, pageCount, messagesLoading, refetchMessages } = useGetMessages(applied);

  // detail modal state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [details, setDetails] = useState<any | null>(null);

  const rows = useMemo(() => {
    if (!Array.isArray(messages)) return [];
    // مرتب‌سازی نزولی براساس insertTime
    return [...messages].sort((a: any, b: any) => {
      const ta = a?.insertTime ? new Date(a.insertTime).getTime() : 0;
      const tb = b?.insertTime ? new Date(b.insertTime).getTime() : 0;
      return tb - ta;
    });
  }, [messages]);

  const openMessage = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();

    setSelectedId(id);
    setDetailsOpen(true);
    setDetails(null);
    setDetailsLoading(true);

    try {
      const res = await getMessage(id);
      const msg = res?.result?.message;
      setDetails(msg ?? null);
    } catch (err: any) {
      toast.error(err?.message || 'خطا در دریافت جزئیات پیام');
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4">پیام‌ها</Typography>

      <Box sx={{ p: 3, mt: 5 }}>
        {/* Filters bar */}
        <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            sx={{ display: 'flex', flexWrap: 'wrap' }}
            spacing={1.5}
            alignItems="center"
          >
            <TextField
              size="small"
              label="جستجو (Pagination.Filter)"
              value={filters.filter ?? ''}
              onChange={(e) => setFilters((p) => ({ ...p, filter: e.target.value }))}
              sx={{ minWidth: { xs: 1, sm: 260 } }}
            />

            <TextField
              size="small"
              label="Phone"
              value={filters.phone ?? ''}
              onChange={(e) => setFilters((p) => ({ ...p, phone: e.target.value }))}
              sx={{ minWidth: { xs: 1, sm: 180 } }}
            />

            <TextField
              size="small"
              label="InsertTime (yyyy-MM-dd)"
              type="date"
              value={filters.insertTime ?? ''}
              onChange={(e) => setFilters((p) => ({ ...p, insertTime: e.target.value }))}
              sx={{ minWidth: { xs: 1, sm: 200 } }}
              InputLabelProps={{ shrink: true }}
            />

            {/* Seen: اختیاری اگر بخوای حفظ کن */}
            <Select
              size="small"
              value={String(filters.seen)}
              onChange={(e) => {
                const v = e.target.value;
                setFilters((p) => ({
                  ...p,
                  seen: v === 'true' ? true : v === 'false' ? false : undefined,
                }));
              }}
              sx={{ minWidth: { xs: 1, sm: 160 } }}
              displayEmpty
            >
              <MenuItem value="undefined">همه</MenuItem>
              <MenuItem value="false">دیده‌نشده</MenuItem>
              <MenuItem value="true">دیده‌شده</MenuItem>
            </Select>

            <Select
              size="small"
              value={String(filters.pageSize ?? 20)}
              onChange={(e) =>
                setFilters((p) => ({ ...p, pageSize: Number(e.target.value), pageIndex: 0 }))
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
                    pageIndex: 0,
                    pageSize: 20,
                    filter: '',
                    phone: '',
                    insertTime: '',
                    seen: undefined,
                  })
                }
              >
                ریست
              </Button>
              <Button
                variant="contained"
                onClick={() =>
                  setApplied({
                    pageIndex: 0,
                    pageSize: filters.pageSize ?? 20,
                    filter: filters.filter?.trim() || undefined,
                    phone: filters.phone?.trim() || undefined,
                    insertTime: filters.insertTime || undefined,
                    seen: filters.seen,
                  })
                }
              >
                اعمال فیلتر
              </Button>
              <Button
                variant="text"
                onClick={() => refetchMessages?.()}
                disabled={!!messagesLoading}
              >
                تازه‌سازی
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: { xs: '60vh', md: '70vh' } }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>نام</TableCell>
                  <TableCell>موبایل</TableCell>
                  <TableCell>وضعیت</TableCell>
                  <TableCell>تاریخ</TableCell>
                  <TableCell align="center">جزئیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {messagesLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={20} />
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      موردی یافت نشد.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((m: any, idx: number) => (
                    <TableRow hover key={m.id}>
                      <TableCell>{toFa(idx + 1)}</TableCell>
                      <TableCell>{m.fullName ?? '—'}</TableCell>
                      <TableCell>{m.phone ?? '—'}</TableCell>
                      <TableCell>{m.seen ? 'دیده‌شده' : 'دیده‌نشده'}</TableCell>
                      <TableCell>
                        {m.insertTime ? new Date(m.insertTime).toLocaleString('fa-IR') : '—'}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          type="button"
                          onClick={(e) => openMessage(e, m.id)}
                          aria-label="جزئیات"
                        >
                          <VisibilityRoundedIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ px: 1, py: 0.5 }}>
            <TablePagination
              component="div"
              count={paging?.totalRow ?? 0}
              page={paging?.pageIndex ?? applied.pageIndex ?? 0}
              onPageChange={(_, newPage) => setApplied((p) => ({ ...p, pageIndex: newPage }))}
              rowsPerPage={paging?.pageSize ?? applied.pageSize ?? 20}
              onRowsPerPageChange={(e) => {
                const newSize = Number(e.target.value);
                setApplied((p) => ({ ...p, pageSize: newSize, pageIndex: 0 }));
              }}
              rowsPerPageOptions={[10, 20, 50, 100]}
              labelRowsPerPage="تعداد در صفحه"
              labelDisplayedRows={({ from, to, count }) =>
                `${toFa(from)}–${toFa(to)} از ${toFa(count)}`
              }
            />
          </Box>
        </Paper>
      </Box>

      {/* Details Modal */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="subtitle1" fontWeight={700}>
            جزئیات پیام {selectedId ? `#${toFa(selectedId)}` : ''}
          </Typography>
          <IconButton type="button" onClick={() => setDetailsOpen(false)}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {detailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4, flexWrap: 'wrap' }}>
              <CircularProgress size={22} />
            </Box>
          ) : !details ? (
            <Typography color="text.secondary">چیزی برای نمایش نیست.</Typography>
          ) : (
            <Stack spacing={1}>
              <Typography>نام: {details.fullName ?? '—'}</Typography>
              <Typography>موبایل: {details.phone ?? '—'}</Typography>
              <Typography>وضعیت: {details.seen ? 'دیده‌شده' : 'دیده‌نشده'}</Typography>
              <Typography>
                تاریخ:{' '}
                {details.insertTime ? new Date(details.insertTime).toLocaleString('fa-IR') : '—'}
              </Typography>
              <Typography sx={{ mt: 1.5 }}>
                متن پیام:
                <br />
                {details.message ?? '—'}
              </Typography>
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button type="button" onClick={() => setDetailsOpen(false)} variant="outlined">
            بستن
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
