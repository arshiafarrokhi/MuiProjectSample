import { IconButton, useColorScheme } from '@mui/material';

import { useSettingsContext } from 'src/components/settings';

export function ModeToggler() {
  const settings = useSettingsContext();
  const { mode, setMode } = useColorScheme();

  const handleToggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    settings.setState({ colorScheme: newMode });
  };

  return (
    <IconButton onClick={handleToggleMode}>
      {mode === 'light' ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12.058 20q-3.334 0-5.667-2.333T4.058 12q0-3.039 1.98-5.27t4.904-2.634q.081 0 .159.006t.153.017q-.506.706-.801 1.57T10.158 7.5q0 2.667 1.866 4.533t4.534 1.867q.951 0 1.813-.295t1.548-.801q.012.075.017.153t.006.159q-.384 2.923-2.615 4.903T12.057 20m0-1q2.2 0 3.95-1.213t2.55-3.162q-.5.125-1 .2t-1 .075q-3.074 0-5.237-2.162T9.158 7.5q0-.5.075-1t.2-1q-1.95.8-3.163 2.55T5.058 12q0 2.9 2.05 4.95t4.95 2.05m-.25-6.75"
          />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95-6.95l-1.414 1.414M6.464 17.536l-1.414 1.414m12.02 0l-1.414-1.414M6.464 6.464L5.05 5.05" />
          </g>
        </svg>
      )}
    </IconButton>
  );
}
