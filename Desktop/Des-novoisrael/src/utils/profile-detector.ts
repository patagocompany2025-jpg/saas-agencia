import { CustomerProfile, MessageContext } from '../baileys/handlers/message-handler';

export class ProfileDetector {
  private pastorKeywords = [
    'pastor', 'pr', 'reverendo', 'ministro', 'pregador', 'igreja', 'congregação',
    'sermão', 'pregação', 'ministério', 'evangelho', 'palavra de deus', 'bíblia',
    'estudo bíblico', 'discipulado', 'liderança', 'ovelhas', 'rebanho'
  ];

  private youngKeywords = [
    'jovem', 'adolescente', 'teen', 'galera', 'mano', 'cara', 'beleza', 'top',
    'legal', 'massa', 'show', 'daora', 'foda', 'maneiro', 'irado', 'demais',
    'instagram', 'tiktok', 'snapchat', 'festa', 'balada', 'rolê', 'encontro'
  ];

  private motherKeywords = [
    'mãe', 'mamãe', 'filho', 'filha', 'criança', 'bebê', 'família', 'casa',
    'cozinha', 'limpeza', 'organização', 'educação', 'escola', 'tarefa',
    'alimentação', 'saúde', 'cuidado', 'amor', 'carinho', 'proteção'
  ];

  private faithfulKeywords = [
    'fiel', 'crente', 'cristão', 'evangélico', 'protestante', 'batista',
    'pentecostal', 'assembleia', 'igreja', 'culto', 'adoração', 'louvor',
    'oração', 'jejum', 'dízimo', 'oferta', 'missão', 'evangelismo'
  ];

  async detectProfile(message: string, context: MessageContext): Promise<CustomerProfile> {
    const lowerMessage = message.toLowerCase();
    const currentProfile = context.profile;
    
    // Análise de palavras-chave
    const scores = {
      pastor: this.calculateScore(lowerMessage, this.pastorKeywords),
      jovem: this.calculateScore(lowerMessage, this.youngKeywords),
      mae: this.calculateScore(lowerMessage, this.motherKeywords),
      fiel: this.calculateScore(lowerMessage, this.faithfulKeywords)
    };

    // Análise de linguagem e estilo
    const languageAnalysis = this.analyzeLanguage(message);
    
    // Análise de contexto histórico
    const historicalAnalysis = this.analyzeHistoricalContext(context);

    // Combinar análises
    const finalScores = this.combineAnalyses(scores, languageAnalysis, historicalAnalysis);
    
    // Determinar perfil dominante
    const dominantProfile = this.getDominantProfile(finalScores);
    
    // Calcular confiança
    const confidence = this.calculateConfidence(finalScores, dominantProfile);
    
    // Detectar interesses
    const interests = this.detectInterests(lowerMessage, context);
    
    // Atualizar perfil
    const updatedProfile: CustomerProfile = {
      type: dominantProfile,
      confidence,
      interests: [...new Set([...currentProfile.interests, ...interests])],
      lastInteraction: new Date(),
      totalPurchases: currentProfile.totalPurchases,
      discountLevel: this.calculateDiscountLevel(dominantProfile, confidence, currentProfile.totalPurchases)
    };

    return updatedProfile;
  }

  private calculateScore(message: string, keywords: string[]): number {
    let score = 0;
    
    for (const keyword of keywords) {
      if (message.includes(keyword)) {
        score += 1;
        
        // Bônus para palavras mais específicas
        if (keyword.length > 5) {
          score += 0.5;
        }
      }
    }
    
    return score;
  }

  private analyzeLanguage(message: string): any {
    const analysis = {
      formal: 0,
      informal: 0,
      religious: 0,
      modern: 0
    };

    // Análise de formalidade
    if (message.includes('você') || message.includes('senhor') || message.includes('senhora')) {
      analysis.formal += 2;
    }
    
    if (message.includes('vc') || message.includes('mano') || message.includes('cara')) {
      analysis.informal += 2;
    }

    // Análise religiosa
    const religiousWords = ['deus', 'jesus', 'senhor', 'bíblia', 'igreja', 'oração', 'bênção', 'amém'];
    for (const word of religiousWords) {
      if (message.toLowerCase().includes(word)) {
        analysis.religious += 1;
      }
    }

    // Análise de linguagem moderna
    const modernWords = ['top', 'show', 'legal', 'massa', 'daora', 'irado', 'demais'];
    for (const word of modernWords) {
      if (message.toLowerCase().includes(word)) {
        analysis.modern += 1;
      }
    }

    return analysis;
  }

  private analyzeHistoricalContext(context: MessageContext): any {
    const analysis = {
      pastor: 0,
      jovem: 0,
      mae: 0,
      fiel: 0
    };

    // Analisar histórico de conversas
    for (const msg of context.conversation) {
      if (msg.role === 'user') {
        const lowerMsg = msg.content.toLowerCase();
        
        // Contar palavras-chave no histórico
        for (const keyword of this.pastorKeywords) {
          if (lowerMsg.includes(keyword)) analysis.pastor += 0.5;
        }
        for (const keyword of this.youngKeywords) {
          if (lowerMsg.includes(keyword)) analysis.jovem += 0.5;
        }
        for (const keyword of this.motherKeywords) {
          if (lowerMsg.includes(keyword)) analysis.mae += 0.5;
        }
        for (const keyword of this.faithfulKeywords) {
          if (lowerMsg.includes(keyword)) analysis.fiel += 0.5;
        }
      }
    }

    // Analisar produtos no carrinho
    for (const item of context.cart) {
      if (item.category === 'biblia' || item.category === 'envelopes') {
        analysis.pastor += 1;
        analysis.fiel += 1;
      }
      if (item.category === 'camisetas') {
        analysis.jovem += 1;
      }
      if (item.category === 'kits') {
        analysis.mae += 1;
      }
    }

    return analysis;
  }

