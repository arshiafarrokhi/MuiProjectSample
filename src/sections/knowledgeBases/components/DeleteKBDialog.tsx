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

import { useDeleteKnowledgeBases } from '../apis/deleteKnowledgeBasesApi';

const DeleteKBDialog = ({
  openDeleteDialog,
  setOpenDeleteDialog,
  handleClose,
  selectedDeleteKnowledgeBases,
  mutateKnowledgeBases,
}: any) => {
  const { user } = useAuthContext();
  const authTrans = useTranslate('knowledgeBase');

  const { deleteKnowledgeBases } = useDeleteKnowledgeBases(
    user?.account_id,
    String(selectedDeleteKnowledgeBases)
  );

  const handleConfirmDelete = async () => {
    try {
      const response = await deleteKnowledgeBases();
      if (response?.status === 204) {
        toast.success(authTrans.t('delete_success'));
        mutateKnowledgeBases();
      }
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
      <DialogTitle id="alert-dialog-title">{authTrans.t('delete_dialog_title_head')}</DialogTitle>
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

export default DeleteKBDialog;
