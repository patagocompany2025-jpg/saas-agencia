'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function SimpleLoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Buscar usuário no banco
      const response = await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stack_user_id: email })
      });

      const data = await response.json();

      if (data.success && data.user) {
        // Salvar no localStorage como demo_user
        localStorage.setItem('demo_user', JSON.stringify(data.user));

        // Redirecionar para dashboard
        router.push('/dashboard');
        window.location.reload();
      } else {
        setError('Usuário não encontrado. Use: admin@patagonian.com');
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

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3 text-sm text-blue-200">
            <p className="font-semibold mb-1">💡 Credenciais:</p>
            <p>Email: <strong>admin@patagonian.com</strong></p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  );
}
