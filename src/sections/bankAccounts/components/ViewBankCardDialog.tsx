import { Dialog, DialogTitle, DialogContent, Stack, Typography, Divider } from '@mui/material';
import { BankAccount } from '../api/bankAccountsApi';
import { formatFaDate } from 'src/utils/formatDate';

function chunkReadable(num: string) {
  const s = num.replace(/\s+/g, '');
  return s.replace(/(.{4})/g, '$1 ').trim();
}

export default function ViewBankCardDialog({
  open,
  onClose,
  account,
}: {
  open: boolean;
  onClose: () => void;
  account: BankAccount | null;
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>جزییات کارت</DialogTitle>
      <DialogContent>
        {account && (
          <Stack spacing={1.2} sx={{ mt: 1 }}>
            <Typography variant="body2">شناسه: {account.id}</Typography>
            <Typography variant="body2">بانک: {account.bankName}</Typography>
            <Typography variant="body2">صاحب حساب: {account.ownerName}</Typography>
            <Typography variant="body2">شماره کارت: {chunkReadable(account.cardNumber)}</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" color="text.secondary">
              آخرین بروزرسانی: {formatFaDate(account.lastUpdate)}
            </Typography>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
