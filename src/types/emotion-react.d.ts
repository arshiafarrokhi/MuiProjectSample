import type { ComponentType, PropsWithChildren } from 'react';
import type { EmotionCache } from '@emotion/cache';

declare module '@emotion/react' {
  export interface CacheProviderProps extends PropsWithChildren {
    value: EmotionCache;
  }

  // Some toolchains configured with legacy module resolution occasionally lose
  // the CacheProvider declaration. Explicitly re-export it so TypeScript always
  // sees the runtime member.
  export const CacheProvider: ComponentType<CacheProviderProps>;
}
