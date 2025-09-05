import { useMemo } from 'react';
import {
  Box,
  Paper,
  Stack,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Typography,
  CircularProgress,
  Chip,
} from '@mui/material';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { useGetLoginLogs } from '../api/adminApi';

function toFa(n?: number | string | null) {
  if (n === null || typeof n === 'undefined') return '—';
  return String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);
}

export default function AdminLoginLogsTab() {
  const { logs, logsLoading, refetchLogs } = useGetLoginLogs();

  const rows = useMemo(() => {
    if (!Array.isArray(logs)) return [];
    return [...logs].sort((a: any, b: any) => {
      const ta = a?.date ? new Date(a.date).getTime() : 0;
      const tb = b?.date ? new Date(b.date).getTime() : 0;
      return tb - ta; // جدیدترها بالا
    });
  }, [logs]);

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          لاگ‌های ورود ادمین‌ها
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Button
          onClick={() => refetchLogs && refetchLogs()}
          startIcon={<RefreshRoundedIcon />}
          variant="outlined"
          size="small"
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
                <TableCell>نام ادمین</TableCell>
                <TableCell>شناسه ادمین</TableCell>
                <TableCell>دستگاه / مرورگر</TableCell>
                <TableCell>نتیجه</TableCell>
                <TableCell>تاریخ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logsLoading ? (
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
                rows.map((r: any, idx: number) => (
                  <TableRow key={`${r.adminId}-${r.date}-${idx}`}>
                    <TableCell>{toFa(idx + 1)}</TableCell>
                    <TableCell>{r.adminName ?? '—'}</TableCell>
                    <TableCell sx={{ direction: 'ltr' }}>{r.adminId ?? '—'}</TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 600,
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                      }}
                    >
                      {r.device ?? '—'}
                    </TableCell>
                    <TableCell>
                      {r.state ? (
                        <Chip size="small" color="success" label="موفق" />
                      ) : (
                        <Chip size="small" color="error" label="ناموفق" />
                      )}
                    </TableCell>
                    <TableCell>{r.date ? new Date(r.date).toLocaleString('fa-IR') : '—'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
