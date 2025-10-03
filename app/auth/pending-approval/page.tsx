'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PendingApprovalPage() {
  const router = useRouter();

  return (
    <div className="bg-[#101014] min-h-screen flex items-center justify-center text-white font-sans">
      <div className="absolute inset-0 bg-gradient-to-b from-[#5E6AD2]/10 via-[#101014] to-[#5E6AD2]/10 pointer-events-none -z-10"></div>

      <div className="w-full max-w-md mx-auto p-8 rounded-2xl shadow-2xl border border-white/10 bg-[#181821] backdrop-blur">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2 text-white">Aguardando Aprovação</h2>
          <p className="text-gray-400 mb-6 text-sm">
            Sua conta foi criada com sucesso! Agora aguarde a aprovação de um administrador.
          </p>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-yellow-400 text-sm">
              <Mail className="h-4 w-4" />
              <span>Você receberá um email quando sua conta for aprovada</span>
            </div>
          </div>

          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Conta criada com sucesso</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span>Aguardando aprovação do administrador</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-blue-500" />
              <span>Notificação por email será enviada</span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <Button
              onClick={() => router.push('/auth/sign-in')}
              className="w-full bg-[#5E6AD2] text-white font-semibold rounded-full hover:bg-opacity-90 transition"
            >
              Voltar ao Login
            </Button>
            
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="w-full border-white/20 text-white hover:bg-white/10 transition"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
