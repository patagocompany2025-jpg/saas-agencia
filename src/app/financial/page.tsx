'use client';

import React from 'react';
import { useStackAuth } from '@/lib/contexts/StackAuthContext-approval';
import { ModernLayout } from '@/components/layout/ModernLayout';

export default function FinancialPageSimple() {
  const { user, isLoading } = useStackAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-white/60">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acesso Negado</h1>
          <p className="text-white/60">Você precisa fazer login para acessar esta página.</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'socio') {
    return (
      <ModernLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Acesso Restrito</h1>
            <p className="text-white/70 text-lg mb-6">
              Apenas sócios têm acesso ao módulo financeiro.
            </p>
          </div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Financeiro</h1>
          <p className="text-white/60">Controle completo de receitas, despesas e pagamentos</p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl rounded-xl p-6 border border-white/10 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-4">Página Financeira</h2>
          <p className="text-white/70">
            Esta é uma versão simplificada da página financeira para testar se o problema está nos componentes complexos.
          </p>
          <div className="mt-4">
            <p className="text-white/60">Usuário logado: {user.displayName || user.email}</p>
            <p className="text-white/60">Role: {user.role}</p>
          </div>
        </div>
      </div>
    </ModernLayout>
  );
}
