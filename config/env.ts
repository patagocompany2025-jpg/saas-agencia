
export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL || "file:./prisma/dev.db",
  
  // NextAuth.js
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "development-secret-key-123456789",
  
  // JWT Secret para assinatura de tokens
  JWT_SECRET: process.env.JWT_SECRET || "your-jwt-secret-here-change-in-production",
  
  // Configurações de segurança
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || "12"),
  SESSION_MAX_AGE: parseInt(process.env.SESSION_MAX_AGE || "86400"), // 24 horas
  PASSWORD_MIN_LENGTH: parseInt(process.env.PASSWORD_MIN_LENGTH || "8"),
  MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS || "5"),
  LOCKOUT_DURATION: parseInt(process.env.LOCKOUT_DURATION || "900"), // 15 minutos
  
  // Rate limiting
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || "900"), // 15 minutos
  RATE_LIMIT_MAX_ATTEMPTS: parseInt(process.env.RATE_LIMIT_MAX_ATTEMPTS || "5"),
  
  // Configurações de email
  EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST || "",
  EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT || "",
  EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER || "",
  EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD || "",
  EMAIL_FROM: process.env.EMAIL_FROM || "",
} as const;
