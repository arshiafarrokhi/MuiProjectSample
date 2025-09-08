import { toast } from 'sonner';
import React, { useEffect, useMemo, useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Box, Paper, Stack, TextField, Typography } from '@mui/material';

import {
  useGetProductsProfitPercentage,
  updateProductsProfitPercentage,
  PRODUCT_TYPE_LABEL,
  ProductType,
  type ProductProfitItem,
} from '../api/ordersApi';

const PERSIAN_DIGITS = /[۰-۹]/g;
const toLatinDigits = (val: string) =>
  val.replace(PERSIAN_DIGITS, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));

export default function ProfitPercentageCard() {
  const { profitItems, profitLoading, refetchProfit } = useGetProductsProfitPercentage();

  const initialMap = useMemo(() => {
    const m = new Map<number, number>();
    (profitItems ?? []).forEach((i: ProductProfitItem) => m.set(i.type, i.percentage));
    return m;
  }, [profitItems]);

  const [values, setValues] = useState<Record<number, string>>({
    [ProductType.Game]: '0',
    [ProductType.SIMChargeGlobal]: '0',
    [ProductType.SIMInternetGloabl]: '0',
  });
  const [saving, setSaving] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const next: Record<number, string> = { ...values };
    [ProductType.Game, ProductType.SIMChargeGlobal, ProductType.SIMInternetGloabl].forEach((t) => {
      const val = initialMap.get(t) ?? 0;
      next[t] = String(val);
    });
    setValues(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMap]);

  const handleChange = (t: number, v: string) => {
    // تبدیل ارقام فارسی و نگهداری فقط عدد/اعشار
    const raw = toLatinDigits(v).replace(/[^\d.]/g, '');
    setValues((p) => ({ ...p, [t]: raw }));
  };

  const handleSave = async (t: number) => {
    const num = Number(values[t]);
    if (Number.isNaN(num)) {
      toast.error('عدد معتبر وارد کنید.');
      return;
    }
    setSaving((p) => ({ ...p, [t]: true }));
    try {
      const res = await updateProductsProfitPercentage({ type: t, percentage: num });
      const ok = res?.success ?? true;
      toast[ok ? 'success' : 'error'](
        res?.message || (ok ? 'درصد سود با موفقیت ذخیره شد.' : 'ذخیره ناموفق بود.')
      );
      if (ok) refetchProfit && refetchProfit();
    } catch (e: any) {
      toast.error(e?.message || 'خطا در ذخیره درصد سود');
    } finally {
      setSaving((p) => ({ ...p, [t]: false }));
    }
  };

  return (
    <Paper
      sx={(theme) => ({
        p: 2,
        mb: 3,
        borderRadius: 2,
        border: '1px solid',
        borderColor: theme.vars?.palette?.divider || theme.palette.divider,
      })}
      aria-label="profit-percentages"
    >
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        درصد سود انواع محصول
      </Typography>

      {profitLoading ? (
        <Typography variant="body2" color="text.secondary">
          در حال بارگذاری...
        </Typography>
      ) : (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {[ProductType.Game, ProductType.SIMChargeGlobal, ProductType.SIMInternetGloabl].map(
            (t) => (
              <Box
                key={t}
                sx={(theme) => ({
                  flex: 1,
                  p: 2,
                  borderRadius: 2,
                  border: '1px dashed',
                  borderColor: theme.vars?.palette?.divider || theme.palette.divider,
                })}
              >
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {PRODUCT_TYPE_LABEL[t]}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    size="small"
                    type="text"
                    inputMode="decimal"
                    value={values[t] ?? ''}
                    onChange={(e) => handleChange(t, e.target.value)}
                    sx={{ minWidth: 120 }}
                    label="درصد"
                    placeholder="مثلاً: 5 یا 7.5"
                  />
                  <LoadingButton
                    onClick={() => handleSave(t)}
                    loading={!!saving[t]}
                    variant="contained"
                  >
                    ذخیره
                  </LoadingButton>
                </Stack>
              </Box>
            )
          )}
        </Stack>
      )}
    </Paper>
  );
}
