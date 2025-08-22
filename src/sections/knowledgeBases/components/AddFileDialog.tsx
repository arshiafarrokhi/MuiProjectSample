import { LoadingButton } from '@mui/lab';
import {
  Box,
  Stack,
  Dialog,
  Button,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { Field } from 'src/components/hook-form';
import { UploadBox } from 'src/components/upload';

export const AddFileDialog = ({
  open,
  onClose,
  onSubmit,
  files,
  handleDrop,
  setFiles,
  isSubmitting,
  isDirty,
  authTrans,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  files: (File | string)[];
  handleDrop: (acceptedFiles: File[]) => void;
  setFiles: (files: (File | string)[]) => void;
  isSubmitting: boolean;
  isDirty: boolean;
  authTrans: any;
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
    maxWidth="sm"
    fullWidth
  >
    <DialogTitle id="alert-dialog-title">{authTrans.t('delete_add_file_title')}</DialogTitle>
    <DialogContent>
      <Stack id="alert-dialog-description" spacing={2}>
        <Field.Text name="name" label={authTrans.t('name')} sx={{ mt: 1 }} />
        <Stack spacing={1.5}>
          <UploadBox
            onDrop={handleDrop}
            thumbnail
            maxSize={1000000}
            accept={{
              'text/plain': ['.txt'],
              'application/msword': ['.doc', '.dot'],
              'application/vnd.ms-word': ['.doc', '.dot'],
              'application/vnd.ms-word.document.macroEnabled.12': ['.docm'],
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
              'application/vnd.openxmlformats-officedocument.wordprocessingml.template': ['.dotx'],
              'application/pdf': ['.pdf'],
              'application/x-pdf': ['.pdf'],
              'application/acrobat': ['.pdf'],
              'application/x-download': ['.pdf'],
              'application/octet-stream': ['.pdf'],
              'application/vnd.pdf': ['.pdf'],
              'application/rtf': ['.rtf'],
              'text/rtf': ['.rtf'],
              'application/vnd.oasis.opendocument.text': ['.odt'],
              'application/x-vnd.oasis.opendocument.text': ['.odt'],
            }}
            multiple={false}
            placeholder={
              files.length > 0 ? (
                <Typography variant="body2">{(files[0] as File).name}</Typography>
              ) : (
                <Box
                  sx={{
                    gap: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    color: 'text.disabled',
                    flexDirection: 'column',
                  }}
                >
                  <Iconify icon="eva:cloud-upload-fill" width={40} />
                  <Typography variant="body2">{authTrans.t('Upload file')}</Typography>
                </Box>
              )
            }
            sx={{
              py: 2.5,
              width: 'auto',
              height: 'auto',
              borderRadius: 1.5,
            }}
          />
          {files.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => setFiles([])}
              sx={{ alignSelf: 'flex-start', mt: 1 }}
            >
              {authTrans.t('Remove selected file')}
            </Button>
          )}
        </Stack>
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="error">
        {authTrans.t('cancel')}
      </Button>
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