  private combineAnalyses(keywordScores: any, languageAnalysis: any, historicalAnalysis: any): any {
    return {
      pastor: keywordScores.pastor * 2 + languageAnalysis.formal * 0.5 + historicalAnalysis.pastor,
      jovem: keywordScores.jovem * 2 + languageAnalysis.informal * 1 + languageAnalysis.modern * 1 + historicalAnalysis.jovem,
      mae: keywordScores.mae * 2 + languageAnalysis.formal * 0.3 + historicalAnalysis.mae,
      fiel: keywordScores.fiel * 2 + languageAnalysis.religious * 1 + historicalAnalysis.fiel
    };
  }

  private getDominantProfile(scores: any): 'pastor' | 'jovem' | 'mae' | 'fiel' | 'novo' {
    const maxScore = Math.max(...Object.values(scores));
    
    if (maxScore === 0) {
      return 'novo';
    }

    for (const [profile, score] of Object.entries(scores)) {
      if (score === maxScore) {
        return profile as any;
      }
    }

    return 'novo';
  }

  private calculateConfidence(scores: any, dominantProfile: string): number {
    const maxScore = Math.max(...Object.values(scores));
    const totalScore = Object.values(scores).reduce((sum: number, score: any) => sum + score, 0);
    
    if (totalScore === 0) {
      return 0;
    }

    // Confiança baseada na dominância do perfil
    const dominance = maxScore / totalScore;
    
    // Confiança baseada na força absoluta do score
    const strength = Math.min(maxScore / 10, 1); // Normalizar para 0-1
    
    return Math.round((dominance * 0.7 + strength * 0.3) * 100);
  }

  private detectInterests(message: string, context: MessageContext): string[] {
    const interests: string[] = [];
    
    // Detectar interesses baseados na mensagem
    if (message.includes('bíblia') || message.includes('biblia')) {
      interests.push('biblia', 'estudo');
    }
    
    if (message.includes('camiseta') || message.includes('roupa')) {
      interests.push('moda', 'vestuario');
    }
    
    if (message.includes('envelope') || message.includes('dízimo')) {
      interests.push('igreja', 'administracao');
    }
    
    if (message.includes('kit') || message.includes('páscoa') || message.includes('natal')) {
      interests.push('datas especiais', 'celebracao');
    }
    
    if (message.includes('orar') || message.includes('oração')) {
      interests.push('vida espiritual', 'devocional');
    }
    
    if (message.includes('preço') || message.includes('valor') || message.includes('quanto')) {
      interests.push('precos', 'economia');
    }

    // Adicionar interesses baseados no histórico
    if (context.profile.interests.length > 0) {
      interests.push(...context.profile.interests);
    }

    return interests;
  }

  private calculateDiscountLevel(
    profileType: string, 
    confidence: number, 
    totalPurchases: number
  ): number {
    let baseDiscount = 0;

    switch (profileType) {
      case 'pastor':
        baseDiscount = 20;
        break;
      case 'jovem':
        baseDiscount = 10;
        break;
      case 'mae':
        baseDiscount = 15;
        break;
      case 'fiel':
        baseDiscount = 5;
        break;
      default:
        baseDiscount = 0;
    }

    // Bônus por confiança alta
    if (confidence > 80) {
      baseDiscount += 5;
    }

    // Bônus por histórico de compras
    if (totalPurchases > 0) {
      baseDiscount += Math.min(totalPurchases * 2, 10);
    }

    return Math.min(baseDiscount, 30); // Máximo 30%
  }

  // Método para detectar mudança de perfil
  detectProfileChange(oldProfile: CustomerProfile, newProfile: CustomerProfile): boolean {
    if (oldProfile.type !== newProfile.type) {
      return true;
    }

    // Mudança significativa na confiança
    if (Math.abs(oldProfile.confidence - newProfile.confidence) > 20) {
      return true;
    }

    return false;
  }

  // Método para obter sugestões de produtos baseadas no perfil
  getProductSuggestions(profile: CustomerProfile): string[] {
    switch (profile.type) {
      case 'pastor':
        return ['Bíblia de Estudo', 'Envelopes Dízimo 500', 'Kit Páscoa'];
      case 'jovem':
        return ['Camisetas Fé', 'Bíblia NVI', 'Kit Natal'];
      case 'mae':
        return ['Kit Páscoa', 'Bíblia NVI', 'Camisetas Fé'];
      case 'fiel':
        return ['Bíblia King James', 'Envelopes Dízimo 100', 'Kit Páscoa'];
      default:
        return ['Bíblia NVI', 'Camisetas Fé', 'Kit Páscoa'];
    }
  }
}
