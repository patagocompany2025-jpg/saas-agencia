import { CustomerProfile } from '../baileys/handlers/message-handler';

export interface DiscountInfo {
  discount: number;
  reason: string;
  validUntil: Date;
  code?: string;
  conditions: string[];
}

export class DiscountEngine {
  private baseDiscounts = {
    pastor: 20,
    jovem: 10,
    mae: 15,
    fiel: 5,
    novo: 0
  };

  private specialDiscounts = {
    firstPurchase: 15,
    abandonedCart: 15,
    bulkPurchase: 10,
    seasonal: 20,
    loyalty: 5
  };

  calculateDiscount(profile: CustomerProfile): DiscountInfo {
    let totalDiscount = 0;
    const reasons: string[] = [];
    const conditions: string[] = [];

    // Desconto base no perfil
    const baseDiscount = this.baseDiscounts[profile.type] || 0;
    totalDiscount += baseDiscount;
    
    if (baseDiscount > 0) {
      reasons.push(this.getProfileDiscountReason(profile.type));
    }

    // Desconto por confiança alta
    if (profile.confidence > 80) {
      const confidenceDiscount = 5;
      totalDiscount += confidenceDiscount;
      reasons.push(`Cliente fiel (${profile.confidence}% confiança)`);
      conditions.push('Confiança alta detectada');
    }

    // Desconto por histórico de compras
    if (profile.totalPurchases > 0) {
      const loyaltyDiscount = Math.min(profile.totalPurchases * 2, 10);
      totalDiscount += loyaltyDiscount;
      reasons.push(`Cliente recorrente (${profile.totalPurchases} compras)`);
      conditions.push('Histórico de compras');
    }

    // Desconto sazonal
    const seasonalDiscount = this.getSeasonalDiscount();
    if (seasonalDiscount > 0) {
      totalDiscount += seasonalDiscount;
      reasons.push(`Oferta sazonal (${seasonalDiscount}%)`);
      conditions.push('Promoção sazonal ativa');
    }

    // Desconto especial para primeira compra
    if (profile.totalPurchases === 0) {
      const firstPurchaseDiscount = this.specialDiscounts.firstPurchase;
      totalDiscount += firstPurchaseDiscount;
      reasons.push('Primeira compra');
      conditions.push('Cliente novo');
    }

    // Limitar desconto máximo
    totalDiscount = Math.min(totalDiscount, 40);

    // Gerar código de desconto
    const discountCode = this.generateDiscountCode(profile.type, totalDiscount);

    return {
      discount: totalDiscount,
      reason: reasons.join(', '),
      validUntil: this.calculateExpirationDate(),
      code: discountCode,
      conditions
    };
  }

  private getProfileDiscountReason(profileType: string): string {
    switch (profileType) {
      case 'pastor':
        return 'Desconto especial para pastores';
      case 'jovem':
        return 'Desconto para jovens';
      case 'mae':
        return 'Desconto para mães';
      case 'fiel':
        return 'Desconto para fiéis';
      default:
        return 'Desconto padrão';
    }
  }

  private getSeasonalDiscount(): number {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    // Páscoa (março/abril)
    if ((month === 3 && day >= 20) || (month === 4 && day <= 10)) {
      return this.specialDiscounts.seasonal;
    }

    // Natal (dezembro)
    if (month === 12) {
      return this.specialDiscounts.seasonal;
    }

    // Aniversário da empresa (exemplo: agosto)
    if (month === 8) {
      return 15;
    }

    return 0;
  }

  private generateDiscountCode(profileType: string, discount: number): string {
    const prefix = this.getProfilePrefix(profileType);
    const timestamp = Date.now().toString().slice(-4);
    const discountStr = discount.toString().padStart(2, '0');
    
    return `${prefix}${discountStr}${timestamp}`.toUpperCase();
  }

  private getProfilePrefix(profileType: string): string {
    switch (profileType) {
      case 'pastor':
        return 'PR';
      case 'jovem':
        return 'JV';
      case 'mae':
        return 'MA';
      case 'fiel':
        return 'FL';
      default:
        return 'NI';
    }
  }

