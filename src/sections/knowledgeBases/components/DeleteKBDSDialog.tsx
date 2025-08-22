import {
  Dialog,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';

export const DeleteKBDSDialog = ({
  open,
  onClose,
  onConfirm,
  authTrans,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  authTrans: any;
}) => (
  <Dialog
    open={open}
    onClose={onClose}
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
      <Button onClick={onClose}>{authTrans.t('cancel')}</Button>
      <Button onClick={onConfirm} autoFocus color="error">
        {authTrans.t('delete')}
      </Button>
    </DialogActions>
  </Dialog>
);
