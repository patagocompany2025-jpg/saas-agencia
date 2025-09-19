export interface User {
  id: string;
  name: string;
  email: string;
  role: 'socio' | 'vendedor';
  avatar?: string;
  createdAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  status: 'lead' | 'prospect' | 'cliente' | 'inativo';
  source: string;
  notes?: string;
  assignedTo?: string; // ID do vendedor
  createdAt: Date;
  updatedAt: Date;
}

export interface Lead {
  id: string;
  clientId: string;
  service: string;
  value: number;
  status: 'novo' | 'contato' | 'proposta' | 'negociacao' | 'fechado' | 'perdido';
  priority: 'baixa' | 'media' | 'alta';
  expectedCloseDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: 'passeio' | 'hospedagem' | 'transporte' | 'pacote';
  isActive: boolean;
  createdAt: Date;
}

export interface FinancialTransaction {
  id: string;
  type: 'receita' | 'despesa';
  category: 'vendas' | 'pro_labore' | 'salarios' | 'lucros' | 'contas_fixas' | 'sistemas' | 'outros';
  description: string;
  amount: number;
  dueDate: Date | null;
  paidDate?: Date | null;
  status: 'pendente' | 'pago' | 'vencido' | 'cancelado';
  paymentMethod?: 'dinheiro' | 'pix' | 'transferencia' | 'cartao' | 'boleto';
  notes?: string;
  recurring?: boolean;
  recurringInterval?: 'mensal' | 'trimestral' | 'semestral' | 'anual';
  assignedTo?: string; // Para pro labore e salários
  clientId?: string;
  leadId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  salary: number;
  hireDate: Date;
  isActive: boolean;
}

export interface Alert {
  id: string;
  type: 'vencimento' | 'meta' | 'lead' | 'sistema';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'baixa' | 'media' | 'alta';
  createdAt: Date;
  dueDate?: Date;
}

export interface DashboardMetrics {
  totalClients: number;
  activeLeads: number;
  monthlyRevenue: number;
  monthlyGoal: number;
  conversionRate: number;
  averageDealValue: number;
  pendingPayments: number;
  overduePayments: number;
}

export interface KanbanColumn {
  id: string;
  title: string;
  leads: Lead[];
  color: string;
}

export interface KanbanTask {
  id: string;
  clientId: string;
  title: string;
  status: 'prospeccao' | 'qualificacao' | 'consultoria' | 'proposta' | 'negociacao' | 'fechado' | 'perdido';
  priority: 'baixa' | 'media' | 'alta';
  value: number;
  expectedValue?: number; // Valor esperado para pacotes personalizados
  destination: string;
  travelDates: {
    departure?: Date;
    return?: Date;
    flexible?: boolean;
  };
  travelers: {
    adults: number;
    children: number;
    infants: number;
  };
  budget: {
    min?: number;
    max?: number;
    disclosed: boolean;
  };
  interests: string[]; // Ex: aventura, luxo, cultural, relaxamento
  accommodation: {
    type: 'hotel' | 'pousada' | 'resort' | 'airbnb' | 'indiferente';
    category: 'economico' | 'medio' | 'superior' | 'luxo';
  };
  notes: string;
  nextAction: {
    type: 'call' | 'email' | 'meeting' | 'proposal' | 'follow_up';
    description: string;
    dueDate: Date;
    completed: boolean;
  };
  source: 'website' | 'facebook' | 'instagram' | 'google' | 'indicacao' | 'evento' | 'outros';
  assignedTo?: string; // ID do vendedor responsável
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para o módulo financeiro

export interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  role: 'socio' | 'vendedor' | 'administrativo';
  salary: number;
  proLabore?: number; // Apenas para sócios
  profitShare?: number; // Percentual de participação nos lucros
  paymentDay: number; // Dia do mês para pagamento
  bankAccount: {
    bank: string;
    agency: string;
    account: string;
    pix?: string;
  };
  isActive: boolean;
  hireDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  dueDay: number; // Dia do mês
  category: 'aluguel' | 'energia' | 'agua' | 'internet' | 'telefone' | 'sistemas' | 'outros';
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialAlert {
  id: string;
  type: 'payment_due' | 'overdue' | 'low_balance' | 'recurring_payment';
  title: string;
  description: string;
  amount?: number;
  dueDate?: Date;
  priority: 'baixa' | 'media' | 'alta';
  isRead: boolean;
  createdAt: Date;
}

export interface CalculatorResult {
  basePrice: number;
  markup: number;
  finalPrice: number;
  profit: number;
  margin: number;
}
