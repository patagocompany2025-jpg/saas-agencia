'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/simple-login');
  }, [router]);

  return (
    <div className="bg-[#101014] min-h-screen flex items-center justify-center text-white font-sans">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5E6AD2] mx-auto mb-4"></div>
        <p className="text-gray-400">Redirecionando para o novo sistema de login...</p>
      </div>
    </div>
  );
}
