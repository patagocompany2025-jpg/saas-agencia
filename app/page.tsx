'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDebugInfo('Conectando...');

    try {
      console.log('[LOGIN] Tentando login com email:', email);
      setDebugInfo(`Enviando requisição para API...`);

      const response = await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stack_user_id: email })
      });

      console.log('[LOGIN] Response status:', response.status);
      setDebugInfo(`Resposta da API: ${response.status} ${response.statusText}`);

      const data = await response.json();
      console.log('[LOGIN] Response data:', data);
      setDebugInfo(`Dados recebidos: ${JSON.stringify(data).substring(0, 100)}...`);

      if (data.success && data.user) {
        console.log('[LOGIN] Login bem-sucedido!');
        setDebugInfo('Login bem-sucedido! Salvando dados...');

        localStorage.setItem('demo_user', JSON.stringify(data.user));
        setDebugInfo('Redirecionando para dashboard...');

        // Aguardar um pouco antes de redirecionar
        await new Promise(resolve => setTimeout(resolve, 500));

        router.push('/dashboard');
      } else if (!data.success && data.error) {
        // Erro específico da API
        console.error('[LOGIN] Erro da API:', data.error);
        setError(data.error);
        setDebugInfo('');
      } else {
        // Usuário não encontrado
        console.log('[LOGIN] Usuário não encontrado');
        setError('Usuário não encontrado. Use: patagocompany2025@gmail.com');
        setDebugInfo('');
      }
    } catch (err: any) {
      console.error('[LOGIN] Erro de rede ou servidor:', err);
      setError(`Erro: ${err.message}`);
      setDebugInfo(`Erro detalhado: ${err.toString()}`);
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
          <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo</h1>
          <p className="text-white/60">Sistema de Gestão Patagonian</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-white mb-2 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patagocompany2025@gmail.com"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          {debugInfo && (
            <div className="p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-200 text-sm">
              {debugInfo}
            </div>
          )}

          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3 text-sm text-blue-200">
            <p className="font-semibold mb-1">💡 Credenciais de Acesso:</p>
            <p>Email: <strong>patagocompany2025@gmail.com</strong></p>
            <p className="text-xs mt-2 text-blue-300/70">Role: Sócio (acesso total)</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar no Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}
