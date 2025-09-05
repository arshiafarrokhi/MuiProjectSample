import React, { useMemo } from 'react';

import SearchIcon from '@mui/icons-material/Search';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import PhoneIphoneRoundedIcon from '@mui/icons-material/PhoneIphoneRounded';
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import SportsEsportsRoundedIcon from '@mui/icons-material/SportsEsportsRounded';
import {
  Box,
  Chip,
  Paper,
  Stack,
  Button,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Typography,
  useMediaQuery,
  InputAdornment,
} from '@mui/material';

type StatusMap = Record<number, string>;
type DictNum = Record<number, string>;

type CommonProps = {
  title?: string;
  statusLabelMap: StatusMap;
  productLabelMap?: DictNum;
  regionLabelMap?: DictNum;

  values: Record<string, any>;
  onChange: (patch: Partial<Record<string, any>>) => void;
  onApply: () => void;
  onReset: () => void;
  onRefresh?: () => void;

  // کنترل اینکه چه فیلدهایی نمایش داده شوند
  show: {
    userId?: boolean;
    phone?: boolean;
    gameAccountId?: boolean;
    status?: boolean;
    productType?: boolean;
    regionType?: boolean;
    operator?: boolean; // فقط برای LocalSIM
  };
};

export default function FiltersBar({
  title,
  statusLabelMap,
  productLabelMap,
  regionLabelMap,
  values,
  onChange,
  onApply,
  onReset,
  onRefresh,
  show,
}: CommonProps) {
  const isSm = useMediaQuery('(max-width:900px)');

  const activeChips = useMemo(() => {
    const chips: Array<{ k: string; label: string }> = [];

    if (values.orderStatus)
      chips.push({
        k: 'orderStatus',
        label: `وضعیت: ${statusLabelMap[values.orderStatus] || '—'}`,
      });

    if (values.productType && productLabelMap)
      chips.push({ k: 'productType', label: `نوع: ${productLabelMap[values.productType] || '—'}` });

    if (values.regionType && regionLabelMap)
      chips.push({ k: 'regionType', label: `منطقه: ${regionLabelMap[values.regionType] || '—'}` });

    if (values.operator != null && values.operator !== '')
      chips.push({ k: 'operator', label: `اپراتور: ${values.operator}` });

    if (values.userId) chips.push({ k: 'userId', label: `UserId: ${values.userId}` });
    if (values.phone) chips.push({ k: 'phone', label: `Phone: ${values.phone}` });
    if (values.gameAccountId)
      chips.push({ k: 'gameAccountId', label: `GameAcc: ${values.gameAccountId}` });

    return chips;
  }, [values, statusLabelMap, productLabelMap, regionLabelMap]);

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        position: 'relative',
      }}
    >
      {/* فیلتر سریع وضعیت */}
      {show.status && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ mb: 2, overflowX: 'auto', pb: 0.5 }}
          alignItems="center"
        >
          <Typography variant="body2" sx={{ minWidth: 72, color: 'text.secondary' }}>
            وضعیت:
          </Typography>
          <Chip
            label="همه"
            onClick={() => onChange({ orderStatus: undefined })}
            color={!values.orderStatus ? 'primary' : 'default'}
            variant={!values.orderStatus ? 'filled' : 'outlined'}
            size="small"
          />
          {Object.entries(statusLabelMap).map(([num, label]) => (
            <Chip
              key={num}
              label={label}
              onClick={() => onChange({ orderStatus: Number(num) })}
              color={values.orderStatus === Number(num) ? 'primary' : 'default'}
              variant={values.orderStatus === Number(num) ? 'filled' : 'outlined'}
              size="small"
            />
          ))}
        </Stack>
      )}

      {/* ورودی‌ها */}
      <Stack
        direction={{ sm: 'column', md: 'row' }}
        spacing={1.5}
        alignItems={{ xs: 'stretch', md: 'center' }}
        sx={{ mb: activeChips.length ? 1.5 : 0 , flexWrap: 'wrap' }}
      >
        {show.userId && (
          <TextField
            size="small"
            label="UserId"
            value={values.userId ?? ''}
            onChange={(e) => onChange({ userId: e.target.value })}
            sx={{ minWidth: isSm ? 1 : 260 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlineRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        )}

        {show.phone && (
          <TextField
            size="small"
            label="Phone"
            value={values.phone ?? ''}
            onChange={(e) => onChange({ phone: e.target.value })}
            sx={{ minWidth: isSm ? 1 : 180 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIphoneRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        )}

        {show.gameAccountId && (
          <TextField
            size="small"
            label="GameAccountId"
            value={values.gameAccountId ?? ''}
            onChange={(e) => onChange({ gameAccountId: e.target.value })}
            sx={{ minWidth: isSm ? 1 : 220 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SportsEsportsRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        )}

        {show.productType && productLabelMap && (
          <Select
            size="small"
            displayEmpty
            value={values.productType ?? ''}
            onChange={(e) =>
              onChange({ productType: e.target.value === '' ? undefined : Number(e.target.value) })
            }
            sx={{ minWidth: isSm ? 1 : 160 }}
          >
            <MenuItem value="">
              <Typography variant="body2" color="text.secondary">
                نوع محصول
              </Typography>
            </MenuItem>
            {Object.entries(productLabelMap).map(([k, v]) => (
              <MenuItem key={k} value={Number(k)}>
                {v}
              </MenuItem>
            ))}
          </Select>
        )}

        {show.regionType && regionLabelMap && (
          <Select
            size="small"
            displayEmpty
            value={values.regionType ?? ''}
            onChange={(e) =>
              onChange({ regionType: e.target.value === '' ? undefined : Number(e.target.value) })
            }
            sx={{ minWidth: isSm ? 1 : 140 }}
          >
            <MenuItem value="">
              <Typography variant="body2" color="text.secondary">
                منطقه
              </Typography>
            </MenuItem>
            {Object.entries(regionLabelMap).map(([k, v]) => (
              <MenuItem key={k} value={Number(k)}>
                {v}
              </MenuItem>
            ))}
          </Select>
        )}

        {show.operator && (
          <TextField
            size="small"
            type="number"
            label="Operator Id"
            value={values.operator ?? ''}
            onChange={(e) =>
              onChange({ operator: e.target.value === '' ? undefined : Number(e.target.value) })
            }
            sx={{ minWidth: isSm ? 1 : 160 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        )}

        <Box sx={{ flex: 1 }} />

        {/* اکشن‌ها برای اسکرین‌های کوچک دوباره تکرار نشه */}
        <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
          <Button onClick={onReset} variant="outlined" startIcon={<FilterAltOffRoundedIcon />}>
            ریست
          </Button>
          <Button onClick={onApply} variant="contained">
            جستجو
          </Button>
          {onRefresh && (
            <IconButton onClick={onRefresh} title="تازه‌سازی">
              <RefreshRoundedIcon />
            </IconButton>
          )}
        </Stack>
      </Stack>

      {/* خلاصهٔ فیلترهای فعال */}
      {activeChips.length > 0 && (
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {activeChips.map((c) => (
            <Chip
              key={c.k}
              label={c.label}
              onDelete={() =>
                onChange({
                  [c.k]: undefined,
                  ...(c.k === 'phone' || c.k === 'userId' || c.k === 'gameAccountId'
                    ? { [c.k]: '' }
                    : {}),
                })
              }
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
        </Stack>
      )}
    </Paper>
  );
}
