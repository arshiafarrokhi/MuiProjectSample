import { m } from 'framer-motion';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';
import { SimpleLayout } from 'src/layouts/simple';
import { PageNotFoundIllustration } from 'src/assets/illustrations';

import { varBounce, MotionContainer } from 'src/components/animate';

// ----------------------------------------------------------------------

export function ListNotFoundView() {
  const { t } = useTranslate();

  return (
    <SimpleLayout
      slotProps={{
        content: { compact: true },
      }}
    >
      <Container component={MotionContainer}>
        <m.div variants={varBounce('in')}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            {t('No record found')}
          </Typography>
        </m.div>

        <m.div variants={varBounce('in')}>
          <Typography sx={{ color: 'text.secondary' }}>
            {t('There are no records to display.')}
          </Typography>
        </m.div>
      </Container>
    </SimpleLayout>
  );
}
