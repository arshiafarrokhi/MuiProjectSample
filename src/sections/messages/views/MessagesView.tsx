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
} from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';

import { getMessage, useGetMessages } from '../api/messagesApi';

function toFa(n?: number | string | null) {
  if (n === null || typeof n === 'undefined') return '—';
  return String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);
}

export default function MessagesView() {
  // Seen filter
  const [seen, setSeen] = useState<boolean | undefined>(undefined);
  const { messages, messagesLoading, refetchMessages } = useGetMessages(seen);

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
    // نکته‌ی اصلی: جلو هر نوع ناوبری/submit گرفته می‌شود
    e.preventDefault();
    e.stopPropagation();

    setSelectedId(id);
    setDetailsOpen(true); // اول باز کن
    setDetails(null);
    setDetailsLoading(true);

    try {
      const res = await getMessage(id); // API جزئیات (و Seen=true می‌شود)
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
        {/* فیلتر بالای لیست - بدون form  */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            فیلتر وضعیت مشاهده
          </Typography>

          <Select
            size="small"
            value={String(seen)}
            onChange={(e) => {
              const v = e.target.value;
              setSeen(v === 'true' ? true : v === 'false' ? false : undefined);
            }}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="undefined">همه</MenuItem>
            <MenuItem value="false">دیده‌نشده</MenuItem>
            <MenuItem value="true">دیده‌شده</MenuItem>
          </Select>

          <Box sx={{ flex: 1 }} />

          <Button
            type="button" // مهم
            variant="outlined"
            onClick={() => refetchMessages && refetchMessages()}
          >
            تازه‌سازی
          </Button>
        </Stack>

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
                          type="button" // مهم
                          onClick={(e) => openMessage(e, m.id)} // مهم: e.preventDefault/stopPropagation داخلش زده میشه
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
        </Paper>
      </Box>

      {/* Details Modal */}
      <Dialog
        open={detailsOpen}
        onClose={(_, reason) => {
          // فقط با بستن دستی/کلیک کراس بسته شود (دلخواه)
          if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
            setDetailsOpen(false);
          } else {
            setDetailsOpen(false);
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
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
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
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
