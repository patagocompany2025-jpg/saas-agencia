import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  size?: string;
  addedAt: Date;
}

export interface Cart {
  customerId: string;
  items: CartItem[];
  total: number;
  discount: number;
  finalTotal: number;
  lastUpdated: Date;
}

export class CartManager {
  private dataPath: string;

  constructor() {
    this.dataPath = join(process.cwd(), 'data', 'carts');
    
    if (!existsSync(this.dataPath)) {
      mkdirSync(this.dataPath, { recursive: true });
    }
  }

  async getCart(customerId: string): Promise<Cart> {
    try {
      const filePath = join(this.dataPath, `${customerId}.json`);
      
      if (!existsSync(filePath)) {
        return this.createEmptyCart(customerId);
      }

      const data = readFileSync(filePath, 'utf8');
      const cart = JSON.parse(data);
      
      // Converter strings de data de volta para objetos Date
      cart.lastUpdated = new Date(cart.lastUpdated);
      cart.items.forEach((item: CartItem) => {
        item.addedAt = new Date(item.addedAt);
      });

      return cart;
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
      return this.createEmptyCart(customerId);
    }
  }

  private createEmptyCart(customerId: string): Cart {
    return {
      customerId,
      items: [],
      total: 0,
      discount: 0,
      finalTotal: 0,
      lastUpdated: new Date()
    };
  }

  async saveCart(cart: Cart): Promise<void> {
    try {
      const filePath = join(this.dataPath, `${cart.customerId}.json`);
      const data = JSON.stringify(cart, null, 2);
      writeFileSync(filePath, data);
    } catch (error) {
      console.error('Erro ao salvar carrinho:', error);
    }
  }

  async addItem(customerId: string, item: Omit<CartItem, 'addedAt'>): Promise<Cart> {
    const cart = await this.getCart(customerId);
    
    // Verificar se o item já existe
    const existingItemIndex = cart.items.findIndex(
      existingItem => existingItem.id === item.id && existingItem.size === item.size
    );
    
    if (existingItemIndex >= 0) {
      // Atualizar quantidade do item existente
      cart.items[existingItemIndex]!.quantity += item.quantity;
    } else {
      // Adicionar novo item
      cart.items.push({
        ...item,
        addedAt: new Date()
      });
    }
    
    // Recalcular totais
    this.recalculateCart(cart);
    
    await this.saveCart(cart);
    return cart;
  }

  async updateItemQuantity(customerId: string, itemId: string, quantity: number, size?: string): Promise<Cart> {
    const cart = await this.getCart(customerId);
    
    const itemIndex = cart.items.findIndex(
      item => item.id === itemId && item.size === size
    );
    
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        // Remover item se quantidade for 0 ou negativa
        cart.items.splice(itemIndex, 1);
      } else {
        // Atualizar quantidade
        cart.items[itemIndex]!.quantity = quantity;
      }
      
      this.recalculateCart(cart);
      await this.saveCart(cart);
    }
    
    return cart;
  }

  async removeItem(customerId: string, itemId: string, size?: string): Promise<Cart> {
    const cart = await this.getCart(customerId);
    
    const itemIndex = cart.items.findIndex(
      item => item.id === itemId && item.size === size
    );
    
    if (itemIndex >= 0) {
      cart.items.splice(itemIndex, 1);
      this.recalculateCart(cart);
      await this.saveCart(cart);
    }
    
    return cart;
  }

  async clearCart(customerId: string): Promise<Cart> {
    const cart = this.createEmptyCart(customerId);
    await this.saveCart(cart);
    return cart;
  }

  async applyDiscount(customerId: string, discountPercentage: number): Promise<Cart> {
    const cart = await this.getCart(customerId);
    
    cart.discount = discountPercentage;
    this.recalculateCart(cart);
    
    await this.saveCart(cart);
    return cart;
  }

  async removeDiscount(customerId: string): Promise<Cart> {
    const cart = await this.getCart(customerId);
    
    cart.discount = 0;
    this.recalculateCart(cart);
    
    await this.saveCart(cart);
    return cart;
  }

  private recalculateCart(cart: Cart): void {
    // Calcular total dos itens
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calcular desconto
    const discountAmount = (cart.total * cart.discount) / 100;
    
    // Calcular total final
    cart.finalTotal = cart.total - discountAmount;
    
    // Atualizar timestamp
    cart.lastUpdated = new Date();
  }

  async getCartSummary(customerId: string): Promise<{
    itemCount: number;
    total: number;
    discount: number;
    finalTotal: number;
    lastUpdated: Date;
  }> {
    const cart = await this.getCart(customerId);
    
    return {
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      total: cart.total,
      discount: cart.discount,
      finalTotal: cart.finalTotal,
      lastUpdated: cart.lastUpdated
    };
  }

  async getAbandonedCarts(hoursThreshold: number = 2): Promise<Cart[]> {
    try {
      const files = require('fs').readdirSync(this.dataPath);
      const abandonedCarts: Cart[] = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const customerId = file.replace('.json', '');
          const cart = await this.getCart(customerId);
          
          if (cart.items.length > 0) {
            const hoursSinceUpdate = (Date.now() - cart.lastUpdated.getTime()) / (1000 * 60 * 60);
            
            if (hoursSinceUpdate >= hoursThreshold) {
              abandonedCarts.push(cart);
            }
          }
        }
      }
      
      return abandonedCarts;
    } catch (error) {
      console.error('Erro ao buscar carrinhos abandonados:', error);
      return [];
    }
  }

  async getCartItems(customerId: string): Promise<CartItem[]> {
    const cart = await this.getCart(customerId);
    return cart.items;
  }

  async getCartTotal(customerId: string): Promise<number> {
    const cart = await this.getCart(customerId);
    return cart.finalTotal;
  }

  async isCartEmpty(customerId: string): Promise<boolean> {
    const cart = await this.getCart(customerId);
    return cart.items.length === 0;
  }

  async getCartAge(customerId: string): Promise<number> {
    const cart = await this.getCart(customerId);
    
    if (cart.items.length === 0) {
      return 0;
    }
    
    const oldestItem = cart.items.reduce((oldest, item) => 
      item.addedAt < oldest.addedAt ? item : oldest
    );
    
    return (Date.now() - oldestItem.addedAt.getTime()) / (1000 * 60 * 60); // horas
  }

  // Método para formatar carrinho para exibição
  formatCartForDisplay(cart: Cart): string {
    if (cart.items.length === 0) {
      return `🛒 *Seu carrinho está vazio*
      
Adicione produtos para começar suas compras! 🙏`;
    }

    let message = `🛒 *Seu Carrinho*\n\n`;
    
    cart.items.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      const sizeInfo = item.size ? ` (${item.size})` : '';
      message += `${index + 1}. *${item.name}*${sizeInfo}\n`;
      message += `   💰 R$ ${item.price.toFixed(2)} x ${item.quantity} = R$ ${itemTotal.toFixed(2)}\n\n`;
    });
    
    message += `📊 *Resumo:*\n`;
    message += `Subtotal: R$ ${cart.total.toFixed(2)}\n`;
    
    if (cart.discount > 0) {
      const discountAmount = cart.total - cart.finalTotal;
      message += `Desconto (${cart.discount}%): -R$ ${discountAmount.toFixed(2)}\n`;
    }
    
    message += `*Total: R$ ${cart.finalTotal.toFixed(2)}*\n\n`;
    
    message += `💡 *Comandos:*\n`;
    message += `• "finalizar" - Finalizar compra\n`;
    message += `• "limpar" - Limpar carrinho\n`;
    message += `• "produtos" - Ver catálogo\n`;
    
    return message;
  }
}
