import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Box,
  TextField,
  Button,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// import { updateBankAccount } from '../api/bankAccountApi';
import { useMemo } from 'react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import { useTheme, createTheme, ThemeProvider } from '@mui/material/styles';

import { updateBankAccount } from '../api/bankAccountsApi';

// Function to clean the card number
function cleanCardNumber(value: string): string {
  return value.replace(/\D/g, ''); // Remove non-numeric characters
}

// Function to validate card number
function isValidCard(value: string): boolean {
  const clean = cleanCardNumber(value);
  return clean.length >= 16 && clean.length <= 26;
}

type Props = {
  open: boolean;
  onClose: () => void;
  account?: any | null; // BankAccount type
  onSaved?: () => void;
};

export default function EditBankCardDialog({ open, onClose, account, onSaved }: Props) {
  const [cardNumber, setCardNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [bankName, setBankName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (account && open) {
      setCardNumber(account.cardNumber || '');
      setOwnerName(account.ownerName || '');
      setBankName(account.bankName || '');
    }
  }, [account, open]);

  const rtlCache = useMemo(
    () => createCache({ key: 'mui-rtl-edit-bank-card', stylisPlugins: [rtlPlugin] }),
    []
  );
  const outerTheme = useTheme();
  const rtlTheme = useMemo(() => createTheme(outerTheme, { direction: 'rtl' }), [outerTheme]);

  const handleSubmit = async () => {
    if (!account) return;
    const card = cleanCardNumber(cardNumber);
    if (!isValidCard(card) || ownerName.trim().length < 3 || bankName.trim().length < 2) return;

    setSubmitting(true);
    try {
      const res = await updateBankAccount({
        id: account.id,
        cardNumber: card,
        ownerName: ownerName.trim(),
        bankName: bankName.trim(),
      });
      if (res?.success ?? true) {
        onClose();
        onSaved?.();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={rtlTheme}>
        <Dialog
          open={open}
          onClose={onClose}
          fullWidth
          maxWidth="sm"
          aria-labelledby="edit-bank-card"
        >
          <DialogTitle id="edit-bank-card">ویرایش کارت بانکی</DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 2 }}>
            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}
            >
              <TextField
                label="شماره کارت"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                error={!!cardNumber && !isValidCard(cardNumber)}
                helperText={
                  !cardNumber
                    ? ''
                    : isValidCard(cardNumber)
                      ? ' '
                      : 'شماره کارت باید ۱۶ تا ۲۶ رقم باشد'
                }
                sx={{ gridColumn: { xs: '1', sm: '1 / span 2' } }}
              />
              <TextField
                label="نام صاحب حساب"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
              />
              <TextField
                label="نام بانک"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={onClose} color="inherit" variant="outlined">
              انصراف
            </Button>
            <LoadingButton
              loading={submitting}
              onClick={handleSubmit}
              variant="contained"
              disabled={
                !isValidCard(cardNumber) ||
                ownerName.trim().length < 3 ||
                bankName.trim().length < 2
              }
            >
              ذخیره
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </CacheProvider>
  );
}
