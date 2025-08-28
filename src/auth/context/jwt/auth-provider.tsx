// Static token for development/testing
export const STATIC_TOKEN =
  'eyJhbGciOiJBMTI4S1ciLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwidHlwIjoiSldUIiwiY3R5IjoiSldUIn0.ykTI4Tnn9hlwxbr-FLAD30O8sKFeKHhkHIqt5BnqQjCqtRw0ZZTFbg.kkZ3TQC4nTCUnFujRkc_cQ.c-s38wI5Q-sw8WjL8mT2vjlEwSWg_n-0Y5lcn_qPLJ-kxgT3VLT9XUOScsWZZ_gPrRQo5S2XSGLRXw_YK4lB5JbJgBS41ybynwHlXpvQN9_6Ym1jTR6Mqhig8D1UEWX0Vxh6w0JcE2DYUPDLROdvgkKc_TGVPfnca0UgtLOLb9qPlk9aeF4SJkyKeJ4ba3HJf9OcOYliYCBejGnKERyTZqrVpSpkkzcvhRFHAptcXdsgLX2EUFOEl51nFcf8461o3IlOD7tea9skjzOGN4x6vo1dyYO7F8gQVS6v1MrGjPfPfO52twukF3hm6oymg3w16fxN7DNVOzyHYMXVpliihilKY3yea2buGO7K6GHEHUd75hcHjKfoBafb9PAT4B8o1HYL5l4UTqkQb5nRukEdPsu0S1OKZ75YSKWGAcqrfuQ3shtGtxvA20ESY1fRYxEgYuOo-SFWfHP0QF1pqkPDl4n67vrXCeTJ8aAt45xu6aCinedUpiCaGNYvkBbOBKT-ffmdWUQdxDNxZcv639IHaFNZoAIrCtfp8oQoQvZDH1I.rw4H113J_kATfJbLiMaILg';
import { useSetState } from 'minimal-shared/hooks';
import { useMemo, useEffect, useCallback } from 'react';

import axios, { endpoints } from 'src/lib/axios';

import { setSession } from './utils';
import { JWT_STORAGE_KEY } from './constant';
import { AuthContext } from '../auth-context';

import type { AuthState } from '../../types';

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  // Set static token in axios header for all requests
  axios.defaults.headers.common['Authorization'] = `Bearer ${STATIC_TOKEN}`;

  const { state, setState } = useSetState<AuthState>({ user: null, loading: true });

  const checkUserSession = useCallback(async () => {
    try {
      const accessToken = sessionStorage.getItem(JWT_STORAGE_KEY);

      if (accessToken) {
        setSession(accessToken);

        const res = await axios.get(endpoints.auth.me);

        // Use the entire response data and merge with accessToken
        setState({
          user: {
            ...res.data,
            accessToken, // From sessionStorage
          },
          loading: false,
        });
      } else {
        setState({ user: null, loading: false });
      }
    } catch (error) {
      console.error(error);
      setState({ user: null, loading: false });
    }
  }, [setState]);

  useEffect(() => {
    checkUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';
  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user
        ? {
            ...state.user,
            role: state.user?.role ?? 'administrator',
          }
        : null,
      checkUserSession,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [checkUserSession, state.user, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
