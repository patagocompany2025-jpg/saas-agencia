'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SimpleLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Login com validação de senha
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success && data.user) {
        console.log('[Login] Salvando usuário no localStorage:', data.user);
        // Salvar no localStorage como demo_user
        localStorage.setItem('demo_user', JSON.stringify(data.user));

        // Verificar se salvou corretamente
        const saved = localStorage.getItem('demo_user');
        console.log('[Login] Verificação - usuário salvo:', saved);

        // Se precisa trocar senha, redirecionar para página de troca
        if (data.requirePasswordChange) {
          router.push('/change-password');
          return;
        }

        // Redirecionar para dashboard
        console.log('[Login] Redirecionando para /dashboard');
        router.push('/dashboard');
      } else {
        setError(data.error || 'Email ou senha incorretos');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <img
            src="/LOGO_HORI_WHITE.png"
            alt="Patagonia"
            className="h-20 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-white mb-2">Login Simples</h1>
          <p className="text-white/60">Sistema de Gestão Patagonian</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-white mb-2 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@patagonian.com"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2 font-medium">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3 text-sm text-blue-200">
            <p className="font-semibold mb-1">💡 Credenciais de teste:</p>
            <p>Email: <strong>patagocompany2025@gmail.com</strong></p>
            <p>Senha: <strong>123456</strong> (temporária)</p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>

          <div className="text-center">
            <Link href="/register" className="text-white/60 hover:text-white text-sm transition-colors">
              Não tem uma conta? <strong>Solicitar Acesso</strong>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
