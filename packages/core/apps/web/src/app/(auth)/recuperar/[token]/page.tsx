import type { Metadata } from 'next';
import { ResetPasswordForm } from './reset-password-form';

export const metadata: Metadata = {
  title: 'Elegir nueva contraseña',
  robots: { index: false },
};

type Params = { params: Promise<{ token: string }> };

const ResetPasswordPage = async ({ params }: Params) => (
  <>
    <p className="text-ink-300 mb-6">Elegí una contraseña nueva para tu cuenta.</p>
    <ResetPasswordForm token={(await params).token} />
  </>
);

export default ResetPasswordPage;
