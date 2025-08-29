import OpenAI from 'openai';
import { MessageContext, CustomerProfile } from '../baileys/handlers/message-handler';

export class GPTNovoIsraelService {
  private openai: OpenAI;
  private systemPrompt: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.systemPrompt = `Você é o Mega Vendedor AI da Novo Israel, uma empresa evangélica especializada em produtos cristãos.

MISSÃO:
- Evangelizar através do comércio
- Oferecer produtos de qualidade para a igreja
- Criar relacionamentos baseados na fé
- Ser um instrumento de Deus para abençoar vidas

PRODUTOS DISPONÍVEIS:
📖 BÍBLIAS:
- Bíblia NVI (R$ 89,00) - Nova Versão Internacional
- Bíblia King James (R$ 120,00) - Versão clássica
- Bíblia de Estudo (R$ 150,00) - Com comentários

📮 ENVELOPES DÍZIMO:
- Pacote 100 unidades (R$ 25,00)
- Pacote 500 unidades (R$ 95,00)

👕 CAMISETAS FÉ:
- Tamanhos P/M/G/GG (R$ 39,00 cada)
- Frases inspiradoras e versículos

🎁 MATERIAIS CAMPANHA:
- Kit Páscoa (R$ 67,00)
- Kit Natal (R$ 78,00)

PERFIS DE CLIENTES:
1. PASTOR: Usar "Paz do Senhor, Pastor!" - Conhecimento bíblico profundo - Desconto 20%
2. JOVEM: Usar "E aí!" - Linguagem moderna - Desconto 10%
3. MÃE: Usar "Olá querida!" - Tom maternal - Desconto 15%
4. FIEL: Usar "Deus abençoe!" - Evangelização - Desconto 5%
5. NOVO: Usar "Olá! Deus abençoe!" - Apresentação - Sem desconto inicial

DIRETRIZES DE COMUNICAÇÃO:
- Sempre ser respeitoso e amoroso
- Usar linguagem evangélica apropriada
- Incluir versículos bíblicos quando relevante
- Focar na bênção e não apenas na venda
- Oferecer oração quando apropriado
- Ser paciente e compreensivo

COMANDOS ESPECIAIS:
- "catálogo" - Mostrar todos os produtos
- "orar" - Oferecer oração personalizada
- "testemunho" - Compartilhar testemunho
- "versículo" - Compartilhar versículo do dia
- "finalizar" - Finalizar compra
- "carrinho" - Ver itens no carrinho

Lembre-se: Você não é apenas um vendedor, mas um instrumento de Deus para abençoar vidas através dos produtos da Novo Israel.`;

  }

  async processMessage(message: string, context: MessageContext): Promise<string> {
    try {
      const userProfile = context.profile;
      const conversationHistory = context.conversation.slice(-10); // Últimas 10 mensagens

      // Construir mensagens para o GPT
      const messages: any[] = [
        { role: 'system', content: this.systemPrompt }
      ];

      // Adicionar histórico da conversa
      conversationHistory.forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });

      // Adicionar mensagem atual
      messages.push({
        role: 'user',
        content: this.enhanceMessageWithContext(message, userProfile, context)
      });

      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages,
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '500'),
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      let response = completion.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem. Deus abençoe!';

      // Pós-processamento da resposta
      response = this.postProcessResponse(response, userProfile, context);

      return response;

    } catch (error) {
      console.error('Erro ao processar mensagem com GPT:', error);
      return this.getFallbackResponse(message, context.profile);
    }
  }

  private enhanceMessageWithContext(message: string, profile: CustomerProfile, context: MessageContext): string {
    let enhancedMessage = message;

    // Adicionar contexto do perfil
    enhancedMessage += `\n\nCONTEXTO DO CLIENTE:
- Tipo: ${profile.type}
- Confiança: ${profile.confidence}%
- Interesses: ${profile.interests.join(', ') || 'Nenhum detectado'}
- Total de compras: ${profile.totalPurchases}
- Nível de desconto: ${profile.discountLevel}%
- Itens no carrinho: ${context.cart.length}`;

    // Adicionar contexto de carrinho abandonado
    if (context.cart.length > 0) {
      const lastActivity = context.lastActivity;
      const hoursSinceLastActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastActivity > 1) {
        enhancedMessage += `\n- CARRINHO ABANDONADO: Cliente tem ${context.cart.length} item(s) no carrinho há ${Math.round(hoursSinceLastActivity)} horas`;
      }
    }

    return enhancedMessage;
  }

  private postProcessResponse(response: string, profile: CustomerProfile, context: MessageContext): string {
    // Adicionar emojis apropriados baseado no perfil
    let processedResponse = response;

    switch (profile.type) {
      case 'pastor':
        processedResponse = processedResponse.replace(/Deus abençoe/g, 'Deus abençoe, Pastor! 🙏');
        break;
      case 'jovem':
        processedResponse = processedResponse.replace(/Deus abençoe/g, 'Deus abençoe! 😊');
        break;
      case 'mae':
        processedResponse = processedResponse.replace(/Deus abençoe/g, 'Deus abençoe, querida! 💕');
        break;
      default:
        processedResponse = processedResponse.replace(/Deus abençoe/g, 'Deus abençoe! 🙏');
    }

    // Adicionar versículo do dia se não houver um na resposta
    if (!processedResponse.includes('versículo') && !processedResponse.includes('Bíblia')) {
      const dailyVerse = this.getDailyVerse();
      if (Math.random() < 0.3) { // 30% de chance
        processedResponse += `\n\n📖 *Versículo do dia:* "${dailyVerse.verse}" - ${dailyVerse.reference}`;
      }
    }

    return processedResponse;
  }

  private getDailyVerse(): { verse: string; reference: string } {
    const verses = [
      { verse: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.", reference: "João 3:16" },
      { verse: "Posso todas as coisas naquele que me fortalece.", reference: "Filipenses 4:13" },
      { verse: "O Senhor é o meu pastor, nada me faltará.", reference: "Salmos 23:1" },
      { verse: "Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.", reference: "Salmos 37:5" },
      { verse: "Tudo posso naquele que me fortalece.", reference: "Filipenses 4:13" },
      { verse: "Alegrai-vos sempre no Senhor; outra vez digo, alegrai-vos.", reference: "Filipenses 4:4" },
      { verse: "Não temas, porque eu sou contigo; não te assombres, porque eu sou teu Deus; eu te fortaleço, e te ajudo, e te sustento com a destra da minha justiça.", reference: "Isaías 41:10" }
    ];

    const today = new Date();
    const index = today.getDate() % verses.length;
    return verses[index];
  }

  private getFallbackResponse(message: string, profile: CustomerProfile): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('produto') || lowerMessage.includes('bíblia') || lowerMessage.includes('camiseta')) {
      return `Olá! Temos uma variedade de produtos abençoados para você:

📖 Bíblias (NVI, King James, Estudo)
👕 Camisetas com frases inspiradoras
📮 Envelopes para dízimo
🎁 Materiais para campanhas especiais

Digite "catálogo" para ver todos os produtos e preços!

Deus abençoe! 🙏`;
    }

    if (lowerMessage.includes('preço') || lowerMessage.includes('quanto')) {
      return `Nossos preços são muito especiais e abençoados! 

📖 Bíblias a partir de R$ 89,00
👕 Camisetas por R$ 39,00
📮 Envelopes a partir de R$ 25,00

E temos descontos especiais para você! Digite "catálogo" para ver todos os produtos.

Deus abençoe! 🙏`;
    }

    if (lowerMessage.includes('orar') || lowerMessage.includes('oração')) {
      return `Claro! É uma honra orar por você! 🙏

*Oração:* Pai celestial, abençoe este(a) irmão(ã) com sua graça e misericórdia. Guie seus passos e encha seu coração de paz e alegria. Em nome de Jesus, amém!

Como posso ajudá-lo(a) hoje? Temos produtos abençoados que podem fortalecer sua fé! ✨`;
    }

    return `Olá! Deus abençoe! 🙏

Sou o Mega Vendedor AI da Novo Israel. Como posso ajudá-lo(a) hoje?

Temos produtos especiais para fortalecer sua fé:
- Bíblias de qualidade
- Camisetas inspiradoras  
- Materiais para igreja
- E muito mais!

Digite "catálogo" para ver nossos produtos ou me diga o que você está procurando! ✨`;
  }

  async generateProductRecommendation(profile: CustomerProfile, interests: string[]): Promise<string> {
    try {
      const prompt = `Baseado no perfil do cliente (${profile.type}) e interesses (${interests.join(', ')}), 
      recomende 2-3 produtos da Novo Israel que seriam perfeitos para ele(a).
      
      Produtos disponíveis:
      - Bíblias (NVI R$89, King James R$120, Estudo R$150)
      - Envelopes dízimo (Pac 100 R$25, Pac 500 R$95)
      - Camisetas fé (P/M/G/GG R$39)
      - Materiais campanha (Kit Páscoa R$67, Kit Natal R$78)
      
      Responda de forma natural e evangelística.`;

      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      return completion.choices[0]?.message?.content || this.getDefaultRecommendation(profile);
    } catch (error) {
      console.error('Erro ao gerar recomendação:', error);
      return this.getDefaultRecommendation(profile);
    }
  }

  private getDefaultRecommendation(profile: CustomerProfile): string {
    switch (profile.type) {
      case 'pastor':
        return `Pastor, recomendo especialmente nossa Bíblia de Estudo (R$ 150,00) - perfeita para seus estudos e pregações! Também temos envelopes para dízimo em pacotes especiais. Deus abençoe seu ministério! 🙏`;
      case 'jovem':
        return `E aí! Para você recomendo nossas camisetas com frases inspiradoras (R$ 39,00) e a Bíblia NVI (R$ 89,00) - linguagem mais moderna e fácil de entender! 😊`;
      case 'mae':
        return `Querida, para você recomendo o Kit Páscoa (R$ 67,00) para celebrar com a família e a Bíblia NVI (R$ 89,00) para seus momentos de devocional. Deus abençoe sua família! 💕`;
      default:
        return `Recomendo começar com a Bíblia NVI (R$ 89,00) - uma excelente escolha para fortalecer sua fé! Também temos camisetas inspiradoras por apenas R$ 39,00. Deus abençoe! 🙏`;
    }
  }
}
