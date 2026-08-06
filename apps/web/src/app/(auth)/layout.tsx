import Image from 'next/image';
import Link from 'next/link';

const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <main id="main" className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
    <div className="w-full max-w-md">
      <Link href="/" className="mb-6 flex flex-col items-center gap-3 text-center">
        <Image
          src="/logo.png"
          alt=""
          width={120}
          height={170}
          priority
          className="h-28 w-auto drop-shadow-[0_6px_16px_rgba(0,0,0,0.9)] sm:h-32"
        />
        <span className="font-display px-2 text-2xl leading-tight font-bold tracking-tight text-balance drop-shadow-[2px_2px_8px_rgba(0,0,0,0.9)] sm:text-4xl">
          Mi Colección de Camisetas
        </span>
      </Link>

      <div className="panel p-6 text-center sm:p-8">{children}</div>
    </div>
  </main>
);

export default AuthLayout;
