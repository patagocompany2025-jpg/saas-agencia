'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Verificar se há usuário logado
    const demoUser = localStorage.getItem('demo_user');
    if (!demoUser) {
      router.push('/simple-login');
      return;
    }

    const userData = JSON.parse(demoUser);
    setUser(userData);

    // Se não precisa trocar senha, redirecionar para dashboard
    if (!userData.requirePasswordChange) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validações no cliente
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (newPassword === '123456') {
      setError('Não pode usar a senha temporária como nova senha');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        // Atualizar localStorage removendo flag de troca de senha
        const updatedUser = {
          ...user,
          requirePasswordChange: false
        };
        localStorage.setItem('demo_user', JSON.stringify(updatedUser));

        // Redirecionar para dashboard
        router.push('/dashboard');
        window.location.reload();
      } else {
        setError(data.error || 'Erro ao trocar senha');
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

  if (!user) {
    return null;
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
          <h1 className="text-3xl font-bold text-white mb-2">Trocar Senha</h1>
          <p className="text-white/60">É necessário trocar sua senha temporária</p>
        </div>

        <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
          <p className="text-yellow-200 text-sm">
            <strong>⚠️ Atenção:</strong> Por segurança, você deve criar uma nova senha.
          </p>
          <p className="text-yellow-200/80 text-xs mt-1">
            Usuário: <strong>{user.email}</strong>
          </p>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-6">
          <div>
            <label className="block text-white mb-2 font-medium">Nova Senha</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Digite sua nova senha"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-indigo-500"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-white mb-2 font-medium">Confirmar Nova Senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Digite novamente"
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
            <p className="font-semibold mb-1">💡 Requisitos da senha:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Mínimo de 6 caracteres</li>
              <li>Não pode ser a senha temporária (123456)</li>
            </ul>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
          >
            {loading ? 'Atualizando...' : 'Atualizar Senha'}
          </Button>
        </form>
      </div>
    </div>
  );
}
