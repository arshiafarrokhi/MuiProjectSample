import 'src/global.css';

import { useEffect } from 'react';

import { CssBaseline } from '@mui/material';

import { usePathname } from 'src/routes/hooks';

import { themeConfig, ThemeProvider } from 'src/theme';

import { ProgressBar } from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import { SettingsDrawer, defaultSettings, SettingsProvider } from 'src/components/settings';

import { AuthProvider } from 'src/auth/context/jwt';

import { I18nProvider } from './locales';
import { Snackbar } from './components/snackbar';

// ----------------------------------------------------------------------

type AppProps = {
  children: React.ReactNode;
};

export default function App({ children }: AppProps) {
  useScrollToTop();

  return (
    <I18nProvider>
      <AuthProvider>
        <SettingsProvider defaultSettings={defaultSettings}>
          <ThemeProvider
            noSsr
            defaultMode={themeConfig.defaultMode}
            modeStorageKey={themeConfig.modeStorageKey}
          >
            <CssBaseline />
            <MotionLazy>
              <Snackbar />
              <ProgressBar />
              <SettingsDrawer defaultSettings={defaultSettings} />
              {children}
            </MotionLazy>
          </ThemeProvider>
        </SettingsProvider>
      </AuthProvider>
    </I18nProvider>
  );
}

// ----------------------------------------------------------------------

function useScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