  private calculateExpirationDate(): Date {
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + 7); // Válido por 7 dias
    return expiration;
  }

  // Calcular desconto para carrinho abandonado
  calculateAbandonedCartDiscount(cartValue: number, hoursAbandoned: number): DiscountInfo {
    let discount = this.specialDiscounts.abandonedCart;
    
    // Aumentar desconto baseado no tempo abandonado
    if (hoursAbandoned > 24) {
      discount += 5;
    }
    if (hoursAbandoned > 48) {
      discount += 5;
    }

    // Aumentar desconto baseado no valor do carrinho
    if (cartValue > 100) {
      discount += 5;
    }
    if (cartValue > 200) {
      discount += 5;
    }

    discount = Math.min(discount, 30); // Máximo 30%

    return {
      discount,
      reason: `Carrinho abandonado há ${hoursAbandoned} horas`,
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      code: `ABANDON${discount.toString().padStart(2, '0')}`,
      conditions: ['Carrinho abandonado', 'Oferta por tempo limitado']
    };
  }

  // Calcular desconto para compra em volume
  calculateBulkDiscount(items: any[]): DiscountInfo {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    let discount = 0;

    if (totalItems >= 5) {
      discount = 5;
    }
    if (totalItems >= 10) {
      discount = 10;
    }
    if (totalItems >= 20) {
      discount = 15;
    }

    return {
      discount,
      reason: `Compra em volume (${totalItems} itens)`,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      code: `BULK${discount.toString().padStart(2, '0')}`,
      conditions: [`Mínimo ${totalItems} itens`]
    };
  }

  // Validar código de desconto
  validateDiscountCode(code: string, profile: CustomerProfile): DiscountInfo | null {
    // Implementar validação de códigos de desconto
    // Por enquanto, retorna null
    return null;
  }

  // Aplicar desconto ao preço
  applyDiscount(originalPrice: number, discountInfo: DiscountInfo): {
    originalPrice: number;
    discountAmount: number;
    finalPrice: number;
    discountPercentage: number;
  } {
    const discountAmount = (originalPrice * discountInfo.discount) / 100;
    const finalPrice = originalPrice - discountAmount;

    return {
      originalPrice,
      discountAmount,
      finalPrice,
      discountPercentage: discountInfo.discount
    };
  }

  // Gerar mensagem de desconto personalizada
  generateDiscountMessage(discountInfo: DiscountInfo, profile: CustomerProfile): string {
    let message = `🎉 *OFERTA ESPECIAL PARA VOCÊ!*\n\n`;
    
    message += `💰 *${discountInfo.discount}% de desconto*\n`;
    message += `📝 Motivo: ${discountInfo.reason}\n`;
    
    if (discountInfo.code) {
      message += `🎫 Código: *${discountInfo.code}*\n`;
    }
    
    message += `⏰ Válido até: ${discountInfo.validUntil.toLocaleDateString('pt-BR')}\n\n`;
    
    // Personalizar baseado no perfil
    switch (profile.type) {
      case 'pastor':
        message += `Pastor, esta é uma bênção especial de Deus para seu ministério! 🙏`;
        break;
      case 'jovem':
        message += `E aí! Aproveita essa oferta massa! 😊`;
        break;
      case 'mae':
        message += `Querida, Deus tem algo especial preparado para você! 💕`;
        break;
      case 'fiel':
        message += `Fiel servo, Deus recompensa sua fidelidade! 🙏`;
        break;
      default:
        message += `Deus abençoe! Esta oferta é especial para você! ✨`;
    }
    
    return message;
  }

  // Verificar se desconto ainda é válido
  isDiscountValid(discountInfo: DiscountInfo): boolean {
    return new Date() < discountInfo.validUntil;
  }

  // Obter desconto recomendado baseado no comportamento
  getRecommendedDiscount(profile: CustomerProfile, cartValue: number, itemsCount: number): DiscountInfo {
    const baseDiscount = this.calculateDiscount(profile);
    
    // Ajustar baseado no valor do carrinho
    if (cartValue > 150) {
      baseDiscount.discount += 5;
    }
    
    // Ajustar baseado na quantidade de itens
    if (itemsCount > 3) {
      baseDiscount.discount += 3;
    }
    
    baseDiscount.discount = Math.min(baseDiscount.discount, 35);
    
    return baseDiscount;
  }
}
