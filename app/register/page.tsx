'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companySlug, setCompanySlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validações no cliente
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (password === '123456') {
      setError('Não pode usar "123456" como senha');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          companySlug: companySlug.toLowerCase().trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setCompanyName(data.companyName);
        // Limpar formulário
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setCompanySlug('');
      } else {
        setError(data.error || 'Erro ao criar solicitação');
        if (data.details && Array.isArray(data.details)) {
          setError(data.details.join(', '));
        }
      }
    } catch (err) {
      setError('Erro ao processar solicitação. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <img
              src="/LOGO_HORI_WHITE.png"
              alt="Patagonia"
              className="h-20 mx-auto mb-4"
            />
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-white mb-2">Solicitação Enviada!</h1>
            <p className="text-white/60">Sua solicitação foi enviada com sucesso</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
              <p className="text-green-200 text-sm">
                <strong>✓ Cadastro enviado para aprovação</strong>
              </p>
              <p className="text-green-200/80 text-xs mt-2">
                Empresa: <strong>{companyName}</strong>
              </p>
              <p className="text-green-200/80 text-xs mt-1">
                Email: <strong>{email}</strong>
              </p>
            </div>

            <div className="p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
              <p className="text-blue-200 text-sm">
                <strong>📬 Próximos passos:</strong>
              </p>
              <ol className="list-decimal list-inside text-blue-200/80 text-xs mt-2 space-y-1">
                <li>Aguarde a aprovação do administrador da empresa</li>
                <li>Você receberá uma notificação por email</li>
                <li>Após aprovação, faça login com suas credenciais</li>
              </ol>
            </div>

            <Link href="/simple-login">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-all">
                Voltar para Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <img
            src="/LOGO_HORI_WHITE.png"
            alt="Patagonia"
            className="h-20 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-white mb-2">Criar Conta</h1>
          <p className="text-white/60">Solicite acesso ao sistema</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-white mb-2 font-medium">Nome Completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="João Silva"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="joao@empresa.com"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2 font-medium">Código da Empresa</label>
            <input
              type="text"
              value={companySlug}
              onChange={(e) => setCompanySlug(e.target.value)}
              placeholder="patagonia"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-indigo-500"
              required
            />
            <p className="text-white/40 text-xs mt-1">
              Solicite este código ao administrador da sua empresa
            </p>
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
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-white mb-2 font-medium">Confirmar Senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-indigo-500"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3 text-sm text-blue-200">
            <p className="font-semibold mb-1">💡 Informações importantes:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Sua solicitação será enviada para aprovação</li>
              <li>O administrador da empresa receberá sua solicitação</li>
              <li>Você poderá fazer login após a aprovação</li>
            </ul>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Solicitar Acesso'}
          </Button>

          <div className="text-center">
            <Link href="/simple-login" className="text-white/60 hover:text-white text-sm transition-colors">
              Já tem uma conta? <strong>Fazer Login</strong>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
