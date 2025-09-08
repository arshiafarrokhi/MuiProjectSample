import { Helmet } from 'react-helmet-async';

import { Box } from '@mui/material';

import { CONFIG } from 'src/global-config';

import MessagesView from 'src/sections/messages/views/MessagesView';

const metadata = { title: `Messages | Dashboard - ${CONFIG.appName}` };

export default function MessagesPage() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <Box sx={{ px: { xs: 2, md: 3 }, pt: 2 }}>
        <MessagesView />
      </Box>
    </>
  );
}
