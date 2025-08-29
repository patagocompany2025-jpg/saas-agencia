export class RateLimiter {
  private limits: Map<string, { count: number; resetTime: number }> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 50, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  checkLimit(identifier: string): boolean {
    const now = Date.now();
    const limit = this.limits.get(identifier);

    if (!limit) {
      // Primeira requisição
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }

    // Verificar se a janela de tempo expirou
    if (now > limit.resetTime) {
      // Resetar contador
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }

    // Verificar se ainda há requisições disponíveis
    if (limit.count < this.maxRequests) {
      limit.count++;
      return true;
    }

    // Limite atingido
    return false;
  }

  getRemainingRequests(identifier: string): number {
    const limit = this.limits.get(identifier);
    
    if (!limit) {
      return this.maxRequests;
    }

    const now = Date.now();
    
    if (now > limit.resetTime) {
      return this.maxRequests;
    }

    return Math.max(0, this.maxRequests - limit.count);
  }

  getResetTime(identifier: string): number {
    const limit = this.limits.get(identifier);
    return limit ? limit.resetTime : Date.now() + this.windowMs;
  }

  reset(identifier: string): void {
    this.limits.delete(identifier);
  }

  resetAll(): void {
    this.limits.clear();
  }

  getStats(identifier: string): {
    remaining: number;
    resetTime: number;
    total: number;
  } {
    const limit = this.limits.get(identifier);
    
    if (!limit) {
      return {
        remaining: this.maxRequests,
        resetTime: Date.now() + this.windowMs,
        total: this.maxRequests
      };
    }

    return {
      remaining: this.getRemainingRequests(identifier),
      resetTime: limit.resetTime,
      total: this.maxRequests
    };
  }

  // Método para limpar entradas expiradas
  cleanup(): void {
    const now = Date.now();
    
    for (const [identifier, limit] of this.limits.entries()) {
      if (now > limit.resetTime) {
        this.limits.delete(identifier);
      }
    }
  }

  // Executar limpeza periodicamente
  startCleanupInterval(intervalMs: number = 300000): void { // 5 minutos
    setInterval(() => {
      this.cleanup();
    }, intervalMs);
  }
}
