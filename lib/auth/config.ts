import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
// const { sql } = require('../neon')
// import { verifyPassword } from './security'
// import { env } from '../../config/env'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Usuários de teste temporários
        const testUsers = [
          {
            id: '1',
            email: 'joao@socio.com',
            name: 'João Silva',
            password: '123456',
            role: 'socio'
          },
          {
            id: '2',
            email: 'maria@vendedor.com',
            name: 'Maria Santos',
            password: '123456',
            role: 'vendedor'
          }
        ]

        const user = testUsers.find(u => u.email === credentials.email)
        
        if (!user || user.password !== credentials.password) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: null,
          image: null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 86400 // 24 horas
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET || "development-secret-key-123456789",
    maxAge: 86400 // 24 horas
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.permissions = user.permissions
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.permissions = token.permissions as any
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Evitar loops de redirecionamento
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      // Se a URL já contém o baseUrl, retornar como está
      if (url.startsWith(baseUrl)) {
        return url
      }
      // Para URLs externas, redirecionar para o dashboard
      return `${baseUrl}/dashboard`
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  secret: process.env.NEXTAUTH_SECRET || "development-secret-key-123456789",
  debug: process.env.NODE_ENV === 'development'
}
