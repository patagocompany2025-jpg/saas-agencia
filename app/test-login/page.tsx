'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';

export default function TestLoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1]}] ${message}`]);
    console.log(message);
  };

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLogs([]);

    addLog('🔵 Iniciando teste de login...');
    addLog(`📧 Email: ${email}`);

    try {
      addLog('🌐 Fazendo requisição para /api/user/sync...');

      const response = await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stack_user_id: email })
      });

      addLog(`📊 Status da resposta: ${response.status} ${response.statusText}`);

      const data = await response.json();
      addLog(`📦 Dados recebidos: ${JSON.stringify(data, null, 2)}`);

      if (data.success && data.user) {
        addLog('✅ LOGIN BEM-SUCEDIDO!');
        addLog(`👤 Usuário: ${data.user.displayName || data.user.email}`);
        addLog(`🔑 Role: ${data.user.role}`);

        // Salvar no localStorage
        localStorage.setItem('demo_user', JSON.stringify(data.user));
        addLog('💾 Usuário salvo no localStorage');

        // Verificar se salvou
        const saved = localStorage.getItem('demo_user');
        if (saved) {
          addLog('✅ Confirmado: localStorage contém o usuário');
        } else {
          addLog('❌ ERRO: localStorage NÃO salvou o usuário!');
        }

        addLog('🎉 Pronto para redirecionar para /dashboard');
      } else if (!data.success && data.error) {
        addLog(`❌ Erro da API: ${data.error}`);
      } else {
        addLog('❌ Usuário não encontrado');
      }
    } catch (err: any) {
      addLog(`❌ ERRO: ${err.message}`);
      addLog(`🔍 Detalhes: ${JSON.stringify(err)}`);
    } finally {
      setLoading(false);
      addLog('🏁 Teste finalizado');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Teste de Login - Diagnóstico</h1>

        <form onSubmit={handleTest} className="mb-8 bg-gray-800 p-6 rounded-lg">
          <div className="mb-4">
            <label className="block mb-2 font-medium">Email de Teste:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patagocompany2025@gmail.com"
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
          >
            {loading ? '⏳ Testando...' : '🚀 Testar Login'}
          </button>
        </form>

        <div className="bg-black p-6 rounded-lg font-mono text-sm">
          <h2 className="text-xl font-bold mb-4 text-green-400">📋 Logs do Teste:</h2>

          {logs.length === 0 ? (
            <p className="text-gray-500">Aguardando teste...</p>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="text-green-300">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 bg-yellow-900/30 border border-yellow-700 p-4 rounded-lg">
          <h3 className="font-bold mb-2">💡 Informações:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Esta página testa a API de login e mostra todos os passos</li>
            <li>Use o email: <strong>patagocompany2025@gmail.com</strong></li>
            <li>Verifique se a API retorna sucesso</li>
            <li>Verifique se o localStorage salva corretamente</li>
          </ul>
        </div>

        <div className="mt-4">
          <a
            href="/"
            className="text-blue-400 hover:underline"
          >
            ← Voltar para login normal
          </a>
        </div>
      </div>
    </div>
  );
}
