import type { Theme, SxProps } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { toast } from 'sonner';

import { DashboardContent } from 'src/layouts/dashboard';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import AddAdminDialog from './components/AddAdminDialog';
import EditAdminDialog from './components/EditAdminDialog';
import ChangeAdminPassDialog from './components/ChangeAdminPassDialog';

type Props = {
  sx?: SxProps<Theme>;
  admins?: any[];
  onRefetch?: () => void;
};

export function AdminsView({ sx, admins, onRefetch }: Props) {
  const [openAdd, setOpenAdd] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);
  const [passData, setPassData] = useState<any | null>(null);

  const safeAdmins = Array.isArray(admins) ? admins : [];

  // sort by inserTime desc
  const ordered = useMemo(
    () =>
      [...safeAdmins].sort((a, b) => {
        const da = new Date(a?.inserTime ?? 0).getTime();
        const db = new Date(b?.inserTime ?? 0).getTime();
        return db - da;
      }),
    [safeAdmins]
  );

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

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ordered.map((ad, idx) => {
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
                    <Typography variant="subtitle1" fontWeight={700}>
                      {ad.fullname}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {ad.email} • {ad.phone}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      نقش: {ad.role} | ثبت: {new Date(ad.inserTime).toLocaleString('fa-IR')}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <EditIcon
                    sx={{ cursor: 'pointer' }}
                    titleAccess="ویرایش ادمین"
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
                  />
                  <KeyRoundedIcon
                    sx={{ cursor: 'pointer' }}
                    titleAccess="تغییر رمز"
                    onClick={() => {
                      if (!accountId) {
                        toast.error('شناسه ادمین یافت نشد.');
                        return;
                      }
                      setPassData({ accountId });
                    }}
                  />
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      <AddAdminDialog
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onCreated={() => {
          setOpenAdd(false);
          if (onRefetch) onRefetch();
        }}
      />

      <EditAdminDialog
        open={!!editData}
        onClose={() => setEditData(null)}
        admin={editData}
        onUpdated={() => {
          setEditData(null);
          if (onRefetch) onRefetch();
        }}
      />

      <ChangeAdminPassDialog
        open={!!passData}
        onClose={() => setPassData(null)}
        accountId={passData?.accountId}
        onChanged={() => {
          setPassData(null);
          if (onRefetch) onRefetch();
        }}
      />
    </DashboardContent>
  );
}
