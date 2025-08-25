// Static token for development/testing
export const STATIC_TOKEN ='eyJhbGciOiJBMTI4S1ciLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwidHlwIjoiSldUIiwiY3R5IjoiSldUIn0.mz1lw1Ie4kqUdrwAop_leZqgh2aLIkxJDZFztxgyc4n0t2GLTHetKg.gghMtMIR8gpHfYw-FTxbkA.bt59_ovTRKcBkrSo7Sx29uI4tiDCKgkf-s--tDjeIHhaPy0KepuDuluAeQk71kD1hdMrGifgC0wI60CTj7S6rzE91M_fYjRFRxg1LDwaPMVOA35DmSYejczCBjP-_JUG3SWaa44lqJ7gSk3mB5KxVYCvfDtMy-9IIEKHt2PPpOaaUQAAnRWgzg6hYSyY5mNcjJ130juqpno895bkHvFXghm7tV5wcHy63thajQIwNvxt0bY7SQj2EtmhMR-n2yWtrSl8v_GXsVVwTpIyujuQvJBWOCztOnN-c2BsGKRt1XExS0rNLzmHWs4wYVlP5OpAo-FbwK8iDdFaZmJGVjKY9yA8ciqkQketOSIh8fY0xQ-Sx8yuehEcudZJcOg-Wv_0vm7_IAew8-W5c5EQ7jSOS07xDtJvXUKdeoN8sOzwX3O_SxAP4TvrJl1I8eo2cJ9Wgq8siurn_vvoJuDObfOeCL5decouF0y2IxbUGm3MjjOpBmSX3fv7WxNnUOdbuED4Q0LCkhA_mf2lCB7Qv-KdsnflB-YcXY1Z4Gd6mEQkpzo.krJwMaHc5UQl_uAlLXHpJg';
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
