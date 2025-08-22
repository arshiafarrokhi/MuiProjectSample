import type { Theme, SxProps } from '@mui/material/styles';

import { toast } from 'sonner';
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
import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';

import { useAuthContext } from 'src/auth/hooks';

import { useDeleteBot } from '../api/deleteBotApi';
import { ListNotFoundView } from '../../error/list-not-found';
import AddAgentBotDialog from '../components/AddAgentBotDialog';
import DeleteAgentBotDialog from '../components/DeleteAgentBotDialog';

import type { BotsType } from '../types';

type Props = {
  sx?: SxProps<Theme>;
  bots: BotsType[] | undefined;
  mutateBots: any;
};

export function AgentBotsView({ sx, bots, mutateBots }: Props) {
  const navigate = useNavigate();
  const authTrans = useTranslate('bots');

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedDeleteBot, setSelectedDeleteBot] = useState<string>('');

  const handleDelete = (selectedBot: number) => {
    setSelectedDeleteBot(selectedBot.toString());
    setOpenDeleteDialog(true);
  };

  const handleEditSettingBot = (botId: number, botName: string) => {
    navigate(paths.dashboard.agentBots.edit(botId, botName));
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
        {bots?.map((botsItem: BotsType) => (
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
            key={botsItem.id}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, paddingY: 2 }}>
              <img
                src={`${CONFIG.assetsDir}/Avatar.png`}
                alt=""
                width={70}
                style={{ borderRadius: '50%', padding: '10px' }}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body1">
                  {botsItem.name} - {botsItem.llm_model}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {botsItem.description}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <div style={{ cursor: 'pointer' }} onClick={() => handleDelete(botsItem.id)}>
                <DeleteIcon color="action" />
              </div>
              <div
                style={{ cursor: 'pointer' }}
                onClick={() => handleEditSettingBot(botsItem.id, botsItem.name)}
              >
                <SettingsIcon color="action" />
              </div>
            </Box>
          </Box>
        ))}
      </Box>
      {/* Delete Dialog */}
      <DeleteAgentBotDialog
        selectedDeleteBot={selectedDeleteBot}
        setOpenDeleteDialog={setOpenDeleteDialog}
        handleClose={() => setOpenDeleteDialog(false)}
        openDeleteDialog={openDeleteDialog}
        mutateBots={mutateBots}
      />
    </Box>
  );

  return (
    <DashboardContent maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">{authTrans.t('Agent Bots')}</Typography>
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
          {authTrans.t('Add Bot')}
        </Button>
      </Box>
      {bots?.length === 0 ? <ListNotFoundView /> : renderContent()}
      {/* Add Dialog */}
      <AddAgentBotDialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} />
    </DashboardContent>
  );
}
