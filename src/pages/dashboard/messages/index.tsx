import { Helmet } from 'react-helmet-async';
import { Box } from '@mui/material';

import { CONFIG } from 'src/global-config';
import { LoadingScreen } from 'src/components/loading-screen/loading-screen';
import { useGetMessages } from 'src/sections/messages/api/messagesApi'; // فقط برای نشان‌دادن Loader اولیه
import MessagesView from 'src/sections/messages/views/MessagesView';

const metadata = { title: `Messages | Dashboard - ${CONFIG.appName}` };

export default function MessagesPage() {
  // اختیاری: برای یکنواختی تجربه با صفحات دیگر، یک بار لود اولیه:
  const { messagesLoading } = useGetMessages(undefined);

  if (messagesLoading) return <LoadingScreen />;

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
