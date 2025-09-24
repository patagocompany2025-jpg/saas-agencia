'use client'

import React from 'react'
import { useSecureAuth } from '@/lib/contexts/SecureAuthContext'
import { usePermissions } from '@/lib/hooks/usePermissions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ModernLayout } from '@/components/layout/ModernLayout'

export default function TestAuthPage() {
  const { user, isLoading, logout } = useSecureAuth()
  const { canManageUsers, canAccessFinancial, canAccessReports, isAdmin } = usePermissions()

  if (isLoading) {
    return (
      <ModernLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#5E6AD2]"></div>
        </div>
      </ModernLayout>
    )
  }

  return (
    <ModernLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-white">Teste de Autenticação</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informações do usuário */}
          <Card className="bg-[#181821] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Informações do Usuário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <strong className="text-white">Nome:</strong> {user?.name || 'N/A'}
              </div>
              <div>
                <strong className="text-white">Email:</strong> {user?.email || 'N/A'}
              </div>
              <div>
                <strong className="text-white">Role:</strong> {user?.role || 'N/A'}
              </div>
              <div>
                <strong className="text-white">ID:</strong> {user?.id || 'N/A'}
              </div>
            </CardContent>
          </Card>

          {/* Permissões */}
          <Card className="bg-[#181821] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Permissões</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <strong className="text-white">É Admin:</strong> {isAdmin ? 'Sim' : 'Não'}
              </div>
              <div>
                <strong className="text-white">Pode gerenciar usuários:</strong> {canManageUsers() ? 'Sim' : 'Não'}
              </div>
              <div>
                <strong className="text-white">Pode acessar financeiro:</strong> {canAccessFinancial() ? 'Sim' : 'Não'}
              </div>
              <div>
                <strong className="text-white">Pode acessar relatórios:</strong> {canAccessReports() ? 'Sim' : 'Não'}
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <Card className="bg-[#181821] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Ações</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={logout}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Logout
              </Button>
            </CardContent>
          </Card>

          {/* Debug Info */}
          <Card className="bg-[#181821] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Debug Info</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs text-gray-400 overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </ModernLayout>
  )
}
