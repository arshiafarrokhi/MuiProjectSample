// 

import { varAlpha } from 'minimal-shared/utils';
// src/sections/orders/views/view.tsx
import React, { useMemo, useState } from 'react';
import ProfitPercentageCard from '../components/ProfitPercentageCard';

import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Tab,
  Tabs,
  Chip,
  Paper,
  Table,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Typography,
  IconButton,
  TableContainer,
} from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';

import FiltersBar from '../components/FiltersBar';
import EditOrderDialog from '../components/EditOrderDialog';
import {
  useGetOrders,
  type LocalFilters,
  type OrdersFilters,
  useGetLocalSIMOrders,
} from '../api/ordersApi';

// ---------- helpers ----------
const STATUS_LABEL: Record<number, string> = {
  1: 'در انتظار پرداخت',
  2: 'در حال پردازش',
  3: 'تکمیل شد',
  4: 'لغو توسط کاربر',
  5: 'لغو توسط ادمین',
  6: 'ناموفق',
};

const PRODUCT_LABEL: Record<number, string> = {
  1: 'سیم‌کارت',
  2: 'بازی',
};

const REGION_LABEL: Record<number, string> = {
  1: 'ایران',
  2: 'بین‌المللی',
};

const toFaDigits = (val: any) =>
  (val ?? '—').toString().replace(/\d/g, (d: string) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

const formatFaDate = (iso?: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  try {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Tehran',
    }).format(d);
  } catch {
    return d.toLocaleString('fa-IR');
  }
};

// -------- resolvers (work across shapes) ----------------
const first = <T,>(...vals: any[]): T | undefined =>
  vals.find((v) => v !== undefined && v !== null);

const getOrderUserId = (o: any) =>
  first<string>(
    o?.userId,
    o?.user?.userId,
    o?.gameProduct?.user?.userId,
    o?.simProduct?.user?.userId
  );

const getOrderDateISO = (o: any) =>
  first<string>(
    o?.insertTime,
    o?.date,
    o?.createdAt,
    o?.createDate,
    o?.createdDate,
    o?.insertDate,
    o?.orderDate,
    o?.paymentDate,
    o?.transDate,
    o?.transactionDate
  );

const getOrderDateISOAny = (o: any) =>
  getOrderDateISO(o) ??
  first<string>(
    o?.gameProduct?.insertTime,
    o?.simProduct?.insertTime,
    o?.gameProduct?.date,
    o?.simProduct?.date
  );

// normalize object for dialog (prevents id/status mismatches)
const normalizeOrder = (o: any) => {
  const status =
    first<number>(o?.status, o?.orderStatus, o?.gameProduct?.status, o?.simProduct?.status, 1) ?? 1;

  const orderId = first<any>(
    o?.orderId,
    o?.id,
    o?.guid,
    o?.orderGUID,
    o?.OrderId,
    o?.gameProduct?.orderId,
    o?.simProduct?.orderId
  );

  const amount = first<number>(
    o?.amount,
    o?.gameProduct?.price,
    o?.simProduct?.price,
    o?.gameProduct?.transaction?.amount != null
      ? Math.abs(o.gameProduct.transaction.amount)
      : undefined,
    o?.simProduct?.transaction?.amount != null
      ? Math.abs(o.simProduct.transaction.amount)
      : undefined
  );

  const rejectDescription = first<string>(
    o?.rejectDescription,
    o?.gameProduct?.rejectDescription,
    o?.simProduct?.rejectDescription
  );

  return { ...o, orderId, status, amount, rejectDescription };
};

// ----- Manual status colors (no MUI color prop) -----
const STATUS_STYLE: Record<number, { bg: string; color: string; border: string }> = {
  1: { bg: '#FFF4E5', color: '#A15C07', border: '#FFD8A8' }, // در انتظار پرداخت (amber)
  2: { bg: '#E7F5FF', color: '#1C7ED6', border: '#A5D8FF' }, // در حال پردازش (blue)
  3: { bg: '#E6FCF5', color: '#087F5B', border: '#96F2D7' }, // تکمیل شد (green)
  4: { bg: '#F8F9FA', color: '#495057', border: '#DEE2E6' }, // لغو توسط کاربر (gray)
  5: { bg: '#FFF0F6', color: '#D6336C', border: '#FFC9DE' }, // لغو توسط ادمین (pink/red)
  6: { bg: '#FFF5F5', color: '#C92A2A', border: '#FFA8A8' }, // ناموفق (red)
};

