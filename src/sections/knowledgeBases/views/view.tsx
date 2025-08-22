import type { KeyedMutator } from 'swr';
import type { Theme, SxProps } from '@mui/material/styles';

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';

import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales';
import { DashboardContent } from 'src/layouts/dashboard';

import { ListNotFoundView } from 'src/sections/error/list-not-found';

import AddKBDialog from '../components/AddKBDialog';
import DeleteKBDialog from '../components/DeleteKBDialog';

import type { knowledgeBasesType } from '../types';

// ----------------------------------------------------------------------

type Props = {
  sx?: SxProps<Theme>;
  mutateKnowledgeBases: KeyedMutator<knowledgeBasesType[]>;
  knowledgeBases: knowledgeBasesType[];
};

export function KnowledgeBasesView({ sx, knowledgeBases, mutateKnowledgeBases }: Props) {
  const navigate = useNavigate();

  const authTrans = useTranslate('knowledgeBase');

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedDeleteKnowledgeBases, setSelectedDeleteKnowledgeBases] = useState<
    number | undefined
  >();

  const handleDelete = (selectedKnowledgeBases: number) => {
    setSelectedDeleteKnowledgeBases(selectedKnowledgeBases);
    setOpenDeleteDialog(true);
  };

  const handleEditSettingKnowledgeBases = (
    KnowledgeBasesId: number,
    KnowledgeBasesName: string
  ) => {
    navigate(paths.dashboard.KnowledgeBases.edit(KnowledgeBasesId, KnowledgeBasesName));
  };

  const renderContent = () => (
    <Box
      sx={[
        (theme) => ({
          p: 3,
          mt: 5,
          width: 1,
          border: `dashed 1px ${theme.vars.palette.divider}`,
          bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {knowledgeBases.map((knowledgeBasesItem: knowledgeBasesType) => (
          <Box
            sx={[
              (theme) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                paddingX: '15px',
                borderRadius: '12px',
                overflow: 'hidden',
                bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
              }),
              ...(Array.isArray(sx) ? sx : [sx]),
            ]}
            key={knowledgeBasesItem.id}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, paddingY: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body1">{knowledgeBasesItem.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {knowledgeBasesItem.description}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <div
                style={{ cursor: 'pointer' }}
                onClick={() => handleDelete(knowledgeBasesItem.id)}
              >
                <DeleteIcon color="action" />
              </div>
              <div
                style={{ cursor: 'pointer' }}
                onClick={() =>
                  handleEditSettingKnowledgeBases(knowledgeBasesItem.id, knowledgeBasesItem.name)
                }
              >
                <SettingsIcon color="action" />
              </div>
            </Box>
          </Box>
        ))}
      </Box>
      {/* Delete Dialog */}
      <DeleteKBDialog
        openDeleteDialog={openDeleteDialog}
        setOpenDeleteDialog={setOpenDeleteDialog}
        handleClose={() => setOpenDeleteDialog(false)}
        selectedDeleteKnowledgeBases={selectedDeleteKnowledgeBases}
        mutateKnowledgeBases={mutateKnowledgeBases}
      />
    </Box>
  );

  return (
    <DashboardContent maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">{authTrans.t('agent_knowledgebases')}</Typography>
        <Button
          color="primary"
          sx={[
            (theme) => ({
              bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.2),
            }),
          ]}
          onClick={() => setOpenAddDialog(true)}
        >
          <AddIcon />
          {authTrans.t('add_knowledgebases')}
        </Button>
      </Box>{' '}
      {knowledgeBases.length === 0 ? <ListNotFoundView /> : renderContent()}
      {/* Add Dialog */}
      <AddKBDialog handleClose={() => setOpenAddDialog(false)} openAddDialog={openAddDialog} />
    </DashboardContent>
  );
}
