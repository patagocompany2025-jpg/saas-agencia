'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginDiretoPage() {
  const [email, setEmail] = useState('patagocompany2025@gmail.com');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const router = useRouter();

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    const logMsg = `[${timestamp}] ${msg}`;
    setLogs(prev => [...prev, logMsg]);
    console.log(logMsg);
  };

  const handleLogin = async () => {
    setLoading(true);
    setLogs([]);
    addLog('🚀 Iniciando login...');
    addLog(`📧 Email: ${email}`);

    try {
      addLog('🌐 Chamando API /api/user/sync...');

      const response = await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stack_user_id: email })
      });

      addLog(`📊 Status: ${response.status} ${response.statusText}`);

      const data = await response.json();
      addLog(`📦 Resposta: ${JSON.stringify(data)}`);

      if (data.success && data.user) {
        addLog('✅ LOGIN BEM-SUCEDIDO!');
        addLog(`👤 Usuário: ${data.user.displayName || data.user.email}`);
        addLog(`🔑 Role: ${data.user.role}`);

        localStorage.setItem('demo_user', JSON.stringify(data.user));
        addLog('💾 Salvo no localStorage');

        addLog('🎯 Redirecionando em 2 segundos...');

        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);

      } else if (!data.success && data.error) {
        addLog(`❌ Erro: ${data.error}`);
      } else {
        addLog('❌ Usuário não encontrado');
      }
    } catch (err: any) {
      addLog(`❌ ERRO: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-lg mb-8">
          <h1 className="text-3xl font-bold mb-2">🚀 Login Direto - Bypass de Cache</h1>
          <p className="text-blue-100">Esta página SEMPRE usa o código mais recente</p>
        </div>

        {/* Formulário */}
        <div className="bg-gray-800 p-8 rounded-lg mb-8">
          <div className="mb-6">
            <label className="block mb-2 text-lg font-medium">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 text-lg"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-bold text-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Processando...' : '🚀 FAZER LOGIN AGORA'}
          </button>
        </div>

        {/* Logs */}
        <div className="bg-black p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-green-400">📋 Logs em Tempo Real:</h2>

          {logs.length === 0 ? (
            <p className="text-gray-500">Aguardando login...</p>
          ) : (
            <div className="space-y-2 font-mono text-sm">
              {logs.map((log, index) => (
                <div key={index} className="text-green-300">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 bg-yellow-900/30 border border-yellow-700 p-6 rounded-lg">
          <h3 className="font-bold mb-3 text-lg">💡 Por que esta página funciona?</h3>
          <ul className="space-y-2">
            <li>✅ URL diferente = sem cache do navegador</li>
            <li>✅ Código simples e direto</li>
            <li>✅ Mostra todos os passos em tempo real</li>
            <li>✅ Não depende de contexts ou providers</li>
          </ul>
        </div>

        <div className="mt-4 text-center">
          <a href="/" className="text-blue-400 hover:underline">
            ← Voltar para login normal
          </a>
        </div>
      </div>
    </div>
  );
}
