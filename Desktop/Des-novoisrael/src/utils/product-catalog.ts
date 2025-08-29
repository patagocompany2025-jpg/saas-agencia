export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sizes?: string[];
  inStock: boolean;
  tags: string[];
  imageUrl?: string;
}

export class ProductCatalog {
  private products: Product[] = [
    // BÍBLIAS
    {
      id: 'biblia-nvi',
      name: 'Bíblia NVI',
      description: 'Nova Versão Internacional - Linguagem moderna e fácil de entender. Perfeita para estudos e leitura diária.',
      price: 89.00,
      category: 'biblia',
      inStock: true,
      tags: ['biblia', 'nvi', 'estudo', 'leitura', 'palavra']
    },
    {
      id: 'biblia-king-james',
      name: 'Bíblia King James',
      description: 'Versão clássica e tradicional. Ideal para estudos profundos e referência bíblica.',
      price: 120.00,
      category: 'biblia',
      inStock: true,
      tags: ['biblia', 'king james', 'classica', 'estudo', 'referencia']
    },
    {
      id: 'biblia-estudo',
      name: 'Bíblia de Estudo',
      description: 'Bíblia com comentários detalhados, mapas e notas explicativas. Perfeita para pastores e líderes.',
      price: 150.00,
      category: 'biblia',
      inStock: true,
      tags: ['biblia', 'estudo', 'comentarios', 'pastor', 'lider']
    },

    // ENVELOPES DÍZIMO
    {
      id: 'envelope-100',
      name: 'Envelopes Dízimo - Pacote 100',
      description: 'Pacote com 100 envelopes para dízimo e ofertas. Ideal para igrejas e congregações.',
      price: 25.00,
      category: 'envelopes',
      inStock: true,
      tags: ['envelope', 'dizimo', 'oferta', 'igreja', 'administracao']
    },
    {
      id: 'envelope-500',
      name: 'Envelopes Dízimo - Pacote 500',
      description: 'Pacote econômico com 500 envelopes para dízimo. Melhor custo-benefício para igrejas grandes.',
      price: 95.00,
      category: 'envelopes',
      inStock: true,
      tags: ['envelope', 'dizimo', 'oferta', 'igreja', 'economico']
    },

    // CAMISETAS FÉ
    {
      id: 'camiseta-fe-p',
      name: 'Camiseta Fé - Tamanho P',
      description: 'Camiseta com frases inspiradoras e versículos bíblicos. Tamanho P.',
      price: 39.00,
      category: 'camisetas',
      sizes: ['P'],
      inStock: true,
      tags: ['camiseta', 'fe', 'inspiracao', 'versiculo', 'moda']
    },
    {
      id: 'camiseta-fe-m',
      name: 'Camiseta Fé - Tamanho M',
      description: 'Camiseta com frases inspiradoras e versículos bíblicos. Tamanho M.',
      price: 39.00,
      category: 'camisetas',
      sizes: ['M'],
      inStock: true,
      tags: ['camiseta', 'fe', 'inspiracao', 'versiculo', 'moda']
    },
    {
      id: 'camiseta-fe-g',
      name: 'Camiseta Fé - Tamanho G',
      description: 'Camiseta com frases inspiradoras e versículos bíblicos. Tamanho G.',
      price: 39.00,
      category: 'camisetas',
      sizes: ['G'],
      inStock: true,
      tags: ['camiseta', 'fe', 'inspiracao', 'versiculo', 'moda']
    },
    {
      id: 'camiseta-fe-gg',
      name: 'Camiseta Fé - Tamanho GG',
      description: 'Camiseta com frases inspiradoras e versículos bíblicos. Tamanho GG.',
      price: 39.00,
      category: 'camisetas',
      sizes: ['GG'],
      inStock: true,
      tags: ['camiseta', 'fe', 'inspiracao', 'versiculo', 'moda']
    },

    // MATERIAIS CAMPANHA
    {
      id: 'kit-pascoa',
      name: 'Kit Páscoa',
      description: 'Kit completo para celebração da Páscoa. Inclui materiais para escola bíblica e atividades especiais.',
      price: 67.00,
      category: 'kits',
      inStock: true,
      tags: ['kit', 'pascoa', 'celebracao', 'escola biblica', 'atividades']
    },
    {
      id: 'kit-natal',
      name: 'Kit Natal',
      description: 'Kit especial para celebração do Natal. Materiais para decoração e atividades natalinas.',
      price: 78.00,
      category: 'kits',
      inStock: true,
      tags: ['kit', 'natal', 'celebracao', 'decoracao', 'atividades']
    }
  ];

  getAllProducts(): Product[] {
    return this.products;
  }

  getProductsByCategory(category: string): Product[] {
    return this.products.filter(product => product.category === category);
  }

  findProduct(productName: string): Product | null {
    const lowerName = productName.toLowerCase();
    
    return this.products.find(product => 
      product.name.toLowerCase().includes(lowerName) ||
      product.id.toLowerCase().includes(lowerName) ||
      product.tags.some(tag => tag.toLowerCase().includes(lowerName))
    ) || null;
  }

