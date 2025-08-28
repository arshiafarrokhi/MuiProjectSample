// Static token kept in file for reference/testing but NOT applied as default header anymore
export const STATIC_TOKEN =
  'eyJhbGciOiJBMTI4S1ciLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwidHlwIjoiSldUIiwiY3R5IjoiSldUIn0.ykTI4Tnn9hlwxbr-FLAD30O8sKFeKHhkHIqt5BnqQjCqtRw0ZZTFbg.kkZ3TQC4nTCUnFujRkc_cQ.c-s38w...'; // trimmed

import { useSetState } from 'minimal-shared/hooks';
import { useMemo, useEffect, useCallback } from 'react';

import { setSession } from './utils';
import { JWT_STORAGE_KEY } from './constant';
import { AuthContext } from '../auth-context';

import type { AuthState } from '../../types';

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  // <-- removed the line that forced STATIC_TOKEN into axios headers:
  // axios.defaults.headers.common['Authorization'] = `Bearer ${STATIC_TOKEN}`;
  // Now we rely on setSession(accessToken) when a real token exists in sessionStorage.

  const { state, setState } = useSetState<AuthState>({ user: null, loading: true });

  const checkUserSession = useCallback(async () => {
    try {
      const accessToken = sessionStorage.getItem(JWT_STORAGE_KEY);

      if (accessToken) {
        // setSession should set axios header and any other plumbing
        setSession(accessToken);

        // const res = await axios.get(endpoints.auth.me);

        setState({
          user: {
            // ...res.data,
            accessToken,
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
