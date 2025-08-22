import React from 'react';
import { toast } from 'sonner';

import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';

import { useTranslate } from 'src/locales';

import { useAuthContext } from 'src/auth/hooks';

import { useDeleteBot } from '../api/deleteBotApi';

const DeleteAgentBotDialog = ({
  openDeleteDialog,
  setOpenDeleteDialog,
  handleClose,
  selectedDeleteBot,
  mutateBots,
}: any) => {
  const authTrans = useTranslate('bots');

  const { user } = useAuthContext();

  const { deleteBot } = useDeleteBot(user?.account_id, selectedDeleteBot ?? '');

  const handleConfirmDelete = async () => {
    if (!selectedDeleteBot) return;
    try {
      await deleteBot();
      toast.success(authTrans.t('delete_success'));
      mutateBots();
    } catch (err) {
      console.log(err);
      toast.error(authTrans.t('delete_error'));
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  return (
    <Dialog
      open={openDeleteDialog}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{authTrans.t('delete_dialog_title')}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {authTrans.t('delete_dialog_content')}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{authTrans.t('cancel')}</Button>
        <Button onClick={handleConfirmDelete} autoFocus color="error">
          {authTrans.t('delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteAgentBotDialog;
