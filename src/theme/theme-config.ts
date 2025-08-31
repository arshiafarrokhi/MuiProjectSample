import type { CommonColors } from '@mui/material/styles/createPalette';

import type { PaletteColorNoChannels } from './core/palette';
import type { ThemeDirection, ThemeColorScheme, ThemeCssVariables } from './types';

// ----------------------------------------------------------------------

type ThemeConfig = {
  classesPrefix: string;
  modeStorageKey: string;
  direction: ThemeDirection;
  defaultMode: ThemeColorScheme;
  cssVariables: ThemeCssVariables;
  fontFamily: Record<'primary' | 'secondary', string>;
  palette: Record<
    'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error',
    PaletteColorNoChannels
  > & {
    common: Pick<CommonColors, 'black' | 'white'>;
    grey: Record<
      '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900',
      string
    >;
  };
};

export const themeConfig: ThemeConfig = {
  /** **************************************
   * Base
   *************************************** */
  direction: 'rtl',
  defaultMode: 'dark',
  modeStorageKey: 'theme-mode',
  classesPrefix: 'minimal',
  /** **************************************
   * Typography
   *************************************** */
  fontFamily: {
    primary: 'Ravi',
    secondary: 'Arzhan',
  },
  /** **************************************
   * Palette
   *************************************** */
  palette: {
    primary: {
      lighter: 'oklch(0.547 0.261 29.2)',
      light: 'oklch(0.547 0.261 29.2)',
      main: 'oklch(0.547 0.261 29.2)',
      dark: 'oklch(0.547 0.261 29.2)',
      darker: 'oklch(0.547 0.261 29.2)',
      contrastText: 'oklch(1 0 0)', // سفید
    },
    secondary: {
      lighter: 'oklch(0.611 0.196 139.7)',
      light: 'oklch(0.611 0.196 139.7)',
      main: 'oklch(0.611 0.196 139.7)',
      dark: 'oklch(0.611 0.196 139.7)',
      darker: 'oklch(0.611 0.196 139.7)',
      contrastText: 'oklch(1 0 0)', // سفید
    },
    info: {
      lighter: '#CAFDF5',
      light: '#61F3F3',
      main: '#00B8D9',
      dark: '#006C9C',
      darker: '#003768',
      contrastText: '#FFFFFF',
    },
    success: {
      lighter: '#D3FCD2',
      light: '#77ED8B',
      main: '#22C55E',
      dark: '#118D57',
      darker: '#065E49',
      contrastText: '#ffffff',
    },
    warning: {
      lighter: '#FFF5CC',
      light: '#FFD666',
      main: '#FFAB00',
      dark: '#B76E00',
      darker: '#7A4100',
      contrastText: '#1C252E',
    },
    error: {
      lighter: '#FFE9D5',
      light: '#FFAC82',
      main: '#FF5630',
      dark: '#B71D18',
      darker: '#7A0916',
      contrastText: '#FFFFFF',
    },
    grey: {
      '50': '#FCFDFD',
      '100': '#F9FAFB',
      '200': '#F4F6F8',
      '300': '#DFE3E8',
      '400': '#C4CDD5',
      '500': '#919EAB',
      '600': '#637381',
      '700': '#454F5B',
      '800': '#1C252E',
      '900': '#141A21',
    },
    common: { black: '#000000', white: '#FFFFFF' },
  },
  /** **************************************
   * Css variables
   *************************************** */
  cssVariables: {
    cssVarPrefix: '',
    colorSchemeSelector: 'data-color-scheme',
  },
};
