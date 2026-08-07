'use client';

import { useEffect, useState } from 'react';
import { Button } from './button';

export const CopyButton = ({ value }: { value: string }) => {
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (!hasCopied) return;
    const timer = setTimeout(() => setHasCopied(false), 2500);
    return () => clearTimeout(timer);
  }, [hasCopied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setHasCopied(true);
    } catch {
      setHasCopied(false);
    }
  };

  return (
    <Button variant={hasCopied ? 'secondary' : 'primary'} onClick={() => void copy()}>
      <span aria-hidden>{hasCopied ? '✓' : '⧉'}</span>
      {hasCopied ? 'Copiado' : 'Copiar'}
      <span role="status" aria-live="polite" className="sr-only">
        {hasCopied ? 'Enlace copiado al portapapeles' : ''}
      </span>
    </Button>
  );
};
