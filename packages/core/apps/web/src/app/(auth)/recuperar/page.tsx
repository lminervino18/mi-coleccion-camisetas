import type { Metadata } from 'next';
import Link from 'next/link';
import { ForgotPasswordForm } from './forgot-password-form';

export const metadata: Metadata = {
  title: 'Recuperar contraseña',
  description: 'Pedí un enlace para elegir una nueva contraseña.',
};

const ForgotPasswordPage = () => (
  <>
    <p className="text-ink-300 mb-6">
      Ingresá tu correo y te mandamos un enlace para elegir una nueva contraseña.
    </p>

    <ForgotPasswordForm />

    <p className="text-ink-300 mt-6 text-sm">
      <Link href="/" className="text-celeste-400 font-medium hover:underline">
        Volver al inicio
      </Link>
    </p>
  </>
);

export default ForgotPasswordPage;
