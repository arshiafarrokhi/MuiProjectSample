import { LoadingButton } from '@mui/lab';
import { Stack, Dialog, Button, DialogTitle, DialogContent, DialogActions } from '@mui/material';

import { Field } from 'src/components/hook-form';

export const AddPlainTextDialog = ({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  isDirty,
  authTrans,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isDirty: boolean;
  authTrans: any;
}) => (
  <Dialog open={open} onClose={onClose} aria-labelledby="text-dialog-title" maxWidth="sm" fullWidth>
    <DialogTitle id="text-dialog-title">{authTrans.t('add_text_title')}</DialogTitle>
    <DialogContent>
      <Stack spacing={2}>
        <Field.Text name="name" label={authTrans.t('name')} sx={{ mt: 1 }} />
        <Field.Text name="plainText" multiline rows={8} label={authTrans.t('user_prompt_label')} />
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>{authTrans.t('cancel')}</Button>
      <LoadingButton
        autoFocus
        onClick={onSubmit}
        variant="contained"
        loading={isSubmitting}
        disabled={!isDirty}
      >
        {authTrans.t('add')}
      </LoadingButton>
    </DialogActions>
  </Dialog>
);
