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
  order?: any | null;
  onUpdated?: () => void;
};

// --- helpers -------------------------------------------------
function firstDefined<T = any>(...vals: any[]): T | undefined {
  return vals.find((v) => v !== undefined && v !== null);
}

function toEnglishDigits(input: string) {
  // Converts Persian/Arabic digits to Latin
  const fa = '۰۱۲۳۴۵۶۷۸۹';
  const ar = '٠١٢٣٤٥٦٧٨٩';
  return (input ?? '').replace(/[۰-۹٠-٩]/g, (d) => {
    const faIdx = fa.indexOf(d);
    if (faIdx > -1) return String(faIdx);
    const arIdx = ar.indexOf(d);
    if (arIdx > -1) return String(arIdx);
    return d;
  });
}

function resolveOrderId(order?: any) {
  return firstDefined(
    order?.orderId,
    order?.id,
    order?.guid,
    order?.orderGUID,
    order?.OrderId,
    order?.gameProduct?.orderId,
    order?.simProduct?.orderId
  );
}

function resolveStatus(order?: any) {
  return Number(
    firstDefined(
      order?.status,
      order?.orderStatus,
      order?.gameProduct?.status,
      order?.simProduct?.status,
      1
    )
  );
}

function resolveAmount(order?: any) {
  const amount = firstDefined(
    order?.amount,
    order?.gameProduct?.price,
    order?.simProduct?.price,
    order?.gameProduct?.transaction?.amount != null
      ? Math.abs(order.gameProduct.transaction.amount)
      : undefined,
    order?.simProduct?.transaction?.amount != null
      ? Math.abs(order.simProduct.transaction.amount)
      : undefined
  );
  return typeof amount === 'number' ? amount : '';
}

function resolveRejectDescription(order?: any) {
  return firstDefined(
    order?.rejectDescription,
    order?.gameProduct?.rejectDescription,
    order?.simProduct?.rejectDescription,
    ''
  );
}
// -------------------------------------------------------------

export default function EditOrderDialog({ open, onClose, order, onUpdated }: Props) {
  const [status, setStatus] = useState<number>(1);
  const [amount, setAmount] = useState<number | ''>('');
  const [rejectDescription, setRejectDescription] = useState<string>('');
  const [notify, setNotify] = useState<boolean>(true);
  const [returnWallet, setReturnWallet] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Initialize from order (including nested game/sim)
    setStatus(resolveStatus(order));
    setAmount(resolveAmount(order));
    setRejectDescription(resolveRejectDescription(order));
    setNotify(true);
    setReturnWallet(false);
  }, [order, open]);

  const handleSubmit = async () => {
    const oid = resolveOrderId(order);
    if (!oid) {
      toast.error('شناسه سفارش نامعتبر است.');
      return;
    }

    setSubmitting(true);
    try {
      const numericAmount = amount === '' ? undefined : Number(toEnglishDigits(String(amount)));

      const res = await updateOrderApi({
        orderId: String(oid),
        status: Number(status),
        rejectDescription: rejectDescription || null,
        notifyTheUser: !!notify,
        returnAmountToUserWallet: !!returnWallet,
        amount: numericAmount,
      });

      const ok = res?.success ?? true;
      const msg = res?.message || (ok ? 'سفارش بروزرسانی شد.' : 'بروزرسانی ناموفق بود.');
      toast[ok ? 'success' : 'error'](msg);

      if (ok) {
        onClose();
        onUpdated?.(); // SWR mutate in parent
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
            // eslint-disable-next-line consistent-return
            onChange={(e) => {
              const v = e.target.value;
              if (v === '') return setAmount('');
              const latin = toEnglishDigits(v);
              setAmount(Number(latin));
            }}
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

        {/* Show whichever ID we resolved */}
        {resolveOrderId(order) && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            شناسه سفارش: {String(resolveOrderId(order))}
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
