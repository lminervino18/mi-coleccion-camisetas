'use client';

import { useEffect } from 'react';

const GlobalError = ({ error, reset }: { error: Error; reset: () => void }) => {
  useEffect(() => {
    console.error('Render error', error);
  }, [error]);

  return (
    <main id="main" className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="panel w-full max-w-md p-8 text-center">
        <h1 className="font-display mb-2 text-2xl font-bold">Algo salió mal</h1>
        <p className="text-ink-300 mb-6 text-balance">
          Tuvimos un problema al mostrar esta página. Podés intentar de nuevo.
        </p>
        <button
          onClick={reset}
          className="bg-brand-500 hover:bg-brand-600 inline-flex min-h-11 items-center rounded-[6px] px-5 font-semibold text-white transition-colors"
        >
          Reintentar
        </button>
      </div>
    </main>
  );
};

export default GlobalError;
