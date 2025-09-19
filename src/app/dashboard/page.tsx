'use client';

import React from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { ModernLayout } from '@/components/layout/ModernLayout';
import {
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Plus,
  BarChart3,
  Calculator,
  Kanban,
  FileText,
  Settings,
  Eye,
  ArrowUpRight,
  Activity,
  Target,
  Clock,
  Globe,
  CheckCircle
} from 'lucide-react';
import { useClients } from '@/lib/contexts/ClientContext';
import { useKanban } from '@/lib/contexts/KanbanContext';

// Dados mockados para demonstração
const mockMetrics = {
  totalClients: 156,
  activeLeads: 23,
  monthlyRevenue: 78500,
  monthlyGoal: 80000,
  conversionRate: 18.5,
  averageDealValue: 3200,
  pendingPayments: 8,
  overduePayments: 3,
};

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const { clients } = useClients();
  const { tasks, getTotalValue } = useKanban();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-300">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acesso Negado</h1>
          <p className="text-gray-300">Você precisa fazer login para acessar esta página.</p>
        </div>
      </div>
    );
  }

  const totalValue = tasks.reduce((sum, task) => sum + (task.value || 0), 0);
  const expectedValue = tasks.reduce((sum, task) => sum + (task.expectedValue || 0), 0);

  return (
    <ModernLayout>
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">Dashboard Overview</h2>
            <p className="text-white/60">Monitor sua agência e performance de vendas</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 bg-white/10 border border-white/20 rounded-lg text-white transition-all hover:bg-white/15">
              <BarChart3 className="w-5 h-5" />
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg">
              + Nova Oportunidade
            </button>
          </div>
        </div>
      </header>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-2xl rounded-xl p-6 border border-white/10 shadow-2xl animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <h3 className="text-2xl font-bold text-white">{clients.length}</h3>
          <p className="text-white/60 text-sm">Clientes Ativos</p>
          <div className="mt-3 flex items-center text-green-400 text-sm">
            <span>+12% este mês</span>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl rounded-xl p-6 border border-white/10 shadow-2xl animate-slide-up" style={{animationDelay: '0.1s'}}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
          </div>
          <h3 className="text-2xl font-bold text-white">
            R$ {totalValue.toLocaleString('pt-BR')}
          </h3>
          <p className="text-white/60 text-sm">Vendas Fechadas</p>
          <div className="mt-3 flex items-center text-blue-400 text-sm">
            <span>R$ {expectedValue.toLocaleString('pt-BR')} em pipeline</span>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl rounded-xl p-6 border border-white/10 shadow-2xl animate-slide-up" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
          </div>
          <h3 className="text-2xl font-bold text-white">{tasks.length}</h3>
          <p className="text-white/60 text-sm">Oportunidades</p>
          <div className="mt-3 flex items-center text-purple-400 text-sm">
            <span>{tasks.filter(t => t.status === 'fechado').length} fechadas</span>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl rounded-xl p-6 border border-white/10 shadow-2xl animate-slide-up" style={{animationDelay: '0.3s'}}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
          </div>
          <h3 className="text-2xl font-bold text-white">98.5%</h3>
          <p className="text-white/60 text-sm">Taxa de Conversão</p>
          <div className="mt-3 flex items-center text-orange-400 text-sm">
            <span>+5.2% vs mês anterior</span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Pipeline Visualization */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-2xl rounded-xl p-6 border border-white/10 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Pipeline de Vendas</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm">Ativo</span>
            </div>
          </div>
          <div className="h-80 rounded-xl border border-indigo-400/30 overflow-hidden relative bg-gradient-to-br from-indigo-900/20 to-purple-900/20">
            {/* Pipeline stages */}
            <div className="absolute inset-4 grid grid-cols-7 gap-2 w-full h-full">
              {['Prospecção', 'Qualificação', 'Consultoria', 'Proposta', 'Negociação', 'Fechado', 'Perdido'].map((stage, index) => {
                const stageTasks = tasks.filter(t => {
                  const statusMap = ['prospeccao', 'qualificacao', 'consultoria', 'proposta', 'negociacao', 'fechado', 'perdido'];
                  return t.status === statusMap[index];
                });
                
                return (
                  <div key={stage} className="bg-white/10 backdrop-blur-xl rounded-lg p-3 border border-white/20 animate-bounce-subtle h-fit">
                    <div className="bg-gradient-to-r from-indigo-500/30 to-blue-500/30 text-white text-xs px-2 py-1 rounded mb-2 text-center">
                      {stage}
                    </div>
                    <div className="text-center text-white text-lg font-bold">
                      {stageTasks.length}
                    </div>
                    <div className="text-center text-white/60 text-xs">
                      R$ {stageTasks.reduce((sum, t) => sum + (t.expectedValue || 0), 0).toLocaleString('pt-BR')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white/5 backdrop-blur-2xl rounded-xl p-6 border border-white/10 shadow-2xl animate-fade-in" style={{animationDelay: '0.2s'}}>
          <h3 className="text-xl font-semibold text-white mb-6">Atividade Recente</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm">Nova oportunidade criada</p>
                <p className="text-white/60 text-xs">Patagônia Aventura - Alice Johnson</p>
                <p className="text-white/40 text-xs">2 minutos atrás</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm">Cliente atualizado</p>
                <p className="text-white/60 text-xs">Bob Williams - Status alterado</p>
                <p className="text-white/40 text-xs">5 minutos atrás</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm">Proposta enviada</p>
                <p className="text-white/60 text-xs">Família Brown - Europa</p>
                <p className="text-white/40 text-xs">1 hora atrás</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Horas de Atendimento Ativo */}
      <div className="bg-white/5 backdrop-blur-2xl rounded-xl p-6 border border-white/10 shadow-2xl animate-fade-in" style={{animationDelay: '0.4s'}}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Clock className="w-5 h-5 mr-2 text-green-400" />
            Horas de Atendimento Ativo
          </h3>
          <select className="bg-white/10 border border-white/20 text-white text-sm rounded-lg px-3 py-2">
            <option>Esta Semana</option>
            <option>Semana Passada</option>
            <option>Últimos 30 dias</option>
          </select>
        </div>
        
        {/* Resumo da Semana */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">42h</div>
            <div className="text-xs text-white/70">Total Semana</div>
          </div>
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">8.4h</div>
            <div className="text-xs text-white/70">Média/Dia</div>
          </div>
          <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">12</div>
            <div className="text-xs text-white/70">Atendimentos</div>
          </div>
          <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-orange-400">3.5h</div>
            <div className="text-xs text-white/70">Tempo Médio</div>
          </div>
        </div>

        {/* Gráfico de Barras - Dias da Semana */}
        <div className="h-40 flex items-end space-x-2 mb-4">
          <div className="flex-1 flex flex-col items-center">
            <div className="h-20 bg-gradient-to-t from-green-500 to-green-400 rounded-t opacity-90 w-full"></div>
            <div className="text-xs text-white/60 mt-2">Seg</div>
            <div className="text-xs text-green-400 font-semibold">8h</div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="h-24 bg-gradient-to-t from-green-500 to-green-400 rounded-t opacity-95 w-full"></div>
            <div className="text-xs text-white/60 mt-2">Ter</div>
            <div className="text-xs text-green-400 font-semibold">9.5h</div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="h-16 bg-gradient-to-t from-green-500 to-green-400 rounded-t opacity-85 w-full"></div>
            <div className="text-xs text-white/60 mt-2">Qua</div>
            <div className="text-xs text-green-400 font-semibold">6h</div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="h-28 bg-gradient-to-t from-green-500 to-green-400 rounded-t opacity-100 w-full"></div>
            <div className="text-xs text-white/60 mt-2">Qui</div>
            <div className="text-xs text-green-400 font-semibold">10h</div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="h-32 bg-gradient-to-t from-green-500 to-green-400 rounded-t opacity-100 w-full"></div>
            <div className="text-xs text-white/60 mt-2">Sex</div>
            <div className="text-xs text-green-400 font-semibold">12h</div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="h-8 bg-gradient-to-t from-gray-500 to-gray-400 rounded-t opacity-60 w-full"></div>
            <div className="text-xs text-white/60 mt-2">Sáb</div>
            <div className="text-xs text-gray-400 font-semibold">2h</div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="h-4 bg-gradient-to-t from-gray-500 to-gray-400 rounded-t opacity-40 w-full"></div>
            <div className="text-xs text-white/60 mt-2">Dom</div>
            <div className="text-xs text-gray-400 font-semibold">0.5h</div>
          </div>
        </div>

        {/* Status de Produtividade */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-sm text-white/80">Meta: 40h/semana</span>
          </div>
          <div className="text-sm text-green-400 font-semibold">
            +5% vs semana anterior
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-gradient-to-r from-indigo-500/20 to-blue-500/20 backdrop-blur-2xl rounded-xl p-6 border border-indigo-500/30 text-white">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Novo Cliente
          </h3>
          <p className="text-white/70 mb-4">Adicione um novo cliente ao seu CRM</p>
          <button 
            onClick={() => window.location.href = '/crm'}
            className="bg-white/20 border border-white/30 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-all"
          >
            Adicionar Cliente
          </button>
        </div>

        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-2xl rounded-xl p-6 border border-green-500/30 text-white">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <Kanban className="w-5 h-5 mr-2" />
            Nova Oportunidade
          </h3>
          <p className="text-white/70 mb-4">Crie uma nova oportunidade no pipeline</p>
          <button 
            onClick={() => window.location.href = '/kanban'}
            className="bg-white/20 border border-white/30 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-all"
          >
            Criar Oportunidade
          </button>
        </div>

        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-2xl rounded-xl p-6 border border-purple-500/30 text-white">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <Calculator className="w-5 h-5 mr-2" />
            Calcular Preço
          </h3>
          <p className="text-white/70 mb-4">Use nossa calculadora de preços</p>
          <button 
            onClick={() => window.location.href = '/calculator'}
            className="bg-white/20 border border-white/30 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-all"
          >
            Calcular
          </button>
        </div>
      </div>
    </ModernLayout>
  );
}