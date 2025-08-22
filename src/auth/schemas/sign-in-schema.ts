import { z as zod } from 'zod';

import type { AuthTransProps } from './types';

export const SignInSchema = (authTrans: AuthTransProps) =>
  zod.object({
    email: zod.string().min(1, { message: authTrans.t('email is required!') }),

    password: zod
      .string()
      .min(1, { message: authTrans.t('Password is required!') })
      .min(6, { message: authTrans.t('Password must be at least 6 characters!') }),
  });

export type SignInSchemaType = zod.infer<ReturnType<typeof SignInSchema>>;
