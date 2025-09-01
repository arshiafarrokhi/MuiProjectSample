// src/sections/users/views/UsersView.tsx
import type { Theme, SxProps } from '@mui/material/styles';

import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
// Added wallet icon import
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import AddUserDialog from '../components/AddUser';
import { deleteUserApi } from '../api/deleteUserApi';
// import AddUserDialog from '../components/addUser';
import EditUserDialog from '../components/EditUserDialog';

type Props = {
  sx?: SxProps<Theme>;
  users?: any[];
  activeOnly?: boolean;
  setActiveOnly?: (v: boolean) => void;
  // Optional: you can pass a refetch method if you have one
  onRefetch?: () => void;
};

export function UsersView({ sx, users, activeOnly, setActiveOnly, onRefetch }: Props) {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const [openWalletDialog, setOpenWalletDialog] = useState(false);
  const [walletUser, setWalletUser] = useState<any | null>(null);

  const [localActiveOnly, setLocalActiveOnly] = useState<boolean>(activeOnly ?? true);

  useEffect(() => {
    if (typeof activeOnly === 'boolean') setLocalActiveOnly(activeOnly);
  }, [activeOnly]);

  const { deleteUser } = deleteUserApi();

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteUser(id);
      const ok = res && typeof res.success !== 'undefined' ? !!res.success : true;
      const message = res?.message || (ok ? 'کاربر حذف شد.' : 'حذف کاربر ناموفق بود.');

      if (ok) {
        toast.success(message);
        onRefetch?.();
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
  };

  const safeUsers = Array.isArray(users) ? users : [];

  const nav = useNavigate();

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
            bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
          <Button startIcon={<AddIcon />} onClick={() => setOpenAddDialog(true)} color="primary">
            اضافه کردن کاربر
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                  bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
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
                  alt={usersItem.fName + ' ' + usersItem.lName}
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
                {/* Edit button */}
                <EditIcon
                  color="action"
                  sx={{ cursor: 'pointer', fontSize: 28 }}
                  onClick={() => {
                    setSelectedUser({
                      id: usersItem.id, // <-- used as userId in API
                      fName: usersItem.fName ?? '',
                      lName: usersItem.lName ?? '',
                      phone: usersItem.phone ?? '',
                    });
                    setOpenEditDialog(true);
                  }}
                  titleAccess="ویرایش کاربر"
                />
                {/* Delete button */}
                <DeleteOutlineRoundedIcon
                  color="error"
                  sx={{ cursor: 'pointer', fontSize: 26 }}
                  onClick={() => {
                    if (confirm('آیا مطمئن هستید که می‌خواهید این کاربر را حذف کنید؟')) {
                      handleDelete(usersItem.id);
                    }
                  }}
                  titleAccess="حذف کاربر"
                />
                {/* wallet button */}
                <AccountBalanceWalletRoundedIcon
                  color="primary"
                  sx={{ cursor: 'pointer', fontSize: 26 }}
                  onClick={() =>
                    nav(`/dashboard/users/${usersItem.id}`, {
                      state: { fName: usersItem.fName ?? '', lName: usersItem.lName ?? '' },
                    })
                  }
                  titleAccess="کیف‌پول"
                />
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Add User */}
      <AddUserDialog
        handleClose={() => setOpenAddDialog(false)}
        openAddDialog={openAddDialog}
        onCreated={onRefetch}
      />

      {/* Edit User */}
      <EditUserDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        user={selectedUser}
        onUpdated={onRefetch} // if you have a refetch method, it will refresh the list post-update
      />
    </DashboardContent>
  );
}
