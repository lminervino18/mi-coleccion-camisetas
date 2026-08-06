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
      <h1 className="mb-1 text-xl font-semibold">Iniciar sesión</h1>
      <p className="text-pitch-400 mb-6 text-sm">Entrá para ver y gestionar tu colección.</p>

      <LoginForm />

      <p className="text-pitch-400 mt-6 text-center text-sm">
        ¿Todavía no tenés cuenta?{' '}
        <Link href="/registro" className="text-grass-400 font-medium hover:underline">
          Creá una
        </Link>
      </p>
    </>
  );
};

export default LoginPage;
