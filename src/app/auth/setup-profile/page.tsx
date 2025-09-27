'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStackAuth } from '@/lib/contexts/StackAuthContext-approval';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function SetupProfilePage() {
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useStackAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Aqui você pode adicionar lógica para salvar o perfil do usuário
      // Por enquanto, apenas redirecionamos para o dashboard
      router.push('/dashboard');
    } catch (err) {
      setError('Erro ao configurar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#101014] min-h-screen flex items-center justify-center text-white font-sans">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#5E6AD2]/10 via-[#101014] to-[#5E6AD2]/10 pointer-events-none -z-10"></div>
      
      <div className="w-full max-w-md mx-auto p-8 rounded-2xl shadow-2xl border border-white/10 bg-[#181821] backdrop-blur">
        {/* Logo */}
        <div className="flex items-center justify-center mb-9">
          <img 
            src="/LOGO_HORI_WHITE.png" 
            alt="Patagonia Company" 
            className="h-20 w-auto"
          />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-2 text-center">Configure seu perfil</h2>
        <p className="text-gray-400 mb-8 text-sm text-center">Complete seu cadastro para começar a usar o sistema.</p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="flex items-center space-x-2 text-red-400 text-sm mb-4 p-3 bg-red-500/10 rounded-md border border-red-500/20">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-7">
            <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-300">Selecione seu cargo</label>
            <select
              id="role"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#5E6AD2] transition border border-white/10"
            >
              <option value="">Selecione uma opção</option>
              <option value="socio">Sócio</option>
              <option value="vendedor">Vendedor</option>
              <option value="cliente">Cliente</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#5E6AD2] text-white font-semibold rounded-full hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Configurando...' : 'Finalizar cadastro'}
          </button>
        </form>

        {/* Info do usuário */}
        {user && (
          <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-gray-400 text-center mb-2">Usuário logado:</p>
            <p className="text-sm text-white text-center">{user.displayName || user.email}</p>
          </div>
        )}
      </div>
    </div>
  );
}
