import type { Theme, SxProps } from '@mui/material/styles';

import { z as zod } from 'zod';
import { toast } from 'sonner';
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

import { usePatchEditKnowledgeBasesApi } from '../apis/patchEditKnowledgeBasesApi';

import type { ChunkMethodsType, KnowledgeBaseSelectedType } from '../types';

type Props = {
  sx?: SxProps<Theme>;
  DefaultEditKnowledgeBases: KnowledgeBaseSelectedType;
  ChunkMethods: ChunkMethodsType[];
};

type SliderProps = {
  sliderName: string;
  min: number;
  max: number;
  HtmlName: string;
  step?: number;
};

export const Slider = ({ sliderName, min, max, HtmlName, step }: SliderProps) => {
  const authTrans = useTranslate('knowledgeBase');
  return (
    <Box
      sx={{
        border: '1px solid rgba(255, 255, 255, 0.1)',
        paddingX: 4,
        paddingY: 3,
        borderRadius: 1,
      }}
    >
      <Typography sx={{ mb: 4 }}>{sliderName}</Typography>
      <Field.Slider
        min={min}
        max={max}
        step={step}
        aria-label={authTrans.t('always_visible')}
        valueLabelDisplay="on"
        name={HtmlName}
      />
    </Box>
  );
};

export const getEventSchema = (authTrans: ReturnType<typeof useTranslate>) =>
  zod.object({
    knowledgeBasesName: zod
      .string()
      .min(1, { message: authTrans.t('title_required') })
      .max(10, { message: authTrans.t('title_max_length') }),
    knowledgeBasesDescription: zod
      .string()
      .min(1, { message: authTrans.t('description_required') })
      .max(200, { message: authTrans.t('description_max_length') }),
    splitters: zod
      .string()
      .min(1, { message: authTrans.t('description_required') })
      .max(200, { message: authTrans.t('description_max_length') }),
    similarity_threshold: zod.number().min(0).max(100),
    top_n: zod.number().min(0).max(30),
    chunk_overlap: zod.number().min(0).max(256),
    chunk_size: zod.number().min(256).max(2048),
    use_ocr: zod.boolean(),
    chunkMethods: zod.string().min(1, { message: authTrans.t('ChunkMethods_required') }),
  });

export default function EditKnowledgeBasesConfigurationSettingsView({
  sx,
  DefaultEditKnowledgeBases,
  ChunkMethods,
}: Props) {
  const authTrans = useTranslate('knowledgeBase');
  const schema = getEventSchema(authTrans);

  const { knId, knName } = useParams();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const { setPatchEditKnowledgeBases } = usePatchEditKnowledgeBasesApi(user?.account_id, knId);

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(schema),
    defaultValues: {
      knowledgeBasesName: DefaultEditKnowledgeBases.name || '',
      splitters: DefaultEditKnowledgeBases.splitters || '',
      knowledgeBasesDescription: DefaultEditKnowledgeBases.description || '',
      similarity_threshold: (DefaultEditKnowledgeBases.similarity_threshold ?? 0) * 100,
      top_n: DefaultEditKnowledgeBases.top_n || '',
      chunk_overlap: DefaultEditKnowledgeBases.chunk_overlap || '',
      chunk_size: DefaultEditKnowledgeBases.chunk_size || '',
      chunkMethods: DefaultEditKnowledgeBases.chunk_method || '',
      use_ocr: DefaultEditKnowledgeBases.use_ocr ?? false,
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = methods;

  useEffect(() => {
    if (DefaultEditKnowledgeBases) {
      reset({
        knowledgeBasesName: DefaultEditKnowledgeBases.name || '',
        splitters: DefaultEditKnowledgeBases.splitters || '',
        knowledgeBasesDescription: DefaultEditKnowledgeBases.description || '',
        similarity_threshold: (DefaultEditKnowledgeBases.similarity_threshold ?? 50) * 100,
        top_n: DefaultEditKnowledgeBases.top_n || '',
        chunk_overlap: DefaultEditKnowledgeBases.chunk_overlap || '',
        chunk_size: DefaultEditKnowledgeBases.chunk_size || '',
        chunkMethods: DefaultEditKnowledgeBases.chunk_method || '',
        use_ocr: DefaultEditKnowledgeBases.use_ocr ?? false,
      });
    }
  }, [DefaultEditKnowledgeBases, reset]);

  const onSubmit = handleSubmit(async (data) => {
    const eventData = {
      name: data?.knowledgeBasesName,
      description: data?.knowledgeBasesDescription,
      similarity_threshold: (data?.similarity_threshold ?? 0) / 100,
      top_n: data?.top_n,
      chunk_overlap: data?.chunk_overlap,
      chunk_size: data?.chunk_size,
      chunkMethods: data?.chunkMethods,
      use_ocr: data?.use_ocr,
      splitters: data?.splitters,
    };

    try {
      await setPatchEditKnowledgeBases(eventData);
      toast(authTrans.t('change KnowledgeBases successfully!'));
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
        <Field.Text name="knowledgeBasesName" label={authTrans.t('KnowledgeBases Name')} />
        <Field.Text
          name="knowledgeBasesDescription"
          multiline
          rows={8}
          label={authTrans.t('description')}
        />
        <Field.Checkbox name="use_ocr" label={authTrans.t('Use OCR')} />
        {ChunkMethods && (
          <Field.Select name="chunkMethods" label={authTrans.t('model_label')}>
            {ChunkMethods.map((option: ChunkMethodsType) => (
              <MenuItem key={option.name} value={option.name} sx={{ textTransform: 'capitalize' }}>
                {option.name}
              </MenuItem>
            ))}
          </Field.Select>
        )}
        <Field.Text name="splitters" label={authTrans.t('Delimiters')} />
        <Slider
          HtmlName="chunk_size"
          sliderName={authTrans.t('Chunk Character Number')}
          min={256}
          max={2048}
        />
        <Slider
          HtmlName="chunk_overlap"
          sliderName={authTrans.t('Overlap Chunk Character Number')}
          min={0}
          max={256}
        />
        <Slider
          HtmlName="similarity_threshold"
          sliderName={authTrans.t('Similarity Threshold')}
          min={0}
          max={100}
        />
        <Slider HtmlName="top_n" sliderName={authTrans.t('Top N')} min={0} max={30} />
      </Box>
    </Box>
  );

  return (
    <DashboardContent maxWidth="xl">
      <Stack direction="row" alignItems="center" gap={1}>
        <Typography variant="h4">{authTrans.t('Edit knowledgeBases')}</Typography>{' '}
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
