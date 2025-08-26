// src/sections/products/views/view.tsx
import type { Theme, SxProps } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';

import {
  Box,
  Button,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Stack,
  Tooltip,
  Chip,
  IconButton,
  Collapse,
  Grid,
  Divider,
  TableContainer,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { DashboardContent } from 'src/layouts/dashboard';

type Props = {
  sx?: SxProps<Theme>;
  productSim?: any[];
  currency?: string;
  onRefetch?: () => void;
};

export function ProductSimView({ sx, productSim, currency, onRefetch }: Props) {
  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4">محصولات</Typography>

      <Box
        sx={[
          (theme) => ({
            p: 3,
            mt: 5,
            width: 1,
            border: `dashed 1px ${theme.vars.palette.divider}`,
            bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
          }),
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ]}
      ></Box>
    </DashboardContent>
  );
}
