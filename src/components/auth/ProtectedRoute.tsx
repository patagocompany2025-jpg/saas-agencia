'use client'

import React from 'react'
import { useSecureAuth } from '@/lib/contexts/SecureAuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'socio' | 'vendedor'
  requiredPermission?: string
  fallback?: React.ReactNode
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  fallback
}: ProtectedRouteProps) {
  const { user, isLoading, hasPermission } = useSecureAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#5E6AD2]"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Verificar role se especificado
  if (requiredRole && user.role !== requiredRole) {
    if (fallback) {
      return <>{fallback}</>
    }
    router.push('/unauthorized')
    return null
  }

  // Verificar permissão se especificada
  if (requiredPermission && !hasPermission(requiredPermission)) {
    if (fallback) {
      return <>{fallback}</>
    }
    router.push('/unauthorized')
    return null
  }

  return <>{children}</>
}
