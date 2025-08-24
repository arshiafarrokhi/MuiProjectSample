// Static token for development/testing
export const STATIC_TOKEN =
  'eyJhbGciOiJBMTI4S1ciLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwidHlwIjoiSldUIiwiY3R5IjoiSldUIn0.00stY42se_lcaYtNVCay-4RBhO7No68VsH16HAs4j49LaB55QUhkiQ.cqoNWrInxQKvkTzB5vPchg.GcKKM32-ltQtBx7qNLLnH5RYMie5PnEBAOTpacCgl7_vnKGrrSIstwGUGk69bUJPblYsC8g8FgeST2Ejxr22WnYmY7lNowQsEiteGDMQ4ClHIVr1kgUGPGTuefS1LQv6f26_I8OkjYzC-U1iVXLFr6zFXCMmqsWy6eC4mQAjkssyc7DzbCTviL8D2DD6K8YdxAr3lVRALU4kK5TUEGBvsqhP0vae-M7v6cAoyIH83Z-_Wd-Z07dB3D_2jF-cxuL2jK4scVhBRyq_3OGuahx38e7msODWIG0_hhTGcAi5-qUcBCHkxMJQHH3PS2_Fko3hBFdv4zmy12p6ntJwQle_PX-1TdzcM5P_khHRpAShGbHQplJv9E0x0zFn-lb5fIPHW2JtGYxEigeXSiHQDrRE0BPuuKa1dgtA4wABpTT1iFQf9fYh_2DFijcJ9coaHR2OacagG8EegQg0xZcOOp197EHyoe21T_Q2It7E7clFDPbSTWrJ795c5o_AZy6MwGCckMb6eSkQIk3zNm0-xs7xIzPfUO-IEN7u4JHEVvlH-mM.T26Q1QRdPMVnEvOxGxK62Q';
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
