'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Cache buster - força recompilação
const BUILD_VERSION = '2024-01-' + Date.now();

export default function Home() {
  const [email, setEmail] = useState('patagocompany2025@gmail.com');
  const [logs, setLogs] = useState<string[]>([]);
  const router = useRouter();

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('pt-BR');
    setLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLogs([]); // Limpar logs

    addLog('🚀 INICIANDO LOGIN...');
    addLog(`📧 Email: ${email}`);
    addLog(`🔧 Build: ${BUILD_VERSION}`);

    try {
      addLog('🌐 Enviando para /api/user/sync...');

      const response = await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stack_user_id: email })
      });

      addLog(`📊 Status HTTP: ${response.status}`);

      const data = await response.json();
      addLog(`📦 Resposta: ${JSON.stringify(data).substring(0, 80)}...`);

      if (data.success && data.user) {
        addLog('✅ LOGIN SUCESSO!');
        addLog(`👤 Usuário: ${data.user.displayName || data.user.email}`);
        addLog(`🔑 Role: ${data.user.role}`);

        localStorage.setItem('demo_user', JSON.stringify(data.user));
        addLog('💾 Salvo no localStorage');

        addLog('🎯 Redirecionando em 2s...');
        setTimeout(() => {
          addLog('🚀 REDIRECIONANDO AGORA!');
          window.location.href = '/dashboard';
        }, 2000);
      } else if (data.error) {
        addLog(`❌ ERRO: ${data.error}`);
        if (data.details) {
          addLog(`📋 Detalhes: ${JSON.stringify(data.details)}`);
        }
      } else {
        addLog(`❌ Resposta inesperada: ${JSON.stringify(data)}`);
      }
    } catch (err: any) {
      addLog(`❌ ERRO CATCH: ${err.message}`);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, #1a1a2e, #16213e)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '450px',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px'
          }}>
            🚀
          </div>
          <h1 style={{ color: 'white', fontSize: '28px', margin: '0 0 10px' }}>
            Login Patagonian
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0 }}>
            Sistema de Gestão - v4.0 LOGS
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: 'white',
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* LOGS EM TEMPO REAL */}
          {logs.length > 0 && (
            <div style={{
              padding: '15px',
              borderRadius: '10px',
              marginBottom: '20px',
              background: '#000',
              border: '1px solid #00ff00',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {logs.map((log, i) => (
                <div key={i} style={{
                  color: '#00ff00',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  marginBottom: '3px'
                }}>
                  {log}
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              boxSizing: 'border-box'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Entrar no Sistema
          </button>
        </form>

        {/* Info */}
        <div style={{
          marginTop: '25px',
          padding: '15px',
          borderRadius: '10px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        }}>
          <div style={{ color: 'rgba(147, 197, 253, 1)', fontSize: '13px', textAlign: 'center' }}>
            <strong>Email:</strong> patagocompany2025@gmail.com
          </div>
        </div>
      </div>
    </div>
  );
}
