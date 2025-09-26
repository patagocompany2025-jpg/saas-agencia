'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useFinancial } from '@/lib/contexts/FinancialContext';
import { useKanban } from '@/lib/contexts/KanbanContext';
import { useClients } from '@/lib/contexts/ClientContext';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  BarChart3, 
  TrendingUp, 
  ArrowLeft, 
  Download, 
  Target,
  DollarSign,
  Users,
  Activity,
  Zap,
  Crown,
  Clock,
  XCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  Line,
  Area,
  AreaChart,
  ComposedChart
} from 'recharts';
import { 
  exportReportData, 
  exportExecutiveReportPDF,
  exportDIEReportPDF,
  exportSalesReportPDF,
  exportFinancialReportPDF,
  exportPerformanceReportPDF,
  exportGrowthAnalysisPDF
} from '@/lib/utils/export';

export default function ReportsPage() {
  // Todos os hooks devem ser chamados no topo
  const { user, isLoading } = useAuth();
  const { transactions, getTotalRevenue, getTotalExpenses } = useFinancial();
  const { tasks } = useKanban();
  const { clients } = useClients();
  
  const [activeReport, setActiveReport] = useState<string>('executive');
  const [selectedPipelineSlice, setSelectedPipelineSlice] = useState<number | null>(null);

  // Cálculos com useMemo
  const metrics = useMemo(() => {
    const totalRevenue = getTotalRevenue();
    const totalExpenses = getTotalExpenses();
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    
    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin
    };
  }, [getTotalRevenue, getTotalExpenses]);

  const activeClients = useMemo(() => {
    return clients.filter(client => client.status === 'ativo').length;
  }, [clients]);

  const conversionRate = useMemo(() => {
    const totalClients = clients.length;
    const activeClientsCount = activeClients;
    return totalClients > 0 ? (activeClientsCount / totalClients) * 100 : 0;
  }, [clients, activeClients]);

  const kanbanData = useMemo(() => {
    const statusCounts = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];
    const statusLabels = {
      'prospecting': 'Prospecção',
      'qualification': 'Qualificação', 
      'proposal': 'Proposta',
      'negotiation': 'Negociação',
      'closed-won': 'Fechado'
    };

    return Object.entries(statusCounts).map(([status, value], index) => ({
      status: statusLabels[status as keyof typeof statusLabels] || status,
      value,
      color: colors[index % colors.length]
    }));
  }, [tasks]);

  // Condicionais de retorno após todos os hooks
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

  if (user?.role !== 'socio') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acesso Restrito</h1>
          <p className="text-gray-300">Apenas sócios podem acessar os relatórios.</p>
        </div>
      </div>
    );
  }

  // Componentes de relatório
  const ExecutiveReport = () => (
    <div className="space-y-6 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 min-h-screen p-6 rounded-lg">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <BarChart3 className="h-10 w-10 text-indigo-400" />
          Relatório Executivo
        </h1>
        <p className="text-white/70 text-lg">
          Visão estratégica e análise de performance da agência
        </p>
      </div>

      {/* KPIs Principais */}
      <Card className="bg-slate-800/95 border-slate-500/50 shadow-2xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-400" />
            Indicadores Principais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg border border-green-500/20">
              <DollarSign className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">R$ {metrics.totalRevenue.toLocaleString('pt-BR')}</div>
              <div className="text-sm text-green-300">Receita Total</div>
              <div className="text-xs text-green-400 mt-1 flex items-center justify-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +12% vs mês anterior
              </div>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20">
              <Users className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">{activeClients}</div>
              <div className="text-sm text-blue-300">Clientes Ativos</div>
              <div className="text-xs text-blue-400 mt-1 flex items-center justify-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +8% vs mês anterior
              </div>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg border border-purple-500/20">
              <Target className="h-8 w-8 text-purple-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">{conversionRate.toFixed(1)}%</div>
              <div className="text-sm text-purple-300">Taxa de Conversão</div>
              <div className="text-xs text-purple-400 mt-1 flex items-center justify-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +5% vs mês anterior
              </div>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-lg border border-orange-500/20">
              <TrendingUp className="h-8 w-8 text-orange-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">{metrics.profitMargin.toFixed(1)}%</div>
              <div className="text-sm text-orange-300">Margem de Lucro</div>
              <div className="text-xs text-orange-400 mt-1 flex items-center justify-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +3% vs mês anterior
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline de Vendas */}
      <Card className="bg-slate-800/95 border-slate-500/50 shadow-2xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-400" />
            Pipeline de Vendas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={kanbanData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ percent, index }) => {
                      if (selectedPipelineSlice === index && (percent as number) > 0) {
                        return `${((percent as number) * 100).toFixed(1)}%`;
                      }
                      return null;
                    }}
                  >
                    {kanbanData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Distribuição por Status</h3>
              <div className="grid grid-cols-3 gap-1 mt-3">
                {kanbanData.map((entry, index) => {
                  const isSelected = selectedPipelineSlice === index;
                  return (
                    <div 
                      key={index} 
                      className={`flex flex-col items-center p-2 rounded-md transition-all duration-300 cursor-pointer ${
                        isSelected 
                          ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 shadow-md' 
                          : 'hover:bg-slate-700/20 hover:scale-105'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedPipelineSlice(isSelected ? null : index);
                      }}
                    >
                      <div 
                        className={`w-3 h-3 rounded-full mb-2 transition-all duration-300 ${
                          isSelected ? 'ring-1 ring-white' : ''
                        }`}
                        style={{ backgroundColor: entry.color }}
                      />
                      <div className="text-xs text-white text-center font-medium">{entry.status}</div>
                      <div className="text-xs text-gray-400">{entry.value}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards Individuais do Pipeline de Vendas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
        {kanbanData.map((entry, index) => {
          const total = kanbanData.reduce((sum, item) => sum + item.value, 0);
          const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
          const isSelected = selectedPipelineSlice === index;
          
          return (
            <Card 
              key={index}
              className={`transition-all duration-300 cursor-pointer ${
                isSelected 
                  ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/50 shadow-lg scale-105' 
                  : 'bg-slate-800/95 border-slate-600/50 hover:bg-slate-700/95 hover:scale-105'
              }`}
              onClick={() => setSelectedPipelineSlice(isSelected ? null : index)}
            >
              <CardContent className="p-4 text-center">
                <div 
                  className={`w-8 h-8 rounded-full mx-auto mb-3 transition-all duration-300 ${
                    isSelected ? 'ring-2 ring-white' : ''
                  }`}
                  style={{ backgroundColor: entry.color }}
                />
                <h3 className="text-sm font-semibold text-white mb-1">{entry.status}</h3>
                <div className="text-2xl font-bold text-white mb-1">{entry.value}</div>
                <div className="text-xs text-gray-400">{percentage}%</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const DIEReport = () => (
    <div className="space-y-6 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 min-h-screen p-6 rounded-lg">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FileText className="h-10 w-10 text-green-400" />
          Relatório DIE
        </h1>
        <p className="text-white/70 text-lg">
          Demonstrativo de Resultados e Análise Financeira
        </p>
      </div>
      <Card className="bg-slate-800/95 border-slate-500/50 shadow-2xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Relatório DIE em Desenvolvimento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">Este relatório será implementado em breve.</p>
        </CardContent>
      </Card>
    </div>
  );

  const SalesReport = () => (
    <div className="space-y-6 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 min-h-screen p-6 rounded-lg">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <TrendingUp className="h-10 w-10 text-blue-400" />
          Relatório de Vendas
        </h1>
        <p className="text-white/70 text-lg">
          Análise de Performance e Evolução de Vendas
        </p>
      </div>
      <Card className="bg-slate-800/95 border-slate-500/50 shadow-2xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Relatório de Vendas em Desenvolvimento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">Este relatório será implementado em breve.</p>
        </CardContent>
      </Card>
    </div>
  );

  const FinancialReport = () => (
    <div className="space-y-6 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 min-h-screen p-6 rounded-lg">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <DollarSign className="h-10 w-10 text-orange-400" />
          Relatório Financeiro
        </h1>
        <p className="text-white/70 text-lg">
          Análise Financeira e Controle de Fluxo de Caixa
        </p>
      </div>
      <Card className="bg-slate-800/95 border-slate-500/50 shadow-2xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Relatório Financeiro em Desenvolvimento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">Este relatório será implementado em breve.</p>
        </CardContent>
      </Card>
    </div>
  );

  const PerformanceReport = () => (
    <div className="space-y-6 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 min-h-screen p-6 rounded-lg">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <Target className="h-10 w-10 text-purple-400" />
          Relatório de Performance
        </h1>
        <p className="text-white/70 text-lg">
          Análise de Performance Individual e Metas
        </p>
      </div>
      <Card className="bg-slate-800/95 border-slate-500/50 shadow-2xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Relatório de Performance em Desenvolvimento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">Este relatório será implementado em breve.</p>
        </CardContent>
      </Card>
    </div>
  );

  const GrowthAnalysis = () => (
    <div className="space-y-6 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 min-h-screen p-6 rounded-lg">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <Zap className="h-10 w-10 text-yellow-400" />
          Análise de Crescimento
        </h1>
        <p className="text-white/70 text-lg">
          Estratégias de Expansão e Oportunidades de Mercado
        </p>
      </div>
      <Card className="bg-slate-800/95 border-slate-500/50 shadow-2xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Análise de Crescimento em Desenvolvimento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">Este relatório será implementado em breve.</p>
        </CardContent>
      </Card>
    </div>
  );

  // Função para renderizar o relatório ativo
  const renderActiveReport = () => {
    switch (activeReport) {
      case 'executive':
        return <ExecutiveReport />;
      case 'die':
        return <DIEReport />;
      case 'sales':
        return <SalesReport />;
      case 'financial':
        return <FinancialReport />;
      case 'performance':
        return <PerformanceReport />;
      case 'growth':
        return <GrowthAnalysis />;
      default:
        return <ExecutiveReport />;
    }
  };

  return (
    <ModernLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="flex items-center bg-slate-700/50 border-slate-500/50 text-white hover:bg-slate-600/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {activeReport === 'executive' && 'Relatório Executivo'}
              {activeReport === 'die' && 'Relatório DIE'}
              {activeReport === 'sales' && 'Relatório de Vendas'}
              {activeReport === 'financial' && 'Relatório Financeiro'}
              {activeReport === 'performance' && 'Relatório de Performance'}
              {activeReport === 'growth' && 'Análise de Crescimento'}
            </h1>
            <p className="text-white/70">Análise detalhada e métricas estratégicas</p>
          </div>
        </div>

        {renderActiveReport()}
      </div>
    </ModernLayout>
  );
}
