'use client'

import { useSecureAuth } from '@/lib/contexts/SecureAuthContext'

export function usePermissions() {
  const { user, hasPermission, isAdmin } = useSecureAuth()

  const canAccess = (permission: string): boolean => {
    return hasPermission(permission)
  }

  const canManageUsers = (): boolean => {
    return isAdmin || hasPermission('gerenciarUsuarios')
  }

  const canAccessFinancial = (): boolean => {
    return isAdmin || hasPermission('financeiro')
  }

  const canAccessReports = (): boolean => {
    return isAdmin || hasPermission('relatorios')
  }

  const canManageCompany = (): boolean => {
    return isAdmin || hasPermission('configuracoesEmpresa')
  }

  const canManageData = (): boolean => {
    return isAdmin || hasPermission('configuracoesDados')
  }

  return {
    user,
    isAdmin,
    canAccess,
    canManageUsers,
    canAccessFinancial,
    canAccessReports,
    canManageCompany,
    canManageData
  }
}
