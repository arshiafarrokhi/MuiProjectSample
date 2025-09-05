import { varAlpha } from 'minimal-shared/utils';
// src/sections/orders/views/view.tsx
import React, { useMemo, useState } from 'react';

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

// =========================================================

export default function OrdersView() {
  const [tab, setTab] = useState(0);

  // ----------- Filters: Orders -----------
  const [filters, setFilters] = useState<OrdersFilters>({
    userId: '',
    orderStatus: undefined,
    productType: undefined,
    regionType: undefined,
    phone: '',
    gameAccountId: '',
  });
  const [applied, setApplied] = useState<OrdersFilters>(filters);

  const { orders, ordersLoading, refetchOrders } = useGetOrders(applied);

  const sortedOrders = useMemo(() => {
    const arr = Array.isArray(orders) ? [...orders] : [];
    return arr.sort((a: any, b: any) => {
      const ta = new Date(a?.insertTime || a?.date || 0).getTime();
      const tb = new Date(b?.insertTime || b?.date || 0).getTime();
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
      const ta = new Date(a?.insertTime || a?.date || 0).getTime();
      const tb = new Date(b?.insertTime || b?.date || 0).getTime();
      return tb - ta;
    });
  }, [localOrders]);

  // ----------- Edit dialog -----------
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const openEditFor = (ord: any) => {
    setSelectedOrder(ord);
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
              onRefresh={() => refetchOrders && refetchOrders()}
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
                      sortedOrders.map((o: any) => (
                        <TableRow key={o.id || o.orderId}>
                          <TableCell>
                            <IconButton size="small" onClick={() => openEditFor(o)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 200 }} title={o.id || o.orderId}>
                            <Typography noWrap>{o.id || o.orderId || '—'}</Typography>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 200 }} title={o.userId}>
                            <Typography noWrap>{o.userId || '—'}</Typography>
                          </TableCell>
                          <TableCell>{o.phone || '—'}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={STATUS_LABEL[o.status || o.orderStatus] || '—'}
                              color={
                                (o.status || o.orderStatus) === 3
                                  ? 'success'
                                  : (o.status || o.orderStatus) === 6
                                    ? 'error'
                                    : 'default'
                              }
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{PRODUCT_LABEL[o.productType] || '—'}</TableCell>
                          <TableCell>{REGION_LABEL[o.regionType] || '—'}</TableCell>
                          <TableCell>{toFaDigits(o.amount ?? '—')}</TableCell>
                          <TableCell>{formatFaDate(o.insertTime || o.date)}</TableCell>
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
                          <TableCell sx={{ maxWidth: 200 }} title={o.userId}>
                            <Typography noWrap>{o.userId || '—'}</Typography>
                          </TableCell>
                          <TableCell>
                            {o.operator?.name ?? o.operator ?? o.operatorId ?? '—'}
                          </TableCell>
                          <TableCell>{o.phone || '—'}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={STATUS_LABEL[o.status || o.orderStatus] || '—'}
                              color={
                                (o.status || o.orderStatus) === 3
                                  ? 'success'
                                  : (o.status || o.orderStatus) === 6
                                    ? 'error'
                                    : 'default'
                              }
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{toFaDigits(o.amount ?? '—')}</TableCell>
                          <TableCell>{formatFaDate(o.insertTime || o.date)}</TableCell>
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
          tab === 0 ? refetchOrders && refetchOrders() : refetchLocal && refetchLocal();
        }}
      />
    </DashboardContent>
  );
}
