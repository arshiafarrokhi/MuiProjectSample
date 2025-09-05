import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Dialog,
  Button,
  Divider,
  Checkbox,
  MenuItem,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { updateOrderApi } from '../api/ordersApi';

const STATUS_OPTIONS = [
  { value: 1, label: 'در انتظار پرداخت' },
  { value: 2, label: 'در حال پردازش' },
  { value: 3, label: 'تکمیل شد' },
  { value: 4, label: 'لغو توسط کاربر' },
  { value: 5, label: 'لغو توسط ادمین' },
  { value: 6, label: 'ناموفق' },
];

type Props = {
  open: boolean;
  onClose: () => void;
  order?: any | null; // باید حداقل orderId داشته باشد
  onUpdated?: () => void;
};

export default function EditOrderDialog({ open, onClose, order, onUpdated }: Props) {
  const [status, setStatus] = useState<number>(1);
  const [amount, setAmount] = useState<number | ''>('');
  const [rejectDescription, setRejectDescription] = useState<string>('');
  const [notify, setNotify] = useState<boolean>(true);
  const [returnWallet, setReturnWallet] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // مقداردهی اولیه از سفارش
    setStatus(order?.status ?? order?.orderStatus ?? 1);
    setAmount(typeof order?.amount === 'number' ? order.amount : '');
    setRejectDescription(order?.rejectDescription ?? '');
    setNotify(true);
    setReturnWallet(false);
  }, [order, open]);

  const handleSubmit = async () => {
    const orderId =
      order?.orderId || order?.id || order?.guid || order?.orderGUID || order?.OrderId;
    if (!orderId) {
      toast.error('شناسه سفارش نامعتبر است.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await updateOrderApi({
        orderId: String(orderId),
        status: Number(status),
        rejectDescription: rejectDescription || null,
        notifyTheUser: !!notify,
        returnAmountToUserWallet: !!returnWallet,
        amount: amount === '' ? undefined : Number(amount),
      });

      const ok = res?.success ?? true;
      const msg = res?.message || (ok ? 'سفارش بروزرسانی شد.' : 'بروزرسانی ناموفق بود.');
      toast[ok ? 'success' : 'error'](msg);
      if (ok) {
        onClose();
        onUpdated?.();
      }
    } catch (e: any) {
      toast.error(e?.message || 'خطا در بروزرسانی سفارش');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth aria-labelledby="edit-order">
      <DialogTitle id="edit-order">ویرایش سفارش</DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <TextField
            select
            label="وضعیت"
            value={status}
            onChange={(e) => setStatus(Number(e.target.value))}
            fullWidth
          >
            {STATUS_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="مبلغ"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
            fullWidth
          />

          <TextField
            label="توضیح رد شدن (اختیاری)"
            value={rejectDescription}
            onChange={(e) => setRejectDescription(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            sx={{ gridColumn: { xs: '1', sm: '1 / span 2' } }}
          />

          <Box sx={{ gridColumn: { xs: '1', sm: '1 / span 2' } }}>
            <FormControlLabel
              control={<Checkbox checked={notify} onChange={(e) => setNotify(e.target.checked)} />}
              label="به کاربر اطلاع داده شود"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={returnWallet}
                  onChange={(e) => setReturnWallet(e.target.checked)}
                />
              }
              label="بازگشت مبلغ به کیف پول کاربر"
            />
          </Box>
        </Box>
        {order?.id && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            شناسه سفارش: {String(order?.id)}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" variant="outlined">
          انصراف
        </Button>
        <LoadingButton loading={submitting} onClick={handleSubmit} variant="contained">
          ذخیره
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
