import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/server/auth';

const HomePage = async () => {
  redirect((await getCurrentUser()) === null ? '/login' : '/coleccion');
};

export default HomePage;
