import { paths } from 'src/routes/paths';

import packageJson from '../package.json';

// ----------------------------------------------------------------------

export type ConfigValue = {
  appName: string;
  appVersion: string;
  serverUrl: string;
  assetsDir: string;
  auth: {
    method: 'jwt';
    skip: boolean;
    redirectPath: string;
  };
  mapboxApiKey: string;
  // firebase: {
  //   appId: string;
  //   apiKey: string;
  //   projectId: string;
  //   authDomain: string;
  //   storageBucket: string;
  //   measurementId: string;
  //   messagingSenderId: string;
  // };
  // amplify: { userPoolId: string; userPoolWebClientId: string; region: string };
  // auth0: { clientId: string; domain: string; callbackUrl: string };
  // supabase: { url: string; key: string };
};

// ----------------------------------------------------------------------

export const CONFIG: ConfigValue = {
  appName: 'آریانا مهاجر',
  appVersion: packageJson.version,
  serverUrl: import.meta.env.VITE_SERVER_URL ?? '',
  assetsDir: import.meta.env.VITE_ASSETS_DIR ?? '',
  /**
   * Auth
   * @method jwt | amplify | firebase | supabase | auth0
   */
  auth: {
    method: 'jwt',
    skip: false,
    redirectPath: paths.dashboard.root,
  },
  /**
   * Mapbox
   */
  mapboxApiKey: import.meta.env.VITE_MAPBOX_API_KEY ?? '',
};
