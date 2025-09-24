import bcrypt from 'bcryptjs'
import { env } from '../../config/env'

/**
 * Hash de senha com salt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, env.BCRYPT_ROUNDS)
}

/**
 * Verificação de senha
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * Validação de força da senha
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < env.PASSWORD_MIN_LENGTH) {
    errors.push(`Senha deve ter pelo menos ${env.PASSWORD_MIN_LENGTH} caracteres`)
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Senha deve conter pelo menos um número')
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Senha deve conter pelo menos um caractere especial (@$!%*?&)')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Geração de token seguro
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * Sanitização de entrada para prevenir XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < e >
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

/**
 * Validação de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 255
}

/**
 * Rate limiting simples em memória (para desenvolvimento)
 * Em produção, usar Redis ou similar
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(identifier: string): {
  allowed: boolean
  remaining: number
  resetTime: number
} {
  const now = Date.now()
  const windowMs = env.RATE_LIMIT_WINDOW * 1000
  const maxAttempts = env.RATE_LIMIT_MAX_ATTEMPTS
  
  const current = rateLimitMap.get(identifier)
  
  if (!current || now > current.resetTime) {
    // Reset window
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    })
    
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      resetTime: now + windowMs
    }
  }
  
  if (current.count >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime
    }
  }
  
  // Increment counter
  current.count++
  rateLimitMap.set(identifier, current)
  
  return {
    allowed: true,
    remaining: maxAttempts - current.count,
    resetTime: current.resetTime
  }
}

/**
 * Limpeza de dados sensíveis para logs
 */
export function sanitizeForLogging(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data
  }
  
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth']
  const sanitized = { ...data }
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]'
    }
  }
  
  return sanitized
}

/**
 * Validação de sessão
 */
export function isSessionValid(expires: Date): boolean {
  return new Date() < expires
}

/**
 * Geração de ID seguro
 */
export function generateSecureId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
