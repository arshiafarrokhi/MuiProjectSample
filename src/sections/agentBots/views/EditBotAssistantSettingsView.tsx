import type { Theme, SxProps } from '@mui/material/styles';

import { toast } from 'sonner';
import { z as zod } from 'zod';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { varAlpha } from 'minimal-shared/utils';
import { useParams, useNavigate } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { Stack, Button, MenuItem } from '@mui/material';

import { useTranslate } from 'src/locales';
import { DashboardContent } from 'src/layouts/dashboard';

import { Form, Field } from 'src/components/hook-form';

import { GetKnowledgeBasesApi } from 'src/sections/knowledgeBases/apis/getKnowledgeBasesApi';

import { useAuthContext } from 'src/auth/hooks';

import { usePatchEditBot } from '../api/patchEditBotApi';

type Props = {
  sx?: SxProps<Theme>;
  DefaultEditBot: any;
};

export const getEventSchema = (authTrans: ReturnType<typeof useTranslate>) =>
  zod.object({
    botName: zod
      .string()
      .min(1, { message: authTrans.t('title_required') })
      .max(10, { message: authTrans.t('title_max_length') }),
    botDescription: zod
      .string()
      .min(1, { message: authTrans.t('description_required') })
      .max(200, { message: authTrans.t('description_max_length') }),
    knowledgeBases: zod.number({ invalid_type_error: authTrans.t('knowledgeBases_required') }),
  });

export default function EditBotAssistantSettingsView({ sx, DefaultEditBot }: Props) {
  const authTrans = useTranslate('bots');
  const schema = getEventSchema(authTrans);

  const { botId, botName } = useParams();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const { setPatchEditBot } = usePatchEditBot(user?.account_id, botId);

  const { knowledgeBases, knowledgeBasesError, knowledgeBasesLoading, mutateKnowledgeBases } =
    GetKnowledgeBasesApi(user?.account_id);
  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(schema),
    defaultValues: {
      botName: DefaultEditBot.name || '',
      botDescription: DefaultEditBot.description || '',
      knowledgeBases: DefaultEditBot?.knowledge_base?.id || 0,
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = methods;

  useEffect(() => {
    if (DefaultEditBot) {
      reset({
        botName: DefaultEditBot.name || '',
        botDescription: DefaultEditBot.description || '',
        knowledgeBases: DefaultEditBot?.knowledge_base?.id || 0,
      });
    }
  }, [DefaultEditBot, reset]);

  const onSubmit = handleSubmit(async (data) => {
    const eventData = {
      name: data?.botName,
      description: data?.botDescription,
      knowledge_base: data.knowledgeBases,
    };

    try {
      await setPatchEditBot(eventData);
      toast(authTrans.t('change agent bot successfully!'));
    } catch (error) {
      console.error('Unexpected Error:', error);
      toast(authTrans.t('An unexpected error occurred!'));
    }
  });

  const renderContent = () => (
    <Box
      sx={[
        (theme) => ({
          p: 5,
          mt: 3,
          width: 1,
          border: `dashed 1px ${theme.vars.palette.divider}`,
          bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box sx={{ gap: 5, display: 'flex', flexDirection: 'column' }}>
        <Field.Text name="botName" label={authTrans.t('bot Name')} />
        <Field.Text name="botDescription" multiline rows={8} label={authTrans.t('description')} />
        {knowledgeBases && (
          <Field.Select name="knowledgeBases" label={authTrans.t('knowledgeBases-lable')}>
            {knowledgeBases.map((option: any) => (
              <MenuItem key={option.id} value={option.id} sx={{ textTransform: 'capitalize' }}>
                {option.name}
              </MenuItem>
            ))}
          </Field.Select>
        )}
      </Box>
    </Box>
  );

  return (
    <DashboardContent maxWidth="xl">
      <Stack direction="row" alignItems="center" gap={1}>
        <Typography variant="h4">{authTrans.t('edit_robot')}</Typography>{' '}
        <Typography
          variant="h4"
          sx={[
            (theme) => ({
              color: theme.vars.palette.primary.dark,
            }),
          ]}
        >
          {botName}
        </Typography>
      </Stack>
      <Form methods={methods} onSubmit={onSubmit}>
        {renderContent()}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <LoadingButton
            disabled={!isDirty}
            sx={{ height: 40, mt: 3 }}
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            {authTrans.t('save_changes')}
          </LoadingButton>
          <Button variant="outlined" onClick={() => navigate(-1)} sx={{ height: 45, mt: 3 }}>
            {authTrans.t('go_back')}
          </Button>
        </Box>
      </Form>
    </DashboardContent>
  );
}
