import type { Theme, SxProps } from '@mui/material/styles';

import { useState } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SettingsIcon from '@mui/icons-material/Settings';

import { useTranslate } from 'src/locales';
import { DashboardContent } from 'src/layouts/dashboard';

import { useAuthContext } from 'src/auth/hooks';

import { GetAgentApi } from '../api/getAgentsApi';
import AgentDialog from '../components/AgentDialog';
import { ListNotFoundView } from '../../error/list-not-found';

import type { inboxesType } from '../types';

// ----------------------------------------------------------------------

type Props = {
  sx?: SxProps<Theme>;
  inboxes: inboxesType[];
};

export function UsersView({ sx, inboxes }: Props) {
  const authTrans = useTranslate('pages , common');

  const { user } = useAuthContext();

  const [open, setOpen] = useState(false);
  const [selectedInbox, setSelectedInbox] = useState<inboxesType>();

  const { agents, agentsError, agentsLoading } = GetAgentApi(user?.account_id);

  const handleOpen = (inbox: inboxesType) => {
    setSelectedInbox(inbox);
    setOpen(true);
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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {inboxes.map((inboxesItem: inboxesType) => (
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
            key={inboxesItem.id}
          >
            <Box>
              <img
                src={inboxesItem.avatar_url}
                alt=""
                width={70}
                style={{ borderRadius: '50%', padding: '10px' }}
              />
              {inboxesItem.website_url}
            </Box>
            <div style={{ cursor: 'pointer' }} onClick={() => handleOpen(inboxesItem)}>
              <SettingsIcon color="action" />
            </div>
          </Box>
        ))}
        {/* select agenDialog */}
        <AgentDialog
          agents={agents}
          agentsError={agentsError}
          agentsLoading={agentsLoading}
          selectedInbox={selectedInbox}
          setSelectedInbox={setSelectedInbox}
          open={open}
          setOpen={setOpen}
        />
      </Box>
    </Box>
  );

  return (
    <DashboardContent maxWidth="xl">
      s
      <Typography variant="h4"> {authTrans.t('Users')} </Typography>
      {inboxes.length === 0 ? <ListNotFoundView /> : renderContent()}
    </DashboardContent>
  );
}
