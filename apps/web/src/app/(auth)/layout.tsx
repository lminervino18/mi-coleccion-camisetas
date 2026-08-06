import Link from 'next/link';

const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <main id="main" className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
    <div className="w-full max-w-sm">
      <Link href="/" className="mb-8 flex flex-col items-center gap-3 text-center">
        <span aria-hidden className="text-4xl">
          👕
        </span>
        <span className="text-2xl font-semibold tracking-tight text-balance">
          Mi Colección de Camisetas
        </span>
      </Link>

      <div className="border-white/8 bg-pitch-900/80 rounded-[--radius-card] border p-6 shadow-[--shadow-raised] sm:p-7">
        {children}
      </div>
    </div>
  </main>
);

export default AuthLayout;
