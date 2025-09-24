import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Verificar se o usuário está autenticado
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Verificar permissões baseadas na rota
    const protectedRoutes = {
      '/dashboard': ['socio', 'vendedor'],
      '/crm': ['socio', 'vendedor'],
      '/kanban': ['socio', 'vendedor'],
      '/financial': ['socio'],
      '/reports': ['socio'],
      '/settings': ['socio', 'vendedor']
    }

    const userRole = token.role as string

    // Verificar se a rota requer permissões específicas
    for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
      if (pathname.startsWith(route)) {
        if (!allowedRoles.includes(userRole)) {
          return NextResponse.redirect(new URL('/unauthorized', req.url))
        }
        break
      }
    }

    // Headers de segurança
    const response = NextResponse.next()
    
    // Configurar headers de segurança
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    
    // Content Security Policy
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'"
    )

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Permitir acesso às rotas públicas
        const publicRoutes = ['/login', '/api/auth', '/unauthorized', '/']
        const { pathname } = req.nextUrl

        if (publicRoutes.some(route => pathname.startsWith(route))) {
          return true
        }

        // Para outras rotas, verificar se há token
        return !!token
      }
    }
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)'
  ]
}
