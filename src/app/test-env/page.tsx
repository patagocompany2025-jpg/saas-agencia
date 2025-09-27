'use client';

export default function TestEnvPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste de Variáveis de Ambiente</h1>
      <div className="space-y-2">
        <p><strong>NEXT_PUBLIC_STACK_PROJECT_ID:</strong> {process.env.NEXT_PUBLIC_STACK_PROJECT_ID || 'NÃO CONFIGURADO'}</p>
        <p><strong>NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY:</strong> {process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY ? 'CONFIGURADO' : 'NÃO CONFIGURADO'}</p>
        <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
      </div>
    </div>
  );
}
