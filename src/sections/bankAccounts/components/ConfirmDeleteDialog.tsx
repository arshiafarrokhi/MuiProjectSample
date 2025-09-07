import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

export default function ConfirmDeleteDialog({
  open,
  title,
  description,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title ?? 'حذف'}</DialogTitle>
      <DialogContent>
        <Typography variant="body2">{description ?? 'آیا از حذف این مورد مطمئن هستید؟'}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>انصراف</Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={loading}>
          حذف
        </Button>
      </DialogActions>
    </Dialog>
  );
}
