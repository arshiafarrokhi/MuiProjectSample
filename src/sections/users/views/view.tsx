import type { Theme, SxProps } from '@mui/material/styles';

import { useState, useEffect } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SettingsIcon from '@mui/icons-material/Settings';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

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
  users?: any[];
  activeOnly?: boolean;
  setActiveOnly?: (v: boolean) => void;
};

export function UsersView({ sx, users, activeOnly, setActiveOnly }: Props) {
  console.log(users);
  const { user } = useAuthContext();
  // accept activeOnly and setter via props to control filtering in parent
  // defaults handled by parent
  const [open, setOpen] = useState(false);
  const [selectedInbox, setSelectedInbox] = useState<inboxesType>();

  // local state mirrors prop when prop exists
  const [localActiveOnly, setLocalActiveOnly] = useState<boolean>(activeOnly ?? true);

  // sync local state when prop changes
  useEffect(() => {
    if (typeof activeOnly === 'boolean') setLocalActiveOnly(activeOnly);
  }, [activeOnly]);

  const handleToggleActive = (value: boolean) => {
    setLocalActiveOnly(value);
    if (typeof setActiveOnly === 'function') setActiveOnly(value);
  };
  const handleOpen = (inbox: inboxesType) => {
    setSelectedInbox(inbox);
    setOpen(true);
  };

  const renderContent = () => {
    const safeUsers = Array.isArray(users) ? users : [];

    return (
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!localActiveOnly}
                  onChange={(e) => handleToggleActive(e.target.checked)}
                  color="primary"
                />
              }
              label="کاربر فعال"
            />
          </Box>
          {safeUsers.map((usersItem: any) => (
            <Box
              sx={[
                (theme) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  paddingX: '15px',
                  paddingY: '15px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                }),
                ...(Array.isArray(sx) ? sx : [sx]),
              ]}
              key={usersItem.id}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: 90,
                }}
              >
                <img
                  src={usersItem.avatar}
                  alt={usersItem.fName + ' ' + usersItem.lName}
                  width={70}
                  style={{ borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  {usersItem.fName} {usersItem.lName}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {usersItem.phone}
                </Typography>
                {/* {usersItem.website_url && (
                    <Typography variant="body2" color="primary">
                      {usersItem.website_url}
                    </Typography>
                  )} */}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SettingsIcon
                  color="action"
                  sx={{ cursor: 'pointer', fontSize: 28 }}
                  onClick={() => handleOpen(usersItem)}
                />
              </Box>
            </Box>
          ))}
          {/* select agenDialog */}
          {/* <AgentDialog
          agents={agents}
          agentsError={agentsError}
          agentsLoading={agentsLoading}
          selectedInbox={selectedInbox}
          setSelectedInbox={setSelectedInbox}
          open={open}
          setOpen={setOpen}
        /> */}
        </Box>
      </Box>
    );
  };

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4"> کاربران </Typography>
      {renderContent()}
    </DashboardContent>
  );
}
