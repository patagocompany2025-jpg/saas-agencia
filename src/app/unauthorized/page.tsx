'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Shield, ArrowLeft, Home } from 'lucide-react'

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="bg-[#101014] min-h-screen flex items-center justify-center text-white font-sans">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#5E6AD2]/10 via-[#101014] to-[#5E6AD2]/10 pointer-events-none -z-10"></div>
      
      <div className="w-full max-w-md mx-auto p-8 rounded-2xl shadow-2xl border border-white/10 bg-[#181821] backdrop-blur text-center">
        {/* Ícone */}
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 rounded-full bg-red-500/20 border border-red-500/30">
            <Shield className="h-12 w-12 text-red-400" />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold mb-2 text-red-400">Acesso Negado</h1>
        <p className="text-gray-400 mb-8 text-sm">
          Você não tem permissão para acessar esta página.
        </p>

        {/* Botões de ação */}
        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full py-3 bg-[#5E6AD2] text-white font-semibold rounded-full hover:bg-opacity-90 transition flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </button>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 bg-white/10 text-white font-semibold rounded-full hover:bg-opacity-90 transition flex items-center justify-center space-x-2"
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </button>
        </div>

        {/* Informações adicionais */}
        <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-xs text-gray-400">
            Se você acredita que deveria ter acesso a esta página, entre em contato com um administrador.
          </p>
        </div>
      </div>
    </div>
  )
}
