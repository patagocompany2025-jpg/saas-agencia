import { MessageContext } from '../baileys/handlers/message-handler';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

export class ConversationManager {
  private dataPath: string;

  constructor() {
    this.dataPath = join(process.cwd(), 'data', 'conversations');
    
    if (!existsSync(this.dataPath)) {
      mkdirSync(this.dataPath, { recursive: true });
    }
  }

  async getContext(customerId: string): Promise<MessageContext | null> {
    try {
      const filePath = join(this.dataPath, `${customerId}.json`);
      
      if (!existsSync(filePath)) {
        return null;
      }

      const data = readFileSync(filePath, 'utf8');
      const context = JSON.parse(data);
      
      // Converter strings de data de volta para objetos Date
      context.lastActivity = new Date(context.lastActivity);
      context.profile.lastInteraction = new Date(context.profile.lastInteraction);
      
      if (context.conversation) {
        context.conversation.forEach((msg: any) => {
          msg.timestamp = new Date(msg.timestamp);
        });
      }

      return context;
    } catch (error) {
      console.error('Erro ao carregar contexto:', error);
      return null;
    }
  }

  async saveContext(customerId: string, context: MessageContext): Promise<void> {
    try {
      const filePath = join(this.dataPath, `${customerId}.json`);
      const data = JSON.stringify(context, null, 2);
      writeFileSync(filePath, data);
    } catch (error) {
      console.error('Erro ao salvar contexto:', error);
    }
  }

  async updateConversation(customerId: string, userMessage: string, botResponse: string): Promise<void> {
    const context = await this.getContext(customerId);
    
    if (context) {
      context.conversation.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      });
      
      context.conversation.push({
        role: 'assistant',
        content: botResponse,
        timestamp: new Date()
      });
      
      // Manter apenas as últimas 20 mensagens
      if (context.conversation.length > 20) {
        context.conversation = context.conversation.slice(-20);
      }
      
      context.lastActivity = new Date();
      
      await this.saveContext(customerId, context);
    }
  }

  async getConversationHistory(customerId: string, limit: number = 10): Promise<any[]> {
    const context = await this.getContext(customerId);
    
    if (!context || !context.conversation) {
      return [];
    }
    
    return context.conversation.slice(-limit);
  }

  async clearConversation(customerId: string): Promise<void> {
    const context = await this.getContext(customerId);
    
    if (context) {
      context.conversation = [];
      context.lastActivity = new Date();
      await this.saveContext(customerId, context);
    }
  }

  async getAllCustomers(): Promise<string[]> {
    try {
      const files = require('fs').readdirSync(this.dataPath);
      return files
        .filter((file: string) => file.endsWith('.json'))
        .map((file: string) => file.replace('.json', ''));
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      return [];
    }
  }

  async getActiveCustomers(hoursThreshold: number = 24): Promise<string[]> {
    const customers = await this.getAllCustomers();
    const activeCustomers: string[] = [];
    
    for (const customerId of customers) {
      const context = await this.getContext(customerId);
      
      if (context) {
        const hoursSinceLastActivity = (Date.now() - context.lastActivity.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceLastActivity <= hoursThreshold) {
          activeCustomers.push(customerId);
        }
      }
    }
    
    return activeCustomers;
  }

  async deleteCustomer(customerId: string): Promise<void> {
    try {
      const filePath = join(this.dataPath, `${customerId}.json`);
      
      if (existsSync(filePath)) {
        require('fs').unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
    }
  }

  async getCustomerStats(customerId: string): Promise<{
    totalMessages: number;
    userMessages: number;
    botMessages: number;
    firstInteraction: Date | null;
    lastInteraction: Date | null;
    averageResponseTime: number;
  }> {
    const context = await this.getContext(customerId);
    
    if (!context || !context.conversation) {
      return {
        totalMessages: 0,
        userMessages: 0,
        botMessages: 0,
        firstInteraction: null,
        lastInteraction: null,
        averageResponseTime: 0
      };
    }
    
    const userMessages = context.conversation.filter(msg => msg.role === 'user').length;
    const botMessages = context.conversation.filter(msg => msg.role === 'assistant').length;
    
    let firstInteraction: Date | null = null;
    let lastInteraction: Date | null = null;
    let totalResponseTime = 0;
    let responseCount = 0;
    
    for (let i = 0; i < context.conversation.length - 1; i++) {
      const currentMsg = context.conversation[i];
      const nextMsg = context.conversation[i + 1];
      
      if (currentMsg.role === 'user' && nextMsg.role === 'assistant') {
        const responseTime = nextMsg.timestamp.getTime() - currentMsg.timestamp.getTime();
        totalResponseTime += responseTime;
        responseCount++;
      }
      
      if (!firstInteraction || currentMsg.timestamp < firstInteraction) {
        firstInteraction = currentMsg.timestamp;
      }
      
      if (!lastInteraction || currentMsg.timestamp > lastInteraction) {
        lastInteraction = currentMsg.timestamp;
      }
    }
    
    return {
      totalMessages: context.conversation.length,
      userMessages,
      botMessages,
      firstInteraction,
      lastInteraction,
      averageResponseTime: responseCount > 0 ? totalResponseTime / responseCount : 0
    };
  }
}
