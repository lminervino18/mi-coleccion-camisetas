'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/api-client';

export const LogoutButton = () => {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const signOut = async () => {
    setIsSigningOut(true);
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
      router.replace('/');
      router.refresh();
    } catch {
      setIsSigningOut(false);
    }
  };

  return (
    <Button variant="secondary" onClick={() => void signOut()} isLoading={isSigningOut}>
      Cerrar sesión
    </Button>
  );
};