const renderStatusChip = (status?: number) => {
  const s = Number(status || 0);
  const style = STATUS_STYLE[s] ?? { bg: '#F1F3F5', color: '#495057', border: '#DEE2E6' };

  return (
    <Chip
      size="small"
      label={STATUS_LABEL[s] || '—'}
      variant="outlined"
      sx={{
        bgcolor: style.bg,
        color: style.color,
        borderColor: style.border,
        fontWeight: 600,
      }}
    />
  );
};

// =========================================================

export default function OrdersView() {
  const [tab, setTab] = useState(0);

  // ----------- Filters: Orders -----------
  const [filters, setFilters] = useState<OrdersFilters>({
    userId: '',
    orderStatus: 7,
    productType: 2,
    regionType: undefined,
    phone: '',
    gameAccountId: '',
  });
  const [applied, setApplied] = useState<OrdersFilters>(filters);

  const { orders, ordersLoading, refetchOrders } = useGetOrders(applied);

  const sortedOrders = useMemo(() => {
    const arr = Array.isArray(orders) ? [...orders] : [];
    return arr.sort((a: any, b: any) => {
      const ta = new Date(getOrderDateISOAny(a) ?? 0).getTime();
      const tb = new Date(getOrderDateISOAny(b) ?? 0).getTime();
      return tb - ta;
    });
  }, [orders]);

  // ----------- Filters: Local SIM -----------
  const [localFilters, setLocalFilters] = useState<LocalFilters>({
    orderStatus: undefined,
    userId: '',
    operator: undefined,
    phone: '',
  });
  const [localApplied, setLocalApplied] = useState<LocalFilters>(localFilters);

  const { localOrders, localLoading, refetchLocal } = useGetLocalSIMOrders(localApplied);

  const sortedLocal = useMemo(() => {
    const arr = Array.isArray(localOrders) ? [...localOrders] : [];
    return arr.sort((a: any, b: any) => {
      const ta = new Date(getOrderDateISO(a) ?? 0).getTime();
      const tb = new Date(getOrderDateISO(b) ?? 0).getTime();
      return tb - ta;
    });
  }, [localOrders]);

  // ----------- Edit dialog -----------
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const openEditFor = (ord: any) => {
    setSelectedOrder(normalizeOrder(ord));
    setOpenEdit(true);
  };

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4">سفارش‌ها</Typography>

      <Box
        sx={[
          (theme) => ({
            p: 3,
            mt: 5,
            width: 1,
            border: `dashed 1px ${theme.vars.palette.divider}`,
            bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
            borderRadius: 2,
          }),
        ]}
      >
        <ProfitPercentageCard />
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="سفارش‌ها (عمومی)" />
          <Tab label="سفارش‌های سیم‌کارت داخلی" />
        </Tabs>

        {/* ------------------ TAB 0: Orders ------------------ */}
        {tab === 0 && (
          <Box>
            {/* FiltersBar: Orders */}
            <FiltersBar
              title="فیلتر سفارش‌ها"
              statusLabelMap={STATUS_LABEL}
              productLabelMap={PRODUCT_LABEL}
              regionLabelMap={REGION_LABEL}
              values={filters}
              onChange={(patch) => setFilters((p) => ({ ...p, ...patch }))}
              onApply={() => setApplied({ ...filters })}
              onReset={() =>
                setFilters({
                  userId: '',
                  orderStatus: undefined,
                  productType: undefined,
                  regionType: undefined,
                  phone: '',
                  gameAccountId: '',
                })
              }
              onRefresh={() => {
                if (refetchOrders) refetchOrders();
              }}
              show={{
                userId: true,
                phone: true,
                gameAccountId: true,
                status: true,
                productType: true,
                regionType: true,
              }}
            />

            {/* Table */}
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <TableContainer sx={{ maxHeight: { xs: '60vh', md: '70vh' } }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>ویرایش</TableCell>
                      <TableCell>شناسه</TableCell>
                      <TableCell>کاربر</TableCell>
                      <TableCell>تلفن</TableCell>
                      <TableCell>وضعیت</TableCell>
                      <TableCell>نوع محصول</TableCell>
                      <TableCell>منطقه</TableCell>
                      <TableCell>مبلغ</TableCell>
                      <TableCell>تاریخ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(!sortedOrders || sortedOrders.length === 0) && !ordersLoading ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                          موردی یافت نشد.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedOrders?.map((o: any) => (
                        <TableRow key={o.id || o.orderId}>
                          <TableCell>
                            <IconButton size="small" onClick={() => openEditFor(o)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 200 }} title={o.id || o.orderId}>
                            <Typography noWrap>
                              {o?.orderId ||
                                o?.gameProduct?.orderId ||
                                o?.simProduct?.orderId ||
                                '—'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 200 }} title={String(getOrderUserId(o) ?? '')}>
                            <Typography noWrap>{getOrderUserId(o) || '—'}</Typography>
                          </TableCell>
                          <TableCell>
                            {o?.phone ||
                              o?.gameProduct?.user?.userPhone ||
                              o?.simProduct?.user?.userPhone ||
                              '—'}
                          </TableCell>
                          <TableCell>
                            {renderStatusChip(
                              o?.status ??
                                o?.orderStatus ??
                                o?.gameProduct?.status ??
                                o?.simProduct?.status
                            )}
                          </TableCell>
                          <TableCell>
                            {PRODUCT_LABEL[
                              (o?.productType ??
                                o?.gameProduct?.productType ??
                                o?.simProduct?.productType) as number
                            ] || '—'}
                          </TableCell>
                          <TableCell>{REGION_LABEL[o.regionType] || '—'}</TableCell>
                          <TableCell>
                            {toFaDigits(
                              o?.amount ??
                                o?.gameProduct?.price ??
                                o?.simProduct?.price ??
                                (o?.gameProduct?.transaction?.amount != null
                                  ? Math.abs(o.gameProduct.transaction.amount)
                                  : o?.simProduct?.transaction?.amount != null
                                    ? Math.abs(o.simProduct.transaction.amount)
                                    : '—')
                            )}
                          </TableCell>
                          <TableCell>{formatFaDate(getOrderDateISOAny(o))}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        )}

        {/* ------------------ TAB 1: Local SIM Orders ------------------ */}
        {tab === 1 && (
          <Box>
            {/* FiltersBar: Local SIM */}
            <FiltersBar
              title="فیلتر سفارش‌های سیم‌کارت داخلی"
              statusLabelMap={STATUS_LABEL}
              values={localFilters}
              onChange={(patch) => setLocalFilters((p) => ({ ...p, ...patch }))}
              onApply={() => setLocalApplied({ ...localFilters })}
              onReset={() =>
                setLocalFilters({
                  orderStatus: undefined,
                  userId: '',
                  operator: undefined,
                  phone: '',
                })
              }
              onRefresh={() => refetchLocal && refetchLocal()}
              show={{
                userId: true,
                phone: true,
                operator: true,
                status: true,
                productType: false,
                regionType: false,
                gameAccountId: false,
              }}
            />

            {/* Table */}
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <TableContainer sx={{ maxHeight: { xs: '60vh', md: '70vh' } }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>ویرایش</TableCell>
                      <TableCell>شناسه</TableCell>
                      <TableCell>کاربر</TableCell>
                      <TableCell>اپراتور</TableCell>
                      <TableCell>تلفن</TableCell>
                      <TableCell>وضعیت</TableCell>
                      <TableCell>مبلغ</TableCell>
                      <TableCell>تاریخ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(!sortedLocal || sortedLocal.length === 0) && !localLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                          موردی یافت نشد.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedLocal.map((o: any) => (
                        <TableRow key={o.id || o.orderId}>
                          <TableCell>
                            <IconButton size="small" onClick={() => openEditFor(o)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 200 }} title={o.id || o.orderId}>
                            <Typography noWrap>{o.id || o.orderId || '—'}</Typography>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 200 }} title={String(getOrderUserId(o) ?? '')}>
                            <Typography noWrap>{getOrderUserId(o) || '—'}</Typography>
                          </TableCell>
                          <TableCell>
                            {o.operator?.name ?? o.operator ?? o.operatorId ?? '—'}
                          </TableCell>
                          <TableCell>{o.phone || '—'}</TableCell>
                          <TableCell>{renderStatusChip(o.status ?? o.orderStatus)}</TableCell>
                          <TableCell>{toFaDigits(o.amount ?? '—')}</TableCell>
                          <TableCell>{formatFaDate(getOrderDateISO(o))}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        )}
      </Box>

      {/* Edit dialog (برای هر دو تب مشترک) */}
      <EditOrderDialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        order={selectedOrder}
        onUpdated={() => {
          if (tab === 0) {
            if (refetchOrders) refetchOrders();
          } else {
            if (refetchLocal) refetchLocal();
          }
        }}
      />
    </DashboardContent>
  );
}
