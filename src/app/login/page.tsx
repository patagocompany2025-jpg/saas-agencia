'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email ou senha incorretos');
      } else if (result?.ok) {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Erro ao fazer login');
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
        <h2 className="text-2xl font-bold mb-2 text-center">Entre na sua conta</h2>
        <p className="text-gray-400 mb-8 text-sm text-center">Bem-vindo de volta! Digite suas credenciais.</p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="flex items-center space-x-2 text-red-400 text-sm mb-4 p-3 bg-red-500/10 rounded-md border border-red-500/20">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

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
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5E6AD2] transition border border-white/10"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#5E6AD2] text-white font-semibold rounded-full hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Usuários de Teste */}
        <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-xs text-gray-400 text-center mb-3 font-semibold">Usuários de Teste:</p>
          <div className="text-xs text-gray-400 space-y-2">
            <div className="grid grid-cols-1 gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[#5E6AD2] font-medium">Sócio:</span>
                <span className="text-white/60">Senha: 123456</span>
              </div>
              <div className="pl-2">
                <p>• joao@socio.com</p>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[#5E6AD2] font-medium">Vendedor:</span>
                <span className="text-white/60">Senha: 123456</span>
              </div>
              <div className="pl-2">
                <p>• maria@vendedor.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}