import type { KeyedMutator } from 'swr';
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

import { useAuthContext } from 'src/auth/hooks';

import { usePatchEditBot } from '../api/patchEditBotApi';

import type { LLMModelType, BotsDetailType } from '../types';

type Props = {
  sx?: SxProps<Theme>;
  DefaultEditBot: BotsDetailType;
  Llms: LLMModelType[] | undefined;
  mutateLlms: KeyedMutator<LLMModelType[]>;
};

const marks = [
  {
    value: 0,
    label: 'accuracy_label',
  },
  {
    value: 100,
    label: 'creativity_label',
  },
];

export const getEventSchema = (authTrans: ReturnType<typeof useTranslate>) =>
  zod.object({
    systemPrompt: zod
      .string()
      .min(1, { message: authTrans.t('title_required') })
      .max(1000, { message: authTrans.t('title_max_length') }),
    userPrompt: zod
      .string()
      .min(1, { message: authTrans.t('description_required') })
      .max(3000, { message: authTrans.t('description_max_length') }),
    accuracy: zod.number().min(0).max(100),
    model: zod.string().min(1, { message: authTrans.t('model_required') }),
  });

export default function EditBotModelSettingsSettingView({ sx, DefaultEditBot, Llms }: Props) {
  const authTrans = useTranslate('bots');
  const schema = getEventSchema(authTrans);

  const { botId, botName } = useParams();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const { setPatchEditBot } = usePatchEditBot(user?.account_id, botId);

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(schema),
    defaultValues: {
      accuracy: (DefaultEditBot?.temperature ?? 0) * 100,
      model: DefaultEditBot?.llm_model || '',
      systemPrompt: DefaultEditBot?.system_prompt || '',
      userPrompt: DefaultEditBot?.user_prompt || '',
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
        accuracy: (DefaultEditBot?.temperature ?? 50) * 100,
        model: DefaultEditBot.llm_model || '',
        systemPrompt: DefaultEditBot.system_prompt || '',
        userPrompt: DefaultEditBot.user_prompt || '',
      });
    }
  }, [DefaultEditBot, reset]);

  const onSubmit = handleSubmit(async (data) => {
    const eventData = {
      temperature: (data?.accuracy ?? 0) / 100,
      llm_model: data?.model,
      system_prompt: data?.systemPrompt,
      user_prompt: data?.userPrompt,
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
        <Field.Slider
          title={authTrans.t('sensitivity')}
          aria-label={authTrans.t('always_visible')}
          valueLabelDisplay="on"
          name="accuracy"
          min={0}
          max={100}
          marks={marks.map((mark) => ({
            ...mark,
            label: authTrans.t(mark.label),
          }))}
        />
        {Llms && (
          <Field.Select name="model" label={authTrans.t('model_label')}>
            {Llms.map((option: LLMModelType) => (
              <MenuItem key={option.name} value={option.name} sx={{ textTransform: 'capitalize' }}>
                {option.name}
              </MenuItem>
            ))}
          </Field.Select>
        )}
        <Field.Text
          name="systemPrompt"
          multiline
          rows={4}
          label={authTrans.t('system_prompt_label')}
        />
        <Field.Text name="userPrompt" multiline rows={8} label={authTrans.t('user_prompt_label')} />
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
