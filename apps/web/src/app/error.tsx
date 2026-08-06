'use client';

import { useEffect } from 'react';

const GlobalError = ({ error, reset }: { error: Error; reset: () => void }) => {
  useEffect(() => {
    console.error('Render error', error);
  }, [error]);

  return (
    <main
      id="main"
      className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center"
    >
      <p aria-hidden className="text-5xl">
        ⚠️
      </p>
      <h1 className="text-2xl font-semibold">Algo salió mal</h1>
      <p className="text-pitch-400 max-w-sm text-balance">
        Tuvimos un problema al mostrar esta página. Podés intentar de nuevo.
      </p>
      <button
        onClick={reset}
        className="bg-grass-500 text-pitch-950 mt-2 inline-flex min-h-11 items-center rounded-[--radius-control] px-5 font-semibold"
      >
        Reintentar
      </button>
    </main>
  );
};

export default GlobalError;
