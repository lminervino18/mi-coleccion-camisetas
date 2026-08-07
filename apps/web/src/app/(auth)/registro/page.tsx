import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/server/auth';
import { RegisterForm } from '@/components/register-form';

export const metadata: Metadata = {
  title: 'Crear cuenta',
  description: 'Creá tu cuenta y empezá a organizar tu colección de camisetas.',
};

const RegisterPage = async () => {
  if ((await getCurrentUser()) !== null) redirect('/coleccion');

  return (
    <>
      <p className="text-ink-300 mb-6">Creá tu cuenta y empezá a cargar tus camisetas.</p>

      <RegisterForm />

      <p className="text-ink-300 mt-6 text-sm">
        ¿Ya tenés cuenta?{' '}
        <Link href="/" className="text-celeste-400 font-medium hover:underline">
          Volver al inicio
        </Link>
      </p>
    </>
  );
};

export default RegisterPage;
