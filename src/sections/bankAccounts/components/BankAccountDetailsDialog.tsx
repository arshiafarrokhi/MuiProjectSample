import React from 'react';
import { Dialog, DialogTitle, DialogContent, Divider, Box, Typography } from '@mui/material';

type Props = {
  open: boolean;
  onClose: () => void;
  account?: any | null; // BankAccount type
};

function chunkReadable(num: string) {
  return String(num || '')
    .replace(/\s+/g, '')
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

export default function ViewBankCardDialog({ open, onClose, account }: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="view-bank-card">
      <DialogTitle id="view-bank-card">جزییات کارت بانکی</DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        {account ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <Typography variant="body2">شناسه: {account.id}</Typography>
            <Typography variant="body2">بانک: {account.bankName}</Typography>
            <Typography variant="body2">صاحب حساب: {account.ownerName}</Typography>
            <Typography variant="body2">وضعیت: {account.isRemoved ? 'حذف‌شده' : 'فعال'}</Typography>
            <Typography variant="body2" sx={{ gridColumn: '1 / span 2' }}>
              شماره کارت: {chunkReadable(account.cardNumber)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ gridColumn: '1 / span 2' }}>
              آخرین بروزرسانی: {account.lastUpdate}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2">موردی انتخاب نشده است.</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}
