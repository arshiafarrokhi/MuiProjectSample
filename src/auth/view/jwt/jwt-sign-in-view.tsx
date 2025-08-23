import type { SignInSchemaType } from 'src/auth/schemas/sign-in-schema';

import { toast } from 'sonner';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { AnimateLogoRotate } from 'src/components/animate';

import { SignInSchema } from 'src/auth/schemas/sign-in-schema';

import { useAuthContext } from '../../hooks';
import { FormHead } from '../../components/form-head';
import { signInWithPassword } from '../../context/jwt';

// ----------------------------------------------------------------------

// export type SignInSchemaType = zod.infer<typeof SignInSchema>;

// export const SignInSchema = zod.object({
//   email: zod
//     .string()
//     .min(1, { message: authTrans.t('email is required!') })
//     .email({ message: 'Email must be a valid email address!' }),
//   password: zod
//     .string()
//     .min(1, { message: 'Password is required!' })
//     .min(6, { message: 'Password must be at least 6 characters!' }),
// });

// ----------------------------------------------------------------------

export function JwtSignInView() {
  const authTrans = useTranslate('auth');

  const router = useRouter();

  const showPassword = useBoolean();

  const { checkUserSession } = useAuthContext();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // const defaultValues: SignInSchemaType = {
  //   email: 'demo@minimals.cc',
  //   password: '@demo1',
  // };

  const methods = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema(authTrans)),
    // defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // const onSubmit = handleSubmit(async (data) => {
  //   try {
  //     await signInWithPassword({ email: data.email, password: data.password });
  //     await checkUserSession?.();

  //     router.refresh();
  //   } catch (error) {
  //     console.error(error);
  //     const feedbackMessage = getErrorMessage(error);
  //     setErrorMessage(feedbackMessage);
  //   }
  // });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await signInWithPassword({
        email: data.email,
        password: data.password,
      });
      await checkUserSession?.();

      toast(authTrans.t('Login is successful!'));

      setTimeout(() => {
        router.push(paths.dashboard.users);
      }, 5000);
    } catch (error) {
      toast(authTrans.t('username or password is wrong!'));
    }
  });

  const renderForm = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <Field.Text
        name="email"
        label={authTrans.t('Email address')}
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <Box sx={{ gap: 1.5, display: 'flex', flexDirection: 'column' }}>
        {/* <Link
          component={RouterLink}
          href="#"
          variant="body2"
          color="inherit"
          sx={{ alignSelf: 'flex-end' }}
        >
          Forgot password?
        </Link> */}
        <Field.Text
          name="password"
          label={authTrans.t('password')}
          // placeholder="6+ characters"
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
      </Box>

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator={authTrans.t('signIn...')}
      >
        {authTrans.t('signIn')}
      </LoadingButton>
    </Box>
  );

  return (
    <>
      <AnimateLogoRotate sx={{ mb: 3, mx: 'auto' }} />

      <FormHead
        title={authTrans.t('Sign in to your account')}
        // description={
        //   <>
        //     {authTrans.t('Don’t have an account?')}
        //     <Link component={RouterLink} href={paths.auth.jwt.signUp.root} variant="subtitle2">
        //       {authTrans.t('Get started')}
        //     </Link>
        //   </>
        // }
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
