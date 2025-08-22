import React from 'react';
import { toast } from 'sonner';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Button, Dialog, DialogTitle, DialogContent } from '@mui/material';

import { useTranslate } from 'src/locales';

import { Form, Field } from 'src/components/hook-form';

import { useAuthContext } from 'src/auth/hooks';

import { useSetCreateKnowledgeBases } from '../apis/setCreateKnowledgeBasesApi';

type Props = {
  openAddDialog: boolean;
  handleClose: () => void;
};

export const getEventSchema = (authTrans: ReturnType<typeof useTranslate>) =>
  zod.object({
    name: zod
      .string()
      .min(1, { message: authTrans.t('Name is required!') })
      .max(10, { message: authTrans.t('Name must be less than 10 characters') }),
    description: zod
      .string()
      .min(1, { message: authTrans.t('Description is required!') })
      .max(200, { message: authTrans.t('Description must be at least 200 characters') }),
  });

const AddKBDialog = ({ handleClose, openAddDialog }: Props) => {
  const { user } = useAuthContext();
  const authTrans = useTranslate('knowledgeBase');

  const { setCreateKnowledgeBases } = useSetCreateKnowledgeBases(user?.account_id);

  const schema = getEventSchema(authTrans);

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(schema),
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    const eventData = {
      name: data.name,
      description: data.description,
    };

    try {
      await setCreateKnowledgeBases(eventData);
      toast(authTrans.t('add agent KnowledgeBases successfully'));
      reset();
      handleClose();
    } catch (error) {
      console.error('Unexpected Error:', error);
      toast(authTrans.t('An unexpected error occurred'));
      reset();
      handleClose();
    }
  });

  return (
    <Dialog
      open={openAddDialog}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle id="alert-dialog-title">{authTrans.t('add_knowledgebases')}</DialogTitle>
        <DialogContent>
          <Field.Text name="name" label={authTrans.t('name')} sx={{ mt: 1 }} />
          <Field.Text name="description" label={authTrans.t('description')} sx={{ marginY: 2 }} />
        </DialogContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
            padding: 1,
          }}
        >
          <Button onClick={handleClose}>{authTrans.t('cancel')}</Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {authTrans.t('save')}
          </LoadingButton>
        </Box>
      </Form>
    </Dialog>
  );
};

export default AddKBDialog;
