import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/server/auth';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Iniciar sesión',
  description: 'Accedé a tu colección de camisetas de fútbol.',
};

const LoginPage = async () => {
  if ((await getCurrentUser()) !== null) redirect('/coleccion');

  return (
    <>
      <p className="text-ink-300 mb-6">Las camisetas que amás, ahora organizadas.</p>

      <LoginForm />

      <p className="text-ink-300 mt-6 text-sm">
        ¿Todavía no tenés cuenta?{' '}
        <Link href="/registro" className="text-celeste-400 font-medium hover:underline">
          Creá una
        </Link>
      </p>
    </>
  );
};

export default LoginPage;
