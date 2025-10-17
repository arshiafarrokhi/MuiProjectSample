import type { Theme, SxProps } from '@mui/material/styles';

import { toast } from 'sonner';
import { useMemo, useState } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import Typography from '@mui/material/Typography';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import {
  Paper,
  Stack,
  TextField,
  Select,
  MenuItem,
  Chip,
  TablePagination,
  IconButton,
  Tooltip,
} from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';

import AddAdminDialog from './components/AddAdminDialog';
import EditAdminDialog from './components/EditAdminDialog';
import ChangeAdminPassDialog from './components/ChangeAdminPassDialog';
import { useGetAdmins, type AdminListFilters } from './api/adminApi';

export type Props = {
  sx?: SxProps<Theme>;
  admins?: any[];
  onRefetch?: () => void;
};

const toFa = (n?: number | string | null) =>
  n == null ? '—' : String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

export function AdminsView({ sx, admins: adminsProp, onRefetch }: Props) {
  const [openAdd, setOpenAdd] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);
  const [passData, setPassData] = useState<any | null>(null);

  const controlled = Array.isArray(adminsProp); // اگر از بیرون بیاید، فیلتر داخلی پنهان می‌شود

  // ---------- Filters (فقط وقتی کنترل‌شده نیست) ----------
  const [filters, setFilters] = useState<AdminListFilters>({
    pageIndex: 0,
    pageSize: 20,
    filter: '',
  });
  const [applied, setApplied] = useState<AdminListFilters>(filters);

  const { admins, paging, pageCount, adminsLoading, refetchAdmins } = useGetAdmins(applied);

  const effectiveAdmins = controlled ? (adminsProp ?? []) : (admins ?? []);

  const safeAdmins = useMemo(() => {
    const arr = Array.isArray(effectiveAdmins) ? [...effectiveAdmins] : [];
    // sort by inserTime desc
    return arr.sort((a, b) => {
      const da = new Date(a?.inserTime ?? 0).getTime();
      const db = new Date(b?.inserTime ?? 0).getTime();
      return db - da;
    });
  }, [effectiveAdmins]);

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4">مدیریت ادمین</Typography>

      <Box
        sx={[
          (theme) => ({
            p: 3,
            mt: 5,
            width: 1,
            border: `dashed 1px ${theme.vars?.palette?.divider ?? theme.palette.divider}`,
            bgcolor: varAlpha(theme.vars?.palette?.grey?.['500Channel'] ?? '0,0,0', 0.04),
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
          <Button startIcon={<AddIcon />} onClick={() => setOpenAdd(true)} color="primary">
            افزودن ادمین
          </Button>
        </Box>

        {/* Filters bar (فقط وقتی غیرکنترل‌شده) */}
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
                  onClick={() => setFilters({ pageIndex: 0, pageSize: 20, filter: '' })}
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
                    })
                  }
                >
                  اعمال فیلتر
                </Button>
                <Button variant="text" onClick={() => refetchAdmins?.()} disabled={!!adminsLoading}>
                  تازه‌سازی
                </Button>
              </Stack>
            </Stack>

            {/* خلاصهٔ فیلترها */}
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
              {/* {!!applied.pageSize && (
                <Chip label={`PageSize: ${applied.pageSize}`} size="small" variant="outlined" />
              )}
              <Chip
                label={`PageIndex: ${toFa(applied.pageIndex ?? 0)} / ${toFa((pageCount ?? 1) - 1)}`}
                size="small"
                variant="outlined"
              /> */}
            </Stack>
          </Paper>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {safeAdmins.map((ad, idx) => {
            const accountId = ad?.accountId ?? ad?.id ?? ad?.guid ?? '';
            return (
              <Box
                key={`${accountId}-${idx}`}
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
                    bgcolor: varAlpha(theme.vars?.palette?.grey?.['500Channel'] ?? '0,0,0', 0.08),
                  }),
                  ...(Array.isArray(sx) ? sx : [sx]),
                ]}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 90 }}>
                  <img
                    src={ad.avatar}
                    alt={ad.fullname}
                    width={56}
                    height={56}
                    style={{ borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} noWrap>
                      {ad.fullname}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {ad.email} • {ad.phone}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      نقش: {ad.role} | ثبت:{' '}
                      {ad.inserTime ? new Date(ad.inserTime).toLocaleString('fa-IR') : '—'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Tooltip title="ویرایش ادمین">
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (!accountId) {
                          toast.error('شناسه ادمین یافت نشد.');
                          return;
                        }
                        setEditData({
                          accountId,
                          fullName: ad.fullname ?? '',
                          phone: ad.phone ?? '',
                          email: ad.email ?? '',
                        });
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="تغییر رمز">
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (!accountId) {
                          toast.error('شناسه ادمین یافت نشد.');
                          return;
                        }
                        setPassData({ accountId });
                      }}
                    >
                      <KeyRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Pagination (فقط وقتی غیرکنترل‌شده) */}
        {!controlled && (
          <Box sx={{ px: 0.5, pt: 1.5 }}>
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
        )}
      </Box>

      <AddAdminDialog
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onCreated={() => {
          setOpenAdd(false);
          if (controlled) onRefetch?.();
          else refetchAdmins?.();
        }}
      />

      <EditAdminDialog
        open={!!editData}
        onClose={() => setEditData(null)}
        admin={editData}
        onUpdated={() => {
          setEditData(null);
          if (controlled) onRefetch?.();
          else refetchAdmins?.();
        }}
      />

      <ChangeAdminPassDialog
        open={!!passData}
        onClose={() => setPassData(null)}
        accountId={passData?.accountId}
        onChanged={() => {
          setPassData(null);
          if (controlled) onRefetch?.();
          else refetchAdmins?.();
        }}
      />
    </DashboardContent>
  );
}
