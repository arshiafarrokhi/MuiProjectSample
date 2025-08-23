// Static token for development/testing
export const STATIC_TOKEN =
  'eyJhbGciOiJBMTI4S1ciLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwidHlwIjoiSldUIiwiY3R5IjoiSldUIn0.qZY6QrT8LqUSwe_cDsc1aL2kBpG1XkkqkgLIbohhwzlTTz1OD0b9mw.A_sW2i0EyX1-BGaCQZcTwQ.qwLpIdxIFomG5rupKAvKYS-1WTevS6u2UtiKol4iXJ_KEaAvILYWHJBkJ1Ozcf8uO8nRXzbvBLN4dXjwaXV60ljMzur-1A_totj2Ch8raETs814DHEz0-FmUZVkUgPhV3D3_Sg4pMUhXkMsO3EWAEf38jBeFSP9aHfUjCYJSipBCcJ1SSyvcWSnKODbXNdJenkliyC0DYNfXptjJYz7AGPaJYVeRGL7RO4wnMINi1mNfsvOa8EjbVah46kLwNwXAufu7fSeyJaHbMRuqA96HuUoN9C2J9bJBNUg4Vl6rbtDFxjSpGS9lTgnn19vKs8mBm25h0ok4-fyl0IZRa3g6JO_2SVppf34blY8cBOTniGcZoHsFy5bdF-ShvUHrV9S4N-JSB-qDAabvvyOvazMkJVs-FCIMEnr88tpXAWMLljWrA9xbPH9508or0MLOHOD-vj605B-jEvys3DB6AkHX8RgSMPLFs09hMkRvLAxQyFrhjjLm2MU7s7bAnm4b_CVg_SYBbli4Rj42n4iVMzthPeiW5ujo5zpAsiGF8iwWi4A.IABq-1dQPRf4FITfVPwtGQ';
import { useMemo, useEffect, useCallback } from 'react';

import axios, { endpoints } from 'src/lib/axios';

import { setSession } from './utils';
import { JWT_STORAGE_KEY } from './constant';
import { AuthContext } from '../auth-context';

import type { AuthState } from '../../types';
import { useSetState } from 'minimal-shared/hooks';

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
