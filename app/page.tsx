'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [email, setEmail] = useState('patagocompany2025@gmail.com');
  const [status, setStatus] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setStatus('🔵 PASSO 1: Botão clicado, iniciando...');

    try {
      setStatus('🔵 PASSO 2: Enviando requisição...');

      const response = await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stack_user_id: email })
      });

      setStatus(`🔵 PASSO 3: Status HTTP = ${response.status}`);

      const data = await response.json();
      setStatus(`🔵 PASSO 4: data.success = ${data.success}, data.user = ${data.user ? 'SIM' : 'NÃO'}`);

      if (data.success && data.user) {
        setStatus(`✅ PASSO 5: Usuário encontrado! Email: ${data.user.email}`);

        localStorage.setItem('demo_user', JSON.stringify(data.user));
        setStatus('✅ PASSO 6: Dados salvos no localStorage');

        setStatus('✅ PASSO 7: Iniciando redirecionamento em 2s...');
        setTimeout(() => {
          setStatus('✅ PASSO 8: REDIRECIONANDO AGORA!');
          window.location.href = '/dashboard';
        }, 2000);
      } else if (data.error) {
        setStatus(`❌ ERRO API: ${data.error}`);
      } else {
        setStatus(`❌ Resposta inesperada: ${JSON.stringify(data)}`);
      }
    } catch (err: any) {
      setStatus(`❌ ERRO CATCH: ${err.message}`);
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
            Sistema de Gestão - v2.0
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

          {/* Status */}
          {status && (
            <div style={{
              padding: '15px',
              borderRadius: '10px',
              marginBottom: '20px',
              background: status.includes('❌')
                ? 'rgba(239, 68, 68, 0.1)'
                : status.includes('✅')
                ? 'rgba(34, 197, 94, 0.1)'
                : 'rgba(59, 130, 246, 0.1)',
              border: `1px solid ${
                status.includes('❌')
                  ? 'rgba(239, 68, 68, 0.3)'
                  : status.includes('✅')
                  ? 'rgba(34, 197, 94, 0.3)'
                  : 'rgba(59, 130, 246, 0.3)'
              }`,
              color: 'white',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {status}
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
