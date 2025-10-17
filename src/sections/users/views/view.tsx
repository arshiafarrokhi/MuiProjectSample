import type { Theme, SxProps } from '@mui/material/styles';

import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import {
  Chip,
  Paper,
  Stack,
  Select,
  MenuItem,
  TextField,
  IconButton,
  TablePagination,
} from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';

import AddUserDialog from '../components/AddUser';
import { deleteUserApi } from '../api/deleteUserApi';
import EditUserDialog from '../components/EditUserDialog';
import { useGetUsers, type UsersListFilters } from '../api/usersApi';

export type Props = {
  sx?: SxProps<Theme>;
  users?: any[];
  activeOnly?: boolean;
  setActiveOnly?: (v: boolean) => void;
  onRefetch?: () => void;
};

function toFa(n?: number | string | null) {
  if (n === null || typeof n === 'undefined') return '—';
  return String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);
}

export function UsersView({ sx, users: usersProp, activeOnly, setActiveOnly, onRefetch }: Props) {
  const nav = useNavigate();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const [localActiveOnly, setLocalActiveOnly] = useState<boolean>(activeOnly ?? true);
  useEffect(() => {
    if (typeof activeOnly === 'boolean') setLocalActiveOnly(activeOnly);
  }, [activeOnly]);

  const controlled = Array.isArray(usersProp); // اگر کاربرها از props بیاید، فیلتر داخلی پنهان می‌شود

  // ---- Filters (فقط در حالت غیرکنترل‌شده) ----
  const [filters, setFilters] = useState<UsersListFilters>({
    pageIndex: 1, // سازگار با قبل
    pageSize: 20,
    filter: '', // Pagination.Filter
    activeUsers: true, // ActiveUsers
  });
  const [applied, setApplied] = useState<UsersListFilters>(filters);

  const { users, paging, usersLoading, refetchUsers } = useGetUsers(applied);

  const effectiveUsers = controlled ? (usersProp ?? []) : (users ?? []);

  const { deleteUser } = deleteUserApi();

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteUser(id);
      const ok = res && typeof res.success !== 'undefined' ? !!res.success : true;
      const message = res?.message || (ok ? 'کاربر حذف شد.' : 'حذف کاربر ناموفق بود.');

      if (ok) {
        toast.success(message);
        if (controlled) onRefetch?.();
        else refetchUsers?.();
      } else {
        toast.error(message);
      }
    } catch (err: any) {
      toast.error(err?.message || 'خطا در حذف کاربر');
    }
  };

  const handleToggleActive = (value: boolean) => {
    setLocalActiveOnly(value);
    if (typeof setActiveOnly === 'function') setActiveOnly(value);
    if (!controlled) setFilters((p) => ({ ...p, activeUsers: value }));
  };

  const safeUsers = Array.isArray(effectiveUsers) ? effectiveUsers : [];

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4">کاربران</Typography>

      <Box
        sx={[
          (theme) => ({
            p: 3,
            mt: 5,
            width: 1,
            border: `dashed 1px ${theme.vars.palette.divider}`,
            // bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
          <Button startIcon={<AddIcon />} onClick={() => setOpenAddDialog(true)} color="primary">
            اضافه کردن کاربر
          </Button>
        </Box>

        {/* Filters bar (فقط در حالت غیرکنترل‌شده) */}
        {!controlled && (
          <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
              <TextField
                size="small"
                label="جستجو"
                value={filters.filter ?? ''}
                onChange={(e) => setFilters((p) => ({ ...p, filter: e.target.value }))}
                sx={{ minWidth: { xs: 1, sm: 260 } }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={!!filters.activeUsers}
                    onChange={(e) => setFilters((p) => ({ ...p, activeUsers: e.target.checked }))}
                    color="primary"
                  />
                }
                label="فقط کاربران فعال"
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
                    setFilters({ pageIndex: 1, pageSize: 20, filter: '', activeUsers: true })
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
                      activeUsers: filters.activeUsers,
                    })
                  }
                >
                  اعمال فیلتر
                </Button>
                <Button variant="text" onClick={() => refetchUsers?.()} disabled={!!usersLoading}>
                  تازه‌سازی
                </Button>
              </Stack>
            </Stack>

            {/* خلاصه فیلترهای فعال */}
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
              {typeof applied.activeUsers === 'boolean' && (
                <Chip
                  label="کاربران فعال"
                  onDelete={() =>
                    setApplied((p) => ({ ...p, activeUsers: undefined, pageIndex: 1 }))
                  }
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {/* {!!applied.pageSize && (
                <Chip label={`PageSize: ${applied.pageSize}`} size="small" variant="outlined" />
              )} */}
              {/* <Chip
                label={`PageIndex: ${applied.pageIndex ?? 1} / ${Math.max(1, pageCount ?? 1)}`}
                size="small"
                variant="outlined"
              /> */}
            </Stack>
          </Paper>
        )}

        {/* Users list */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* سوئیچ فقط وقتی کنترل‌شده است نشان بده تا با فیلتر بالایی دو تا نشود */}
          {controlled && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!localActiveOnly}
                    onChange={(e) => handleToggleActive(e.target.checked)}
                    color="primary"
                  />
                }
                label="کاربر فعال"
              />
            </Box>
          )}

          {safeUsers.map((usersItem: any) => (
            <Box
              key={usersItem.id}
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
                  // bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                }),
                ...(Array.isArray(sx) ? sx : [sx]),
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
                  src={usersItem.avatar}
                  alt={(usersItem.fName || '') + ' ' + (usersItem.lName || '')}
                  width={70}
                  style={{ borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  {usersItem.fName} {usersItem.lName}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {usersItem.phone}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <IconButton
                  color="default"
                  size="small"
                  onClick={() => {
                    setSelectedUser({
                      id: usersItem.id,
                      fName: usersItem.fName ?? '',
                      lName: usersItem.lName ?? '',
                      phone: usersItem.phone ?? '',
                    });
                    setOpenEditDialog(true);
                  }}
                  title="ویرایش کاربر"
                >
                  <EditIcon fontSize="small" />
                </IconButton>

                <IconButton
                  color="error"
                  size="small"
                  onClick={() => {
                    if (confirm('آیا مطمئن هستید که می‌خواهید این کاربر را حذف کنید؟')) {
                      handleDelete(usersItem.id);
                    }
                  }}
                  title="حذف کاربر"
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>

                <IconButton
                  color="primary"
                  size="small"
                  onClick={() =>
                    nav(`/dashboard/users/${usersItem.id}`, {
                      state: { fName: usersItem.fName ?? '', lName: usersItem.lName ?? '' },
                    })
                  }
                  title="کیف‌پول"
                >
                  <AccountBalanceWalletRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Pagination (فقط وقتی غیرکنترل‌شده) */}
        {!controlled && (
          <Box sx={{ px: 0.5, pt: 1.5 }}>
            <TablePagination
              component="div"
              count={paging?.totalRow ?? 0}
              page={(paging?.pageIndex ?? applied.pageIndex ?? 1) - 1}
              onPageChange={(_, newPage) => setApplied((p) => ({ ...p, pageIndex: newPage + 1 }))}
              rowsPerPage={paging?.pageSize ?? applied.pageSize ?? 20}
              onRowsPerPageChange={(e) => {
                const newSize = Number(e.target.value);
                setApplied((p) => ({ ...p, pageSize: newSize, pageIndex: 1 }));
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

      {/* Add User */}
      <AddUserDialog
        handleClose={() => setOpenAddDialog(false)}
        openAddDialog={openAddDialog}
        onCreated={() => (controlled ? onRefetch?.() : refetchUsers?.())}
      />

      {/* Edit User */}
      <EditUserDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        user={selectedUser}
        onUpdated={() => (controlled ? onRefetch?.() : refetchUsers?.())}
      />
    </DashboardContent>
  );
}
