import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas que precisam de autenticação
const protectedRoutes = [
  '/dashboard',
  '/crm',
  '/financial',
  '/kanban',
  '/reports',
  '/settings',
  '/calculator'
];

// Rotas de autenticação (redirecionar se já logado)
const authRoutes = [
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/setup-profile'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verificar se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Verificar se é uma rota de auth
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Headers de segurança
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Para rotas protegidas, verificar autenticação
  if (isProtectedRoute) {
    // Aqui você pode adicionar verificação de token JWT
    // Por enquanto, apenas permitir acesso
    return response;
  }

  // Para rotas de auth, verificar se já está logado
  if (isAuthRoute) {
    // Aqui você pode verificar se o usuário já está logado
    // e redirecionar para o dashboard
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
