'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function HomePage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#5E6AD2] mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">SaaS Agência</h1>
        <p className="text-gray-600 mb-8">Sistema de Gestão para Agências</p>
        
        {session ? (
          <div className="space-y-4">
            <p className="text-green-600">Bem-vindo, {session.user?.name}!</p>
            <Link 
              href="/dashboard" 
              className="inline-block bg-[#5E6AD2] text-white px-6 py-3 rounded-lg hover:bg-[#4C5BC7] transition-colors"
            >
              Ir para Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">Faça login para acessar o sistema</p>
            <Link 
              href="/login" 
              className="inline-block bg-[#5E6AD2] text-white px-6 py-3 rounded-lg hover:bg-[#4C5BC7] transition-colors"
            >
              Fazer Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}