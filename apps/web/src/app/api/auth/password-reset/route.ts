import { NextResponse } from 'next/server';
import { requestPasswordResetSchema, resetPasswordSchema } from '@camisetas/contracts';
import { requestPasswordReset, resetPassword } from '@camisetas/core';
import { parseJson, toErrorResponse } from '@/server/api';
import { appUrl } from '@/server/auth';
import { db } from '@/server/db';
import { mailSender } from '@/server/mail';
import { passwordResetEmail } from '@/server/mail/password-reset-email';
import { limitByClient } from '@/server/rate-limit';

/**
 * Always answers 202, whether or not the address exists, so the endpoint cannot be used to test
 * which addresses are registered.
 */
export const POST = async (request: Request) => {
  try {
    await limitByClient('password-reset', 5, 60 * 60 * 1000);

    const { email } = await parseJson(request, requestPasswordResetSchema);
    const issued = await requestPasswordReset(db, email);

    if (issued !== null) {
      const resetUrl = appUrl(`/recuperar/${issued.token}`);
      await mailSender
        .send(passwordResetEmail(issued.email, issued.username, resetUrl))
        .catch((error: unknown) => {
          console.error('Could not send the password reset email', error);
        });
    }

    return new NextResponse(null, { status: 202 });
  } catch (error) {
    return await toErrorResponse(error);
  }
};

export const PUT = async (request: Request) => {
  try {
    await limitByClient('password-reset-confirm', 10, 60 * 60 * 1000);

    const input = await parseJson(request, resetPasswordSchema);
    await resetPassword(db, input.token, input.newPassword);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return await toErrorResponse(error);
  }
};
