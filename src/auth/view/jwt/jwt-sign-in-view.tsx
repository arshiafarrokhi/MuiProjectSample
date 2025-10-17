// src/auth/view/jwt/JwtSignInView.tsx

import { toast } from 'sonner';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import axiosInstance from 'src/lib/axios';
import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { AnimateLogoRotate } from 'src/components/animate';

import { useAuthContext } from '../../hooks';
import { setSession } from '../../context/jwt';
import { FormHead } from '../../components/form-head';

// ----------------------------------------------------------------------

type FormValues = {
  phone: string;
  code: string;
  password: string; // در فلوی فراموشی، به عنوان newPassword استفاده می‌شود
};

type Step = 'login' | 'verify' | 'forgot-request' | 'forgot-verify';

export function JwtSignInView() {
  const authTrans = useTranslate('auth');
  const router = useRouter();

  const showPassword = useBoolean();
  const { checkUserSession } = useAuthContext();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('login');
  const [phoneState, setPhoneState] = useState<string>('');
  const [codeExpiration, setCodeExpiration] = useState<string | null>(null);

  const methods = useForm<FormValues>({
    defaultValues: { phone: '', code: '', password: '' },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    setValue,
    watch,
  } = methods;

  const watchedPhone = watch('phone');

  const resetForm = () => {
    setValue('phone', '');
    setValue('code', '');
    setValue('password', '');
    setPhoneState('');
    setCodeExpiration(null);
  };

  const goBackToLogin = () => {
    resetForm();
    setStep('login');
  };

  const onSubmit = handleSubmit(async (data) => {
    setErrorMessage(null);
    try {
      if (step === 'login') {
        // ---- Login: ارسال کد ورود
        const phone = String(data.phone ?? '').trim();
        if (!phone) {
          toast.error('لطفاً شماره موبایل را وارد کنید.');
          return;
        }

        const resp = await axiosInstance.post('/Authentication/Login', { phone });

        if (resp?.data?.success) {
          setPhoneState(phone);
          const exp = resp?.data?.result?.codeExpiration ?? null;
          setCodeExpiration(exp);
          setValue('phone', phone);
          setValue('code', '');
          setValue('password', '');
          setStep('verify');
          toast.success(resp.data?.message ?? 'کد تایید ارسال شد.');
        } else {
          toast.error(resp?.data?.message ?? 'خطا در ارسال کد.');
        }
      } else if (step === 'verify') {
        // ---- Login: تأیید کد و ورود
        const phone = phoneState || String(data.phone ?? '').trim();
        const code = String(data.code ?? '').trim();
        const password = String(data.password ?? '');

        if (!phone || !code || !password) {
          toast.error('لطفاً شماره، کد و رمز عبور را وارد کنید.');
          return;
        }

        const resp = await axiosInstance.post('/Authentication/VerifyCode', {
          phone,
          code,
          password,
        });

        if (resp?.data?.success && resp?.data?.result?.token) {
          const token = String(resp.data.result.token);

          await setSession(token);
          await checkUserSession?.();

          toast.success(authTrans.t('Login is successful!'));
          router.push(paths.dashboard.users);
        } else {
          toast.error(resp?.data?.message ?? 'کد یا رمز عبور نامعتبر است.');
        }
      } else if (step === 'forgot-request') {
        // ---- Forgot: درخواست ارسال کد بازیابی
        const phone = String(data.phone ?? '').trim();
        if (!phone) {
          toast.error('لطفاً شماره موبایل را وارد کنید.');
          return;
        }

        const resp = await axiosInstance.post('/Account/AdminForgotPass', { phone });

        if (resp?.data?.success) {
          setPhoneState(phone);
          const exp = resp?.data?.result?.codeExpiration ?? null;
          setCodeExpiration(exp ?? null);
          setValue('phone', phone);
          setValue('code', '');
          setValue('password', ''); // اینجا password همان newPassword خواهد بود
          setStep('forgot-verify');
          toast.success(resp?.data?.message ?? 'کد بازیابی ارسال شد.');
        } else {
          toast.error(resp?.data?.message ?? 'ارسال کد بازیابی ناموفق بود.');
        }
      } else if (step === 'forgot-verify') {
        // ---- Forgot: تأیید کد و تنظیم رمز جدید
        const phone = phoneState || String(data.phone ?? '').trim();
        const code = String(data.code ?? '').trim();
        const newPassword = String(data.password ?? '');

        if (!phone || !code || !newPassword) {
          toast.error('لطفاً شماره، کد و رمز عبور جدید را وارد کنید.');
          return;
        }

        const resp = await axiosInstance.post('/Account/VerifyCode', {
          phone,
          code,
          newPassword,
        });

        if (resp?.data?.success) {
          toast.success(resp?.data?.message ?? 'رمز عبور با موفقیت تغییر کرد. لطفاً وارد شوید.');
          // بازگشت به فرم لاگین
          goBackToLogin();
          // پیش‌پرکردن شماره برای سهولت
          setValue('phone', phone);
        } else {
          toast.error(resp?.data?.message ?? 'تغییر رمز عبور ناموفق بود.');
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

          {/* Link to forgot flow */}
          <Button
            variant="text"
            onClick={() => {
              setStep('forgot-request');
              setValue('phone', '');
              setValue('code', '');
              setValue('password', '');
              setPhoneState('');
              setCodeExpiration(null);
            }}
          >
            فراموشی رمز عبور؟
          </Button>
        </Box>
      );
    }

    if (step === 'verify') {
      return (
        <Box sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
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
    }

    if (step === 'forgot-request') {
      return (
        <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
          <Field.Text
            name="phone"
            label="شماره موبایل"
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="برای ارسال کد بازیابی، شماره موبایل ادمین را وارد کنید"
          />

          <LoadingButton
            fullWidth
            color="inherit"
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
            loadingIndicator="ارسال کد بازیابی..."
          >
            ارسال کد بازیابی
          </LoadingButton>

          <Button variant="text" onClick={goBackToLogin}>
            بازگشت به ورود
          </Button>
        </Box>
      );
    }

    // step === 'forgot-verify'
    return (
      <Box sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
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
          label="رمز عبور جدید"
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
          loadingIndicator="ثبت رمز جدید..."
        >
          ثبت رمز جدید
        </LoadingButton>

        <Button variant="text" onClick={() => setStep('forgot-request')}>
          بازگشت و ویرایش شماره
        </Button>
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
