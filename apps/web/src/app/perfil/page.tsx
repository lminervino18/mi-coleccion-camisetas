import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/server/auth';
import { toUserProfile } from '@/server/serializers';
import { AvatarEditor } from './avatar-editor';
import { ProfileForm } from './profile-form';
import { SecurityPanel } from './security-panel';

export const metadata: Metadata = {
  title: 'Mi perfil',
  robots: { index: false },
};

const ProfilePage = async () => {
  const user = await getCurrentUser();
  if (user === null) redirect('/');

  const profile = toUserProfile(user);

  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-3 py-4 sm:px-5 sm:py-6">
      <Link
        href="/coleccion"
        className="text-ink-100 mb-4 inline-flex min-h-11 items-center rounded-[6px] border border-white/12 bg-white/10 px-4 text-sm transition-colors hover:bg-white/16"
      >
        ← Volver
      </Link>

      <h1 className="font-display panel mb-4 px-4 py-3 text-center text-xl font-bold sm:text-2xl">
        Mi perfil
      </h1>

      <div className="flex flex-col gap-4">
        <section className="panel px-4 py-4">
          <AvatarEditor avatarUrl={profile.avatarUrl} />
        </section>

        <section className="panel px-4 py-4">
          <h2 className="font-display mb-4 text-lg font-bold">Datos</h2>
          <ProfileForm profile={profile} />
        </section>

        <SecurityPanel />
      </div>
    </main>
  );
};

export default ProfilePage;
