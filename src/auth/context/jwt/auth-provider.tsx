// Static token for development/testing
export const STATIC_TOKEN =
  'eyJhbGciOiJBMTI4S1ciLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwidHlwIjoiSldUIiwiY3R5IjoiSldUIn0.u6lbT2ht9iNS54npXTyUL7C88HfsHun2lL5QabRCQ8WDnZPHGktrFg.HRZZnSwRe9tcGqUwvKwzsQ.rVstYxT2FPejFY4tnN2khJPvNOdS-E1wAYBBVBHmK6rgjh8mpA2vvzbgcjeOEVKSzDjhkpIV8FHZew3M-qsxECd2CcCmnyti5o_BUFySPb1BcpbMlNSuaL3MQSfLgN1kR1Qh4PBwjKS6GjAd6J3mH3ni3gLCE1TAukKBdXO6chhLWITM1lVisHkgDjhhN_5vN9Squ9EAXl0pHFVrBy-C1TVTvQC-DYm2WV0X2Kb-tPRLY8DjnpLTq9C4YHzlREnlAncoUt5s_f00g71z9sKaaLUQfYnAr2jVDxT16BUrwGRGHVZn84fybifMcu3NS-M494lP856GDYLmDfVIBYavphFer2o6HvGxxI4fy-8WBWr2MACRvxAlG8uzuUa9voXxJV_IoSYDsiQuDS7nJwPed5YuEqPLVHdoHatW6GPonf0BYjWPiaiTB_MLWKUeMt8OWZLX2E2hNwlnrPorLyQx0uVbgG798YT_HPr3sixe6Ie7KZodvU5wFKtq0DXKSmCVGZqrFwxg7ujG9iUe681unRv8WKFEkfK9rcOkHVdb3q8.YF1XxOvhrmdNl51VInaPgw';
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
