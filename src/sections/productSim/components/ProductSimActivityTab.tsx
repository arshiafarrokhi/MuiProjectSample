import { toast } from 'sonner';
// src/sections/productSim/components/ProductSimActivityTab.tsx
import { useState } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Paper,
  Table,
  Stack,
  Switch,
  Button,
  Select,
  MenuItem,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import {
  useGetCountries,
  useGetOperators,
  changeCountryActivity,
  changeOperatorActivity,
} from '../api/productSimApi';

function boolLabel(v?: boolean) {
  if (v === true) return 'فعال';
  if (v === false) return 'غیرفعال';
  return 'همه';
}

type FilterValue = 'all' | 'true' | 'false';
const toBool = (v: FilterValue): boolean | undefined =>
  v === 'true' ? true : v === 'false' ? false : undefined;

export default function ProductSimActivityTab() {
  // فیلترها
  const [countryFilter, setCountryFilter] = useState<FilterValue>('all');
  const [operatorFilter, setOperatorFilter] = useState<FilterValue>('all');

  const isActiveCountry = toBool(countryFilter);
  const isActiveOperator = toBool(operatorFilter);

  // لیست کشورها
  const { countries, countriesLoading, refetchCountries } = useGetCountries(isActiveCountry);

  // آکاردئون باز
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleToggleCountry = async (c: any, next: boolean) => {
    try {
      const countryId: number | undefined =
        typeof c?.id === 'number'
          ? c.id
          : typeof c?.CountryId === 'number'
            ? c.CountryId
            : undefined;

      if (countryId === undefined) {
        toast.error('شناسه کشور نامعتبر است.');
        return;
      }

      const res = await changeCountryActivity({ countryId, active: next });
      const ok = res?.success ?? true;
      toast[ok ? 'success' : 'error'](
        res?.message || (ok ? 'وضعیت کشور بروزرسانی شد.' : 'بروزرسانی ناموفق بود.')
      );
      if (refetchCountries) refetchCountries();
    } catch (e: any) {
      toast.error(e?.message || 'خطا در بروزرسانی کشور');
    }
  };

  const CountryRow = ({ c }: { c: any }) => {
    const id: number | undefined =
      typeof c?.id === 'number' ? c.id : typeof c?.CountryId === 'number' ? c.CountryId : undefined;
    const name = c?.name ?? c?.Name ?? '—';
    const isActive = (c?.isActive ?? c?.active ?? c?.Active) as boolean | undefined;

    const { operators, operatorsLoading, refetchOperators } = useGetOperators(
      expandedId === id ? id : undefined,
      isActiveOperator
    );

    const toggleOperator = async (op: any, next: boolean) => {
      try {
        const operatorId: number | undefined =
          typeof op?.id === 'number'
            ? op.id
            : typeof op?.OperatorId === 'number'
              ? op.OperatorId
              : typeof op?.operatorId === 'number'
                ? op.operatorId
                : undefined;

        if (operatorId === undefined) {
          toast.error('شناسه اپراتور نامعتبر است.');
          return;
        }

        const res = await changeOperatorActivity({ operatorId, active: next });
        const ok = res?.success ?? true;
        toast[ok ? 'success' : 'error'](
          res?.message || (ok ? 'وضعیت اپراتور بروزرسانی شد.' : 'بروزرسانی ناموفق بود.')
        );
        if (refetchCountries) refetchCountries();
      } catch (e: any) {
        toast.error(e?.message || 'خطا در بروزرسانی اپراتور');
      }
    };

    return (
      <Accordion
        expanded={expandedId === id}
        onChange={(_, exp) => setExpandedId(exp ? (id ?? null) : null)}
        disableGutters
        elevation={0}
        sx={{
          bgcolor: 'transparent',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          mb: 1,
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ width: 1 }}>
            <Typography sx={{ minWidth: 200, fontWeight: 600 }}>{name}</Typography>
            <Typography sx={{ color: 'text.secondary' }}>وضعیت: {boolLabel(isActive)}</Typography>
            <Box sx={{ flex: 1 }} />
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2">فعال</Typography>
              <Switch
                checked={!!isActive}
                onChange={(e) => handleToggleCountry(c, e.target.checked)}
                inputProps={{ 'aria-label': 'country-active-switch' }}
              />
            </Stack>
          </Stack>
        </AccordionSummary>

        <AccordionDetails>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Typography variant="subtitle2">اپراتورها</Typography>
            <Box sx={{ flex: 1 }} />
            <Select
              size="small"
              value={operatorFilter}
              onChange={(e) => setOperatorFilter(e.target.value as FilterValue)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="all">همه وضعیت‌ها</MenuItem>
              <MenuItem value="true">فقط فعال</MenuItem>
              <MenuItem value="false">فقط غیرفعال</MenuItem>
            </Select>
            <Button
              onClick={() => refetchOperators && refetchOperators()}
              size="small"
              variant="outlined"
            >
              تازه‌سازی اپراتورها
            </Button>
          </Stack>

          <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>نام اپراتور</TableCell>
                  <TableCell align="center">وضعیت</TableCell>
                  <TableCell align="center">تغییر</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {operatorsLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                      در حال بارگذاری...
                    </TableCell>
                  </TableRow>
                ) : Array.isArray(operators) && operators.length > 0 ? (
                  operators.map((op: any) => {
                    const opName = op?.name ?? op?.Name ?? '—';
                    const opActive = (op?.isActive ?? op?.active ?? op?.Active) as
                      | boolean
                      | undefined;
                    const opId: number | undefined =
                      typeof op?.id === 'number'
                        ? op.id
                        : typeof op?.OperatorId === 'number'
                          ? op.OperatorId
                          : typeof op?.operatorId === 'number'
                            ? op.operatorId
                            : undefined;

                    return (
                      <TableRow key={opId ?? Math.random()}>
                        <TableCell>{opName}</TableCell>
                        <TableCell align="center">{boolLabel(opActive)}</TableCell>
                        <TableCell align="center">
                          <Switch
                            checked={!!opActive}
                            onChange={(e) => toggleOperator(op, e.target.checked)}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                      اپراتوری یافت نشد.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          مدیریت وضعیت کشورها و اپراتورها
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Select
          size="small"
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value as FilterValue)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="all">نمایش همه کشورها</MenuItem>
          <MenuItem value="true">فقط فعال</MenuItem>
          <MenuItem value="false">فقط غیرفعال</MenuItem>
        </Select>
        <Button
          onClick={() => refetchCountries && refetchCountries()}
          variant="outlined"
          size="small"
        >
          تازه‌سازی کشورها
        </Button>
      </Stack>

      <Box>
        {countriesLoading ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>در حال بارگذاری...</Paper>
        ) : Array.isArray(countries) && countries.length > 0 ? (
          <Box>
            {countries.map((c: any) => (
              <CountryRow key={c?.id ?? c?.CountryId ?? Math.random()} c={c} />
            ))}
          </Box>
        ) : (
          <Paper sx={{ p: 3, textAlign: 'center' }}>کشوری یافت نشد.</Paper>
        )}
      </Box>
    </Box>
  );
}
