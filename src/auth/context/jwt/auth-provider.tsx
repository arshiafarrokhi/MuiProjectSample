// Static token for development/testing
export const STATIC_TOKEN =
  'eyJhbGciOiJBMTI4S1ciLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwidHlwIjoiSldUIiwiY3R5IjoiSldUIn0.e6pg1CGiLLnC3xJulclXZnpd1w3dPO02YlLSLyPMX8pAAHggM7qfVw.ay_7yRobgdEA6Vv5An_aTg._RYvvXmA1jmo5rzdxkOBotIfRZlkzrvEh7N40fu5__MyFqX8vB0LUzXXFQgBv1qXGLqzRaEprfJWWmeOqOS7ngPIHcWWfM0J_x-0jptN_MqzsfrsnzIcMF3czGcV4NdyZZ_7igAQ6riVnJtADh5cV1MSmkVrE9tuTePHfDGGJ5v-uwF3Qh3urSrUeKT2IiPB3HVPw0QpjA6Xa1gpp-BlRc5ZMphXrQQ3uR68v8QIENa7hgPiW4FKTgzJO9ufQlZnCYxGTt3Ux4CVQ1pqtJQR-u29oPgDwhL_6L7PX1ZsTm2p65t5DGLEzCVf8IXjMrW6cMHUKR03dnZ6PvlXgQJ243jPiS7ayMPktuqKuVOWZ9LDN2jFhYozdKo3MmLZiW9l0CTQ-O6e3iDWfHdD6S97ZVDwSiNx0894QUNK2SqCrnwEMsER4sAS1Ovp2vwMfyYqLMvkImh8nkl5cDoaIaU3sZhe2FnILbKNWtMKi4U6ECoIjrakbi1uIwhyWkoyIXosTsPc6hLu1pxFUnDlpnsW7-jj7wrL-4SCGhgv41B89cA.aPBzXobYiTQ76OB8Wp9rWg';
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
