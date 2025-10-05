'use client';

import { useState } from 'react';

export default function Entrada() {
  const [email, setEmail] = useState('patagocompany2025@gmail.com');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    setLogs(prev => [...prev, `[${timestamp}] ${msg}`]);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLogs([]); // Limpar logs anteriores

    addLog('🚀 INICIANDO LOGIN...');
    addLog(`📧 Email: ${email}`);

    try {
      addLog('🌐 Chamando API /api/user/sync...');

      const response = await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stack_user_id: email })
      });

      addLog(`📊 Status HTTP: ${response.status}`);

      const data = await response.json();
      addLog(`📦 Resposta recebida: ${JSON.stringify(data).substring(0, 100)}...`);

      if (data.success && data.user) {
        addLog('✅ LOGIN BEM-SUCEDIDO!');
        addLog(`👤 Usuário: ${data.user.displayName || data.user.email}`);
        addLog(`🔑 Role: ${data.user.role}`);

        localStorage.setItem('demo_user', JSON.stringify(data.user));
        addLog('💾 Dados salvos no localStorage');

        addLog('🎯 Redirecionando para /dashboard em 2 segundos...');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else if (data.error) {
        addLog(`❌ ERRO: ${data.error}`);
        if (data.details) {
          addLog(`📋 Detalhes: ${JSON.stringify(data.details)}`);
        }
      } else {
        addLog('❌ Usuário não encontrado');
      }
    } catch (err: any) {
      addLog(`❌ ERRO DE REDE: ${err.message}`);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'monospace'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '700px',
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🚀</div>
          <h1 style={{ margin: '0 0 5px', color: '#667eea' }}>Login Patagonian</h1>
          <p style={{ margin: 0, color: '#888' }}>Sistema de Gestão - v3.0 (Nova Rota)</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #667eea',
                borderRadius: '8px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '18px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            🚀 FAZER LOGIN AGORA
          </button>
        </form>

        {/* Logs em tempo real */}
        {logs.length > 0 && (
          <div style={{
            marginTop: '30px',
            padding: '20px',
            background: '#1a1a1a',
            borderRadius: '8px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            <div style={{ color: '#00ff00', fontSize: '12px', fontFamily: 'monospace' }}>
              {logs.map((log, i) => (
                <div key={i} style={{ marginBottom: '5px' }}>{log}</div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#f0f0f0',
          borderRadius: '8px',
          fontSize: '13px',
          textAlign: 'center'
        }}>
          <strong>📍 URL:</strong> /entrada (nova rota sem cache)
        </div>
      </div>
    </div>
  );
}
