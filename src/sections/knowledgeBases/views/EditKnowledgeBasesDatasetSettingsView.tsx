import type { Theme, SxProps } from '@mui/material/styles';
import type { TableHeadCellProps } from 'src/components/table/table-head-custom';

import { toast } from 'sonner';
import { z as zod } from 'zod';
import { useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { varAlpha } from 'minimal-shared/utils';
import React, { useState, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import { GridAddIcon } from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import { Card, Table, Stack, Button, TableRow, TableBody, TableCell } from '@mui/material';

import { useTranslate } from 'src/locales';
import { DashboardContent } from 'src/layouts/dashboard';

import { Form } from 'src/components/hook-form';
import { TableNoData } from 'src/components/table/table-no-data';
import CustomScrollbar from 'src/components/scrollbar/custom-scrollbar';
import { TableHeadCustom } from 'src/components/table/table-head-custom';

import { useAuthContext } from 'src/auth/hooks';

import { AddFileDialog } from '../components/AddFileDialog';
import { DeleteKBDSDialog } from '../components/DeleteKBDSDialog';
import { AddPlainTextDialog } from '../components/AddPlainTextDialog';
import { useSetKNUploadTextDSApi } from '../apis/dataSource/setKNUploadTextDSApi';
import { useSetKNUploadFileDSApi } from '../apis/dataSource/setKNUploadFileDSApi';
import { useDeleteKnowledgeBasesDS } from '../apis/dataSource/deleteKnowledgeBasesDSApi';

type Props = {
  sx?: SxProps<Theme>;
  mutateKnowledgeBaseDS?: any;
  knowledgeBaseDS?: any;
  knowledgeBaseDSValidating?: any;
  knowledgeBaseDSLoading?: any;
  knowledgeBaseDSError?: any;
};

export const NewProductSchema = (authTrans: ReturnType<typeof useTranslate>) =>
  zod.object({
    name: zod
      .string()
      .nonempty({ message: authTrans.t('Name is required!') })
      .max(20, { message: authTrans.t('Name must be no more than 20 characters!') }),
    plainText: zod.string().optional(),
  });

export default function EditKnowledgeBasesDatasetSettingsView({
  sx,
  mutateKnowledgeBaseDS,
  knowledgeBaseDS,
  knowledgeBaseDSValidating,
  knowledgeBaseDSLoading,
  knowledgeBaseDSError,
}: Props) {
  const authTrans = useTranslate('knowledgeBase');
  const schema = NewProductSchema(authTrans);

  const TABLE_HEAD: TableHeadCellProps[] = [
    { id: 'name', label: authTrans.t('name'), width: 100 },
    { id: 'num_chunks', label: authTrans.t('Chunk Number'), width: 100 },
    { id: 'num_characters', label: authTrans.t('Characters Number'), width: 120 },
    { id: 'created_at', label: authTrans.t('Upload Date'), width: 100 },
    { id: 'status', label: authTrans.t('status'), width: 150 },
    { id: 'progress', label: authTrans.t('progress'), width: 100 },
    { id: 'action', label: authTrans.t('action'), width: 100 },
  ];

  const [selectedDeleteSD, setSelectedDeleteSD] = useState<number | undefined>();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAddFileDialog, setOpenAddFileDialog] = useState(false);
  const [openAddPlainTextDialog, setOpenAddPlainTextDialog] = useState(false);
  const { knId, knName } = useParams();
  const { user } = useAuthContext();
  const [files, setFiles] = useState<(File | string)[]>([]);
  const { useSetKNUploadFileDS: setKNUploadFileDS } = useSetKNUploadFileDSApi(
    user?.account_id,
    knId
  );
  const { useSetKNUploadTextDS: setKNUploadTextDS } = useSetKNUploadTextDSApi(
    user?.account_id,
    knId
  );

  const defaultValues = {
    file: {},
    name: '',
    plainText: '',
  };

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = methods;

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      console.log('Dropped files:', acceptedFiles);
      console.log(
        'File types:',
        acceptedFiles.map((file) => file.type)
      );
      if (files.length > 0) {
        toast.warning(authTrans.t('Please remove the currently uploaded file first.'));
      } else {
        setFiles(acceptedFiles);
      }
    },
    [files, authTrans]
  );

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (openAddFileDialog) {
        if (files.length === 0) {
          toast.warning(authTrans.t('Please upload a file before submitting.'));
          return;
        }
        const formData = new FormData();
        formData.append('name', data.name);
        if (files.length > 0) {
          formData.append('file', files[0]);
        }
        try {
          await setKNUploadFileDS(formData);
          toast.success(authTrans.t('File uploaded successfully!'));
          setOpenAddFileDialog(false);
          reset();
          setFiles([]);
          mutateKnowledgeBaseDS();
          handleClose();
        } catch (error) {
          setFiles([]);
          console.error('Unexpected Error:', error);
          toast(authTrans.t('An unexpected error occurred'));
        }
      } else if (openAddPlainTextDialog) {
        const payload = {
          name: data.name,
          text: data.plainText,
        };
        try {
          await setKNUploadTextDS(payload);
          toast.success(authTrans.t('Text uploaded successfully!'));
          setOpenAddPlainTextDialog(false);
          reset();
          mutateKnowledgeBaseDS();
          handleClose();
        } catch (error) {
          console.error('Unexpected Error:', error);
          toast(authTrans.t('An unexpected error occurred'));
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(authTrans.t('Upload failed!'));
    }
  });

  const { deleteKnowledgeBasesDS } = useDeleteKnowledgeBasesDS(
    user?.account_id,
    knId,
    String(selectedDeleteSD)
  );

  const handleDelete = (selectedSD: number) => {
    setSelectedDeleteSD(selectedSD);
    setOpenDeleteDialog(true);
  };

  const handleClose = (): void => {
    setOpenDeleteDialog(false);
    setOpenAddFileDialog(false);
    setOpenAddPlainTextDialog(false);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await deleteKnowledgeBasesDS();
      if (response?.status === 204) {
        toast.success(authTrans.t('delete_success'));
        mutateKnowledgeBaseDS();
      }
    } catch (err) {
      console.log(err);
      toast.error(authTrans.t('delete_error'));
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '-';

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    return date.toLocaleString(undefined, options);
  };

  const statusMapping = {
    in_queue: authTrans.t('Waiting to process'),
    extracting_text: authTrans.t('Extracting text'),
    chunking: authTrans.t('Preparing text'),
    embedding: authTrans.t('Analyzing text'),
    finished: authTrans.t('Ready'),
    failure: authTrans.t('Error occurred'),
  };

  const renderContent = () => (
    <Box
      sx={[
        (theme) => ({
          px: 1,
          py: 3,
          mt: 3,
          border: `dashed 1px ${theme.vars.palette.divider}`,
          bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Card>
        <Box sx={{ position: 'relative' }}>
          <CustomScrollbar>
            <Table>
              <TableHeadCustom headCells={TABLE_HEAD} />
              <TableBody>
                {knowledgeBaseDS?.length === 0 ? (
                  <TableNoData notFound />
                ) : (
                  knowledgeBaseDS?.map((dataSource: any) => (
                    <TableRow hover tabIndex={-1} key={dataSource.id}>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{dataSource.name ?? '-'}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {dataSource.num_chunks ?? '-'}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {dataSource.num_characters ?? '-'}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {formatDate(dataSource.created_at)}{' '}
                      </TableCell>
                      <TableCell>
                        {statusMapping[dataSource.status as keyof typeof statusMapping] ?? '-'}
                      </TableCell>
                      <TableCell>{dataSource.progress ?? '-'}</TableCell>
                      <TableCell>
                        <DeleteIcon
                          sx={{
                            border: '1px solid white',
                            p: '2px',
                            borderRadius: 50,
                            borderColor: 'GrayText',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleDelete(dataSource.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CustomScrollbar>
        </Box>
        {/* {apiKeys.length !== 0 && (
          <TablePaginationCustom
            page={page - 1}
            count={apiKeysCount}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            disabled={apiKeysLoading}
            rowsPerPageOptions={[]}
          />
        )} */}
      </Card>
      {/* Delete Dialog */}
      <DeleteKBDSDialog
        open={openDeleteDialog}
        onClose={handleClose}
        onConfirm={handleConfirmDelete}
        authTrans={authTrans}
      />
      {/* Add File Dialog */}
      <AddFileDialog
        open={openAddFileDialog}
        onClose={handleClose}
        onSubmit={onSubmit}
        files={files}
        handleDrop={handleDrop}
        setFiles={setFiles}
        isSubmitting={isSubmitting}
        isDirty={isDirty}
        authTrans={authTrans}
      />
      {/* Add Plain Text Dialog */}
      <AddPlainTextDialog
        open={openAddPlainTextDialog}
        onClose={handleClose}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        isDirty={isDirty}
        authTrans={authTrans}
      />
    </Box>
  );

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <DashboardContent maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography variant="h4">{authTrans.t('Edit knowledgeBases')}</Typography>
            <Typography
              variant="h4"
              sx={[
                (theme) => ({
                  color: theme.vars.palette.primary.dark,
                }),
              ]}
            >
              {knName}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button
              color="primary"
              sx={[
                (theme) => ({
                  bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.2),
                }),
              ]}
              onClick={() => setOpenAddPlainTextDialog(!openAddPlainTextDialog)}
            >
              <GridAddIcon />
              {authTrans.t('Add Plain text')}
            </Button>
            <Button
              color="primary"
              sx={[
                (theme) => ({
                  bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.2),
                }),
              ]}
              onClick={() => setOpenAddFileDialog(!openAddFileDialog)}
            >
              <GridAddIcon />
              {authTrans.t('Add File')}
            </Button>
          </Stack>
        </Box>
        {renderContent()}
      </DashboardContent>
    </Form>
  );
}