  searchProducts(query: string): Product[] {
    const lowerQuery = query.toLowerCase();
    
    return this.products.filter(product =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery) ||
      product.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  getProductsByPriceRange(minPrice: number, maxPrice: number): Product[] {
    return this.products.filter(product => 
      product.price >= minPrice && product.price <= maxPrice
    );
  }

  getAvailableProducts(): Product[] {
    return this.products.filter(product => product.inStock);
  }

  getProductById(id: string): Product | null {
    return this.products.find(product => product.id === id) || null;
  }

  getCatalogByCategory(): Record<string, Product[]> {
    const catalog: Record<string, Product[]> = {};
    
    this.products.forEach(product => {
      if (!catalog[product.category]) {
        catalog[product.category] = [];
      }
      catalog[product.category]!.push(product);
    });
    
    return catalog;
  }

  formatCatalogForDisplay(): string {
    const catalog = this.getCatalogByCategory();
    let message = `📖 *CATÁLOGO NOVO ISRAEL*\n\n`;
    
    // BÍBLIAS
    message += `📖 *BÍBLIAS:*\n`;
    catalog['biblia']?.forEach(product => {
      message += `• ${product.name} - R$ ${product.price.toFixed(2)}\n`;
      message += `  ${product.description.substring(0, 60)}...\n\n`;
    });
    
    // ENVELOPES
    message += `📮 *ENVELOPES DÍZIMO:*\n`;
    catalog['envelopes']?.forEach(product => {
      message += `• ${product.name} - R$ ${product.price.toFixed(2)}\n`;
      message += `  ${product.description.substring(0, 60)}...\n\n`;
    });
    
    // CAMISETAS
    message += `👕 *CAMISETAS FÉ:*\n`;
    catalog['camisetas']?.forEach(product => {
      const sizes = product.sizes?.join(', ') || '';
      message += `• ${product.name} - R$ ${product.price.toFixed(2)}\n`;
      message += `  Tamanhos: ${sizes}\n`;
      message += `  ${product.description.substring(0, 60)}...\n\n`;
    });
    
    // KITS
    message += `🎁 *MATERIAIS CAMPANHA:*\n`;
    catalog['kits']?.forEach(product => {
      message += `• ${product.name} - R$ ${product.price.toFixed(2)}\n`;
      message += `  ${product.description.substring(0, 60)}...\n\n`;
    });
    
    message += `💡 *Para comprar:* Digite "adicionar [nome do produto]"\n`;
    message += `💡 *Para ver detalhes:* Digite o nome do produto\n`;
    message += `💡 *Para finalizar:* Digite "finalizar"\n\n`;
    message += `Deus abençoe suas escolhas! 🙏`;
    
    return message;
  }

  formatProductForDisplay(product: Product): string {
    let message = `📦 *${product.name}*\n\n`;
    message += `${product.description}\n\n`;
    message += `💰 *Preço:* R$ ${product.price.toFixed(2)}\n`;
    
    if (product.sizes && product.sizes.length > 0) {
      message += `📏 *Tamanhos disponíveis:* ${product.sizes.join(', ')}\n`;
    }
    
    message += `📦 *Disponível:* ${product.inStock ? '✅ Sim' : '❌ Não'}\n`;
    message += `🏷️ *Categoria:* ${this.getCategoryDisplayName(product.category)}\n\n`;
    
    message += `💡 *Para adicionar ao carrinho:*\n`;
    message += `Digite "adicionar ${product.name}"`;
    
    if (product.sizes && product.sizes.length > 0) {
      message += ` e especifique o tamanho`;
    }
    
    message += `\n\nDeus abençoe! 🙏`;
    
    return message;
  }

  private getCategoryDisplayName(category: string): string {
    const categoryNames: Record<string, string> = {
      'biblia': 'Bíblias',
      'envelopes': 'Envelopes Dízimo',
      'camisetas': 'Camisetas Fé',
      'kits': 'Materiais Campanha'
    };
    
    return categoryNames[category] || category;
  }

  getProductSuggestions(customerType: string): Product[] {
    switch (customerType) {
      case 'pastor':
        return this.products.filter(p => 
          p.category === 'biblia' || p.category === 'envelopes'
        );
      case 'jovem':
        return this.products.filter(p => 
          p.category === 'camisetas' || p.id === 'biblia-nvi'
        );
      case 'mae':
        return this.products.filter(p => 
          p.category === 'kits' || p.id === 'biblia-nvi'
        );
      case 'fiel':
        return this.products.filter(p => 
          p.category === 'biblia' || p.category === 'kits'
        );
      default:
        return this.products.slice(0, 3); // Primeiros 3 produtos
    }
  }

  getFeaturedProducts(): Product[] {
    return [
      this.getProductById('biblia-nvi')!,
      this.getProductById('camiseta-fe-m')!,
      this.getProductById('kit-pascoa')!
    ].filter(Boolean);
  }

  getNewArrivals(): Product[] {
    // Simular produtos novos (últimos 3 adicionados)
    return this.products.slice(-3);
  }

  getBestSellers(): Product[] {
    // Simular produtos mais vendidos
    return [
      this.getProductById('biblia-nvi')!,
      this.getProductById('envelope-100')!,
      this.getProductById('camiseta-fe-g')!
    ].filter(Boolean);
  }
}
