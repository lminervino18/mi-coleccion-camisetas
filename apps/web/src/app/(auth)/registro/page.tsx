import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/server/auth';
import { RegisterForm } from './register-form';

export const metadata: Metadata = {
  title: 'Crear cuenta',
  description: 'Creá tu cuenta y empezá a organizar tu colección de camisetas.',
};

const RegisterPage = async () => {
  if ((await getCurrentUser()) !== null) redirect('/coleccion');

  return (
    <>
      <h1 className="mb-1 text-xl font-semibold">Crear cuenta</h1>
      <p className="text-pitch-400 mb-6 text-sm">Empezá a organizar tus camisetas.</p>

      <RegisterForm />

      <p className="text-pitch-400 mt-6 text-center text-sm">
        ¿Ya tenés cuenta?{' '}
        <Link href="/login" className="text-grass-400 font-medium hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </>
  );
};

export default RegisterPage;
