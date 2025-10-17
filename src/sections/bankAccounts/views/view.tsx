import { useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Chip,
  Tooltip,
  Skeleton,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ViewBankCardDialog from '../components/ViewBankCardDialog';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog';
import { BankAccount, removeBankAccount, useBankAccounts } from '../api/bankAccountsApi';
import { formatFaDate } from 'src/utils/formatDate';
import EditBankCardDialog from '../components/EditBankAccountDialog';
import AddBankCardDialog from '../components/AddBankAccountDialog';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
// import { CacheProvider } from '@emotion/react';
import { useTheme, createTheme, ThemeProvider } from '@mui/material/styles';

function readableCard(num: string) {
  return num.replace(/(.{4})/g, '$1 ').trim();
}

export default function BankAccountsPage() {
  const { data, loading, mutate } = useBankAccounts();

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState<BankAccount | null>(null);
  const [deleting, setDeleting] = useState(false);

  const rows = useMemo(() => data, [data]);

  const openEdit = (row: BankAccount) => {
    setSelected(row);
    setEditOpen(true);
  };
  const openView = (row: BankAccount) => {
    setSelected(row);
    setViewOpen(true);
  };
  const openDelete = (row: BankAccount) => {
    setSelected(row);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!selected) return;
    setDeleting(true);
    try {
      await removeBankAccount(selected.id); // DELETE ?Id=
      await mutate(); // SWR refresh
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const rtlCache = useMemo(
    () => createCache({ key: 'mui-rtl-edit-bank-card', stylisPlugins: [rtlPlugin] }),
    []
  );
  const outerTheme = useTheme();
  const rtlTheme = useMemo(() => createTheme(outerTheme, { direction: 'rtl' }), [outerTheme]);

  return (
    // <CacheProvider value={rtlCache}>
      <ThemeProvider theme={rtlTheme}>
        <Box p={2}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6">مدیریت کارت‌های بانکی</Typography>
            <Button startIcon={<AddIcon />} variant="contained" onClick={() => setAddOpen(true)}>
              افزودن کارت
            </Button>
          </Stack>

          <Paper sx={{ p: 2 }}>
            {loading ? (
              <Stack spacing={1}>
                <Skeleton height={40} />
                <Skeleton height={40} />
                <Skeleton height={40} />
              </Stack>
            ) : rows.length === 0 ? (
              <Typography variant="body2">هیچ کارتی ثبت نشده است.</Typography>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="right">شماره کارت</TableCell>
                    <TableCell align="right">بانک</TableCell>
                    <TableCell align="right">صاحب حساب</TableCell>
                    <TableCell align="right">آخرین بروزرسانی</TableCell>
                    <TableCell align="right">وضعیت</TableCell>
                    <TableCell align="left">عملیات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell align="right" sx={{ fontFamily: 'mono' }}>
                        {readableCard(r.cardNumber)}
                      </TableCell>
                      <TableCell align="right">{r.bankName}</TableCell>
                      <TableCell align="right">{r.ownerName}</TableCell>
                      <TableCell align="right">{formatFaDate(r.lastUpdate)}</TableCell>
                      <TableCell align="right">
                        {r.isRemoved ? (
                          <Chip label="حذف‌شده" size="small" />
                        ) : (
                          <Chip label="فعال" color="success" size="small" />
                        )}
                      </TableCell>
                      <TableCell align="left">
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="جزییات">
                            <span>
                              <IconButton onClick={() => openView(r)} size="small">
                                <VisibilityIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="ویرایش">
                            <span>
                              <IconButton
                                onClick={() => openEdit(r)}
                                size="small"
                                disabled={r.isRemoved}
                              >
                                <EditIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="حذف">
                            <span>
                              <IconButton
                                onClick={() => openDelete(r)}
                                size="small"
                                disabled={r.isRemoved}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>

          {/* Dialogs */}
          <AddBankCardDialog open={addOpen} onClose={() => setAddOpen(false)} onSaved={mutate} />
          <EditBankCardDialog
            open={editOpen}
            onClose={() => setEditOpen(false)}
            onSaved={mutate}
            account={selected}
          />
          <ViewBankCardDialog
            open={viewOpen}
            onClose={() => setViewOpen(false)}
            account={selected}
          />
          <ConfirmDeleteDialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={handleDelete}
            loading={deleting}
            title="حذف کارت"
            description="آیا از حذف این کارت مطمئن هستید؟"
          />
        </Box>
      </ThemeProvider>
    // </CacheProvider>
  );
}
