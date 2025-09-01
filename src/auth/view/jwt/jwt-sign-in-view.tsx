// src/auth/view/jwt/JwtSignInView.tsx

import { toast } from 'sonner';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import axios from 'src/lib/axios'; // same default export used in AuthProvider
import axiosInstance from 'src/lib/axios';
import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { AnimateLogoRotate } from 'src/components/animate';

import { useAuthContext } from '../../hooks';
import { FormHead } from '../../components/form-head';
import { JWT_STORAGE_KEY } from '../../context/jwt/constant';

// ----------------------------------------------------------------------

export function JwtSignInView() {
  const authTrans = useTranslate('auth');
  const router = useRouter();

  const showPassword = useBoolean();
  const { checkUserSession } = useAuthContext();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [step, setStep] = useState<'login' | 'verify'>('login');
  const [phoneState, setPhoneState] = useState<string>('');
  const [codeExpiration, setCodeExpiration] = useState<string | null>(null);

  const methods = useForm<{ phone: string; code: string; password: string }>({
    defaultValues: { phone: '', code: '', password: '' },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    setValue,
    watch,
  } = methods;

  // Keep watching phone so we can show it if needed
  const watchedPhone = watch('phone');

  const onSubmit = handleSubmit(async (data) => {
    setErrorMessage(null);

    try {
      if (step === 'login') {
        const phone = String(data.phone ?? '').trim();
        if (!phone) {
          toast.error('لطفاً شماره موبایل را وارد کنید.');
          return;
        }

        // call Login api
        const resp = await axiosInstance.post('/Authentication/Login', { phone });

        if (resp?.data?.success) {
          // store phone for the verify step
          setPhoneState(phone);
          // if backend returned expiration, keep it for UI
          const exp = resp?.data?.result?.codeExpiration ?? null;
          setCodeExpiration(exp);
          // prepare verify form: set phone (readonly) and clear code/password
          setValue('phone', phone);
          setValue('code', '');
          setValue('password', '');
          setStep('verify');
          toast.success(resp.data?.message ?? 'کد تایید ارسال شد.');
        } else {
          toast.error(resp?.data?.message ?? 'خطا در ارسال کد.');
        }
      } else {
        const phone = phoneState || String(data.phone ?? '').trim();
        const code = String(data.code ?? '').trim();
        const password = String(data.password ?? '');

        if (!phone || !code || !password) {
          toast.error('لطفاً شماره، کد و رمز عبور را وارد کنید.');
          return;
        }

        // call VerifyCode api
        const resp = await axiosInstance.post('/Authentication/VerifyCode', {
          phone,
          code,
          password,
        });

        if (resp?.data?.success && resp?.data?.result?.token) {
          const token = String(resp.data.result.token);

          // persist token so AuthProvider.checkUserSession can use it
          try {
            sessionStorage.setItem(JWT_STORAGE_KEY, token);
          } catch (e) {
            console.error('sessionStorage set failed', e);
          }

          // set axios header right away (both instances to be safe)
          try {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          } catch (e) {
            console.error('Failed to set axios authorization header', e);
          }

          // refresh auth context (this will read token from sessionStorage)
          await checkUserSession?.();

          toast.success(authTrans.t('Login is successful!'));
          // navigate to dashboard
          router.push(paths.dashboard.users);
        } else {
          toast.error(resp?.data?.message ?? 'کد یا رمز عبور نامعتبر است.');
        }
      }
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.message || 'خطا در ارتباط با سرور';
      setErrorMessage(msg);
      toast.error(msg);
    }
  });

  const renderForm = () => {
    if (step === 'login') {
      return (
        <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
          <Field.Text
            name="phone"
            label="شماره موبایل"
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="مثال: 09121234567"
          />

          <LoadingButton
            fullWidth
            color="inherit"
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
            loadingIndicator="در حال ارسال"
          >
            ارسال کد
          </LoadingButton>
        </Box>
      );
    }

    // verify step
    return (
      <Box sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
        {/* show phone (readonly) and small info */}
        <Field.Text
          name="phone"
          label="شماره موبایل"
          slotProps={{ inputLabel: { shrink: true }, input: { readOnly: true } }}
          disabled
        />
        {codeExpiration && (
          <Box sx={{ typography: 'caption', color: 'text.secondary' }}>
            اعتبار کد تا: {new Date(codeExpiration).toLocaleString()}
          </Box>
        )}

        <Field.Text name="code" label="کد تأیید" slotProps={{ inputLabel: { shrink: true } }} />

        <Field.Text
          name="password"
          label="رمز عبور"
          type={showPassword.value ? 'text' : 'password'}
          slotProps={{
            inputLabel: { shrink: true },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={showPassword.onToggle} edge="end">
                    <Iconify
                      icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <LoadingButton
          fullWidth
          color="inherit"
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
          loadingIndicator={authTrans.t('signIn...')}
        >
          ورود
        </LoadingButton>

        <LoadingButton
          fullWidth
          variant="text"
          onClick={() => {
            // back to phone edit
            setStep('login');
            setPhoneState('');
            setValue('phone', '');
            setValue('code', '');
            setValue('password', '');
            setCodeExpiration(null);
          }}
        >
          بازگشت و ویرایش شماره
        </LoadingButton>
      </Box>
    );
  };

  return (
    <>
      <AnimateLogoRotate sx={{ mb: 3, mx: 'auto' }} />

      <FormHead
        title={authTrans.t('Sign in to your account')}
        sx={{ textAlign: { xs: 'center', md: 'left' } }}
      />

      {!!errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm()}
      </Form>
    </>
  );
}
