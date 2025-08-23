import type { SelectChangeEvent } from '@mui/material';

import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';

import CancelIcon from '@mui/icons-material/Cancel';
import {
  Box,
  Stack,
  Select,
  Dialog,
  Button,
  MenuItem,
  InputLabel,
  Typography,
  FormControl,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';

import { useTranslate } from 'src/locales';

import { useAuthContext } from 'src/auth/hooks';

import { useSetAgentBot } from '../api/setAgentBotApi';
import { GetDefaultAgentsApi } from '../api/getDefaultAgentsApi';

import type { AgentsType } from '../types';

const AgentDialog = ({
  agents,
  agentsError,
  agentsLoading,
  open,
  setOpen,
  setSelectedInbox,
  selectedInbox,
}: any) => {
  const authTrans = useTranslate('inboxes');
  const { user } = useAuthContext();

  const [selectedAgent, setSelectedAgent] = useState('');

  const { setAgentBot } = useSetAgentBot(user?.account_id, selectedInbox?.id);
  const { DefaultAgents, DefaultAgentsLoading, DefaultAgentsmutate } = GetDefaultAgentsApi(
    user?.account_id,
    selectedInbox?.id
  );

  useEffect(() => {
    if (!DefaultAgentsLoading) {
      setSelectedAgent(DefaultAgents && DefaultAgents.id !== undefined ? DefaultAgents.id : '');
    }
  }, [DefaultAgentsLoading, DefaultAgents]);

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedAgent(event.target.value as string);
  };

  const handleUpdate = async () => {
    try {
      await setAgentBot(selectedAgent);
      console.log('Bot change successfully');
      toast(authTrans.t('change agent bot successfully!'));
      DefaultAgentsmutate();
    } catch (err) {
      console.error('Error:', err);
      toast(authTrans.t('change agent bot failed!'));
    }
    setOpen(false);
  };

  const handleDisconnect = async () => {
    try {
      await setAgentBot('');
      console.log('Bot removed successfully');
      toast(authTrans.t('remove agent bot successfully!'));
      DefaultAgentsmutate();
    } catch (err) {
      console.error('Error:', err);
      toast(authTrans.t('remove agent bot failed!'));
    }
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogContent sx={{ gap: 5 }}>
        <DialogContentText
          id="alert-dialog-description"
          sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}
        >
          <CancelIcon sx={{ alignSelf: 'flex-end', cursor: 'pointer' }} onClick={handleClose} />
          <Typography variant="h4">{authTrans.t('Select an agent bot')}</Typography>
          <Stack direction="row" spacing={1}>
            {authTrans.t('Inbox Name')} :
            <Typography
              sx={[
                (theme) => ({
                  color: theme.vars.palette.primary.dark,
                }),
              ]}
            >
              {selectedInbox ? selectedInbox.website_url : 'Loading...'}
            </Typography>
          </Stack>
          <Typography variant="body2">
            {authTrans.t(
              'Assign an Agent Bot to your inbox. They can handle initial conversations and transfer them to a live agent when necessary.'
            )}
          </Typography>
          <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">{authTrans.t('Bots')}</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={selectedAgent}
                label="agent"
                onChange={handleChange}
              >
                {agentsLoading && agentsError ? (
                  <Typography> {authTrans.t('Loading...')} :</Typography>
                ) : (
                  agents?.map((agent: AgentsType) => (
                    <MenuItem key={agent?.name} value={agent?.id}>
                      {agent?.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Box>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleUpdate} color="success">
          {authTrans.t('Update')}
        </Button>
        <Button onClick={handleDisconnect} autoFocus color="error">
          {authTrans.t('Disconnect Bot')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AgentDialog;
