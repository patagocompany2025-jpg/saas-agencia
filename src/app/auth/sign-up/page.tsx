'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStackAuth } from '@/lib/contexts/StackAuthContext-approval';
import { AlertCircle } from 'lucide-react';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useStackAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações básicas
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const success = await signUp(email, password, name);
      if (success) {
        // Redirecionar para página de aguardando aprovação
        router.push('/auth/pending-approval');
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    } catch (err) {
      setError('Erro ao criar conta');
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
        <h2 className="text-2xl font-bold mb-2 text-center">Crie sua conta</h2>
        <p className="text-gray-400 mb-8 text-sm text-center">Junte-se à Agência Patagônia!</p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="flex items-center space-x-2 text-red-400 text-sm mb-4 p-3 bg-red-500/10 rounded-md border border-red-500/20">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-5">
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-300">Nome completo</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5E6AD2] transition border border-white/10"
              placeholder="Seu nome completo"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-300">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5E6AD2] transition border border-white/10"
              placeholder="seu@email.com"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-300">Senha</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5E6AD2] transition border border-white/10"
              placeholder="••••••••"
            />
          </div>

          <div className="mb-7">
            <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-300">Confirmar senha</label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5E6AD2] transition border border-white/10"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#5E6AD2] text-white font-semibold rounded-full hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        {/* Link para login */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Já tem uma conta?{' '}
            <a href="/auth/sign-in" className="text-[#5E6AD2] hover:underline font-medium">
              Faça login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
