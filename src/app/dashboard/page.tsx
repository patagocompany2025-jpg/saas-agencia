'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

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

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#101014] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-400">Bem-vindo, {session.user?.name}!</p>
          </div>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Sair
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[#181821] p-6 rounded-lg border border-white/10">
            <h3 className="text-xl font-semibold mb-2">CRM</h3>
            <p className="text-gray-400">Gerencie seus clientes e leads</p>
          </div>
          
          <div className="bg-[#181821] p-6 rounded-lg border border-white/10">
            <h3 className="text-xl font-semibold mb-2">Kanban</h3>
            <p className="text-gray-400">Acompanhe o pipeline de vendas</p>
          </div>
          
          <div className="bg-[#181821] p-6 rounded-lg border border-white/10">
            <h3 className="text-xl font-semibold mb-2">Calculadora</h3>
            <p className="text-gray-400">Calcule preços com markup</p>
          </div>
          
          <div className="bg-[#181821] p-6 rounded-lg border border-white/10">
            <h3 className="text-xl font-semibold mb-2">Financeiro</h3>
            <p className="text-gray-400">Controle receitas e despesas</p>
          </div>
          
          <div className="bg-[#181821] p-6 rounded-lg border border-white/10">
            <h3 className="text-xl font-semibold mb-2">Relatórios</h3>
            <p className="text-gray-400">Análises e métricas</p>
          </div>
          
          <div className="bg-[#181821] p-6 rounded-lg border border-white/10">
            <h3 className="text-xl font-semibold mb-2">Configurações</h3>
            <p className="text-gray-400">Gerencie usuários e permissões</p>
          </div>
        </div>

        <div className="mt-8 p-6 bg-[#181821] rounded-lg border border-white/10">
          <h3 className="text-xl font-semibold mb-4">Informações do Usuário</h3>
          <div className="space-y-2">
            <p><strong>Nome:</strong> {session.user?.name}</p>
            <p><strong>Email:</strong> {session.user?.email}</p>
            <p><strong>Role:</strong> {session.user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}