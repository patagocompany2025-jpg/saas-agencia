'use client';

import React, { useState } from 'react';
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
  Calendar,
  PieChart,
  LineChart,
  Activity,
  Zap,
  Crown,
  Globe,
  Building2,
  Clock,
  CheckCircle,
  AlertTriangle,
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
  LineChart as RechartsLineChart,
  Line,
  Area,
  AreaChart,
  ComposedChart
} from 'recharts';
import { exportReportData, exportToPDF, exportToPDFSimple, exportToPDFFallback, exportToPDFBasic, exportToPDFAlternative } from '@/lib/utils/export';

type ReportType = 'executive' | 'sales' | 'financial' | 'performance' | 'die' | 'growth' | null;

export default function ReportsPage() {
  const { user, isLoading } = useAuth();
  const { transactions, employees, fixedExpenses } = useFinancial();
  const { tasks } = useKanban();
  const { clients } = useClients();
  const [activeReport, setActiveReport] = useState<ReportType>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');

  // Verificar se o usuário tem acesso ao módulo de relatórios
  if (user?.role !== 'socio') {
    return (
      <ModernLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Acesso Restrito</h1>
            <p className="text-white/70 text-lg mb-6">
              Apenas sócios têm acesso ao módulo de relatórios.
            </p>
            <Button 
              onClick={() => window.history.back()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Voltar
            </Button>
          </div>
        </div>
      </ModernLayout>
    );
  }

  // Cálculos de métricas
  const totalRevenue = transactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  
  const metrics = {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin
  };
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'cliente').length;
  const totalTasks = tasks.length;
  const closedTasks = tasks.filter(t => t.status === 'fechado').length;
  const conversionRate = totalClients > 0 ? (activeClients / totalClients) * 100 : 0;
  
  // Dados para gráficos
  const salesData = [
    { month: 'Jan', vendas: 45000, clientes: 12, leads: 25 },
    { month: 'Fev', vendas: 52000, clientes: 15, leads: 30 },
    { month: 'Mar', vendas: 48000, clientes: 11, leads: 28 },
    { month: 'Abr', vendas: 61000, clientes: 18, leads: 35 },
    { month: 'Mai', vendas: 55000, clientes: 14, leads: 32 },
    { month: 'Jun', vendas: 67000, clientes: 20, leads: 40 },
  ];

  const kanbanData = [
    { status: 'Prospecção', value: tasks.filter(t => t.status === 'prospeccao').length, color: '#f59e0b' },
    { status: 'Qualificação', value: tasks.filter(t => t.status === 'qualificacao').length, color: '#3b82f6' },
    { status: 'Consultoria', value: tasks.filter(t => t.status === 'consultoria').length, color: '#8b5cf6' },
    { status: 'Proposta', value: tasks.filter(t => t.status === 'proposta').length, color: '#10b981' },
    { status: 'Negociação', value: tasks.filter(t => t.status === 'negociacao').length, color: '#ef4444' },
    { status: 'Fechado', value: tasks.filter(t => t.status === 'fechado').length, color: '#22c55e' },
  ];

  const sourceData = [
    { name: 'Website', value: clients.filter(c => c.source === 'Website').length, color: '#3b82f6' },
    { name: 'Facebook', value: clients.filter(c => c.source === 'Facebook').length, color: '#1877f2' },
    { name: 'Instagram', value: clients.filter(c => c.source === 'Instagram').length, color: '#e4405f' },
    { name: 'Indicação', value: clients.filter(c => c.source === 'Indicação').length, color: '#10b981' },
    { name: 'Google', value: clients.filter(c => c.source === 'Google').length, color: '#4285f4' },
    { name: 'WhatsApp', value: clients.filter(c => c.source === 'WhatsApp').length, color: '#25d366' },
  ];

  // Função de exportação
  const exportReport = (reportType: string) => {
    const data = {
      reportType,
      period: selectedPeriod,
      timestamp: new Date().toISOString(),
      metrics: {
        totalRevenue: metrics.totalRevenue,
        totalExpenses: metrics.totalExpenses,
        netProfit: metrics.netProfit,
        profitMargin: metrics.profitMargin,
        totalClients,
        activeClients,
        conversionRate,
        totalTasks,
        closedTasks
      },
      salesData,
      kanbanData,
      sourceData
    };

    const filename = `relatorio_${reportType}_${new Date().toISOString().split('T')[0]}`;

    if (exportFormat === 'pdf') {
      // Para PDF, usar o elemento HTML do relatório
      const elementId = reportType === 'executivo' ? 'report-executive' : `report-${reportType}`;
      
      // Verificar se o elemento existe
      const element = document.getElementById(elementId);
      if (!element) {
        alert('Elemento do relatório não encontrado. Certifique-se de que o relatório está carregado.');
        return;
      }
      
      // Tentar diferentes métodos de exportação PDF
      try {
        console.log('Tentando exportação PDF alternativa...');
        exportToPDFAlternative(elementId, filename);
      } catch (error) {
        console.log('Erro com método alternativo, tentando html2canvas...', error);
        try {
          exportToPDFSimple(elementId, filename);
        } catch (simpleError) {
          console.log('Erro com html2canvas, tentando fallback...', simpleError);
          try {
            exportToPDFFallback(elementId, filename);
          } catch (fallbackError) {
            console.log('Erro com fallback, tentando método original...', fallbackError);
            try {
              exportToPDF(elementId, filename);
            } catch (originalError) {
              console.log('Erro com método original, usando PDF básico...', originalError);
              exportToPDFBasic(elementId, filename);
            }
          }
        }
      }
    } else {
      // Para CSV e Excel, usar os dados estruturados
      exportReportData(data, exportFormat, filename);
    }
  };


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

  // Componente de Relatório Executivo
  const ExecutiveReport = () => (
    <div id="report-executive" className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Relatório Executivo</h2>
          <p className="text-white/70">Visão geral estratégica da empresa</p>
        </div>
        <div className="flex gap-2">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'excel' | 'csv')}
            className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2"
          >
            <option value="pdf" className="bg-gray-800">PDF</option>
            <option value="excel" className="bg-gray-800">Excel</option>
            <option value="csv" className="bg-gray-800">CSV</option>
          </select>
          <Button onClick={() => exportReport('executivo')} className="bg-indigo-600 hover:bg-indigo-700">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Receita Total</p>
                <p className="text-3xl font-bold text-white">R$ {metrics.totalRevenue.toLocaleString('pt-BR')}</p>
                <p className="text-green-400 text-sm flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +12.5% vs mês anterior
                </p>
              </div>
              <DollarSign className="h-12 w-12 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Clientes Ativos</p>
                <p className="text-3xl font-bold text-white">{activeClients}</p>
                <p className="text-blue-400 text-sm flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +8.2% vs mês anterior
                </p>
              </div>
              <Users className="h-12 w-12 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Taxa de Conversão</p>
                <p className="text-3xl font-bold text-white">{conversionRate.toFixed(1)}%</p>
                <p className="text-purple-400 text-sm flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +2.1% vs mês anterior
                </p>
              </div>
              <Target className="h-12 w-12 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-300 text-sm font-medium">Margem de Lucro</p>
                <p className="text-3xl font-bold text-white">{metrics.profitMargin.toFixed(1)}%</p>
                <p className="text-orange-400 text-sm flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +1.8% vs mês anterior
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/5 backdrop-blur-2xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Evolução de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Vendas']}
                  />
                  <Area type="monotone" dataKey="vendas" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-2xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Pipeline de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={kanbanData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {kanbanData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análise de Crescimento */}
      <Card className="bg-white/5 backdrop-blur-2xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Análise de Crescimento Estratégico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg border border-green-500/20">
              <Clock className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Curto Prazo</h3>
              <p className="text-green-300 text-sm mb-4">Próximos 3 meses</p>
              <ul className="text-white/70 text-sm space-y-1">
                <li>• Aumentar conversão em 15%</li>
                <li>• Reduzir custos operacionais</li>
                <li>• Melhorar atendimento</li>
              </ul>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20">
              <Target className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Médio Prazo</h3>
              <p className="text-blue-300 text-sm mb-4">6-12 meses</p>
              <ul className="text-white/70 text-sm space-y-1">
                <li>• Expansão de mercado</li>
                <li>• Novos produtos/serviços</li>
                <li>• Parcerias estratégicas</li>
              </ul>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg border border-purple-500/20">
              <Crown className="h-8 w-8 text-purple-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Longo Prazo</h3>
              <p className="text-purple-300 text-sm mb-4">1-3 anos</p>
              <ul className="text-white/70 text-sm space-y-1">
                <li>• Liderança de mercado</li>
                <li>• Franquias/licenciamento</li>
                <li>• Internacionalização</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Componente DIE (Demonstrativo de Informações Econômicas)
  const DIEReport = () => (
    <div id="report-die" className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">DIE - Demonstrativo de Informações Econômicas</h2>
          <p className="text-white/70">Análise financeira detalhada e projeções</p>
        </div>
        <div className="flex gap-2">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'excel' | 'csv')}
            className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2"
          >
            <option value="pdf" className="bg-gray-800">PDF</option>
            <option value="excel" className="bg-gray-800">Excel</option>
            <option value="csv" className="bg-gray-800">CSV</option>
          </select>
          <Button onClick={() => exportReport('die')} className="bg-indigo-600 hover:bg-indigo-700">
            <Download className="h-4 w-4 mr-2" />
            Exportar DIE
          </Button>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Receita Bruta</p>
                <p className="text-2xl font-bold text-white">R$ {metrics.totalRevenue.toLocaleString('pt-BR')}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-300 text-sm font-medium">Despesas Totais</p>
                <p className="text-2xl font-bold text-white">R$ {metrics.totalExpenses.toLocaleString('pt-BR')}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Lucro Líquido</p>
                <p className="text-2xl font-bold text-white">R$ {metrics.netProfit.toLocaleString('pt-BR')}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Margem de Lucro</p>
                <p className="text-2xl font-bold text-white">{metrics.profitMargin.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análise de Despesas */}
      <Card className="bg-white/5 backdrop-blur-2xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Distribuição de Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={[
                    { name: 'Funcionários', value: 45, color: '#3b82f6' },
                    { name: 'Marketing', value: 25, color: '#10b981' },
                    { name: 'Operacional', value: 20, color: '#f59e0b' },
                    { name: 'Outros', value: 10, color: '#ef4444' }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'Funcionários', value: 45, color: '#3b82f6' },
                    { name: 'Marketing', value: 25, color: '#10b981' },
                    { name: 'Operacional', value: 20, color: '#f59e0b' },
                    { name: 'Outros', value: 10, color: '#ef4444' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Projeções Financeiras */}
      <Card className="bg-white/5 backdrop-blur-2xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Projeções Financeiras (12 meses)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={[
                { month: 'Jan', receita: 45000, despesas: 30000, lucro: 15000 },
                { month: 'Fev', receita: 52000, despesas: 32000, lucro: 20000 },
                { month: 'Mar', receita: 48000, despesas: 31000, lucro: 17000 },
                { month: 'Abr', receita: 61000, despesas: 35000, lucro: 26000 },
                { month: 'Mai', receita: 55000, despesas: 33000, lucro: 22000 },
                { month: 'Jun', receita: 67000, despesas: 38000, lucro: 29000 },
                { month: 'Jul', receita: 72000, despesas: 40000, lucro: 32000 },
                { month: 'Ago', receita: 68000, despesas: 39000, lucro: 29000 },
                { month: 'Set', receita: 75000, despesas: 42000, lucro: 33000 },
                { month: 'Out', receita: 80000, despesas: 45000, lucro: 35000 },
                { month: 'Nov', receita: 85000, despesas: 48000, lucro: 37000 },
                { month: 'Dez', receita: 90000, despesas: 50000, lucro: 40000 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  formatter={(value: number, name: string) => [
                    `R$ ${value.toLocaleString('pt-BR')}`, 
                    name === 'receita' ? 'Receita' : name === 'despesas' ? 'Despesas' : 'Lucro'
                  ]}
                />
                <Bar dataKey="receita" fill="#10b981" name="receita" />
                <Bar dataKey="despesas" fill="#ef4444" name="despesas" />
                <Line type="monotone" dataKey="lucro" stroke="#3b82f6" strokeWidth={3} name="lucro" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Componente de Relatório de Vendas
  const SalesReport = () => (
    <div id="report-sales" className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Relatório de Vendas</h2>
          <p className="text-white/70">Análise de performance e métricas de vendas</p>
        </div>
        <div className="flex gap-2">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'excel' | 'csv')}
            className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2"
          >
            <option value="pdf" className="bg-gray-800">PDF</option>
            <option value="excel" className="bg-gray-800">Excel</option>
            <option value="csv" className="bg-gray-800">CSV</option>
          </select>
          <Button onClick={() => exportReport('vendas')} className="bg-indigo-600 hover:bg-indigo-700">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas de Vendas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Receita Total</p>
                <p className="text-3xl font-bold text-white">R$ {metrics.totalRevenue.toLocaleString('pt-BR')}</p>
                <p className="text-green-400 text-sm flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +15.2% vs mês anterior
                </p>
              </div>
              <DollarSign className="h-12 w-12 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Total de Clientes</p>
                <p className="text-3xl font-bold text-white">{totalClients}</p>
                <p className="text-blue-400 text-sm flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +8.5% vs mês anterior
                </p>
              </div>
              <Users className="h-12 w-12 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Taxa de Conversão</p>
                <p className="text-3xl font-bold text-white">{conversionRate.toFixed(1)}%</p>
                <p className="text-purple-400 text-sm flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +2.3% vs mês anterior
                </p>
              </div>
              <Target className="h-12 w-12 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-300 text-sm font-medium">Ticket Médio</p>
                <p className="text-3xl font-bold text-white">R$ {totalClients > 0 ? (metrics.totalRevenue / totalClients).toLocaleString('pt-BR') : '0'}</p>
                <p className="text-orange-400 text-sm flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +5.7% vs mês anterior
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Vendas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/5 backdrop-blur-2xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Vendas por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Vendas']}
                  />
                  <Bar dataKey="vendas" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-2xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Status dos Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={[
                      { name: 'Leads', value: clients.filter(c => c.status === 'lead').length, color: '#f59e0b' },
                      { name: 'Prospects', value: clients.filter(c => c.status === 'prospect').length, color: '#3b82f6' },
                      { name: 'Clientes', value: clients.filter(c => c.status === 'cliente').length, color: '#10b981' },
                      { name: 'Inativos', value: clients.filter(c => c.status === 'inativo').length, color: '#6b7280' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Leads', value: clients.filter(c => c.status === 'lead').length, color: '#f59e0b' },
                      { name: 'Prospects', value: clients.filter(c => c.status === 'prospect').length, color: '#3b82f6' },
                      { name: 'Clientes', value: clients.filter(c => c.status === 'cliente').length, color: '#10b981' },
                      { name: 'Inativos', value: clients.filter(c => c.status === 'inativo').length, color: '#6b7280' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Componente de Relatório Financeiro
  const FinancialReport = () => (
    <div id="report-financial" className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Relatório Financeiro</h2>
          <p className="text-white/70">Análise de receitas, despesas e lucratividade</p>
        </div>
        <div className="flex gap-2">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'excel' | 'csv')}
            className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2"
          >
            <option value="pdf" className="bg-gray-800">PDF</option>
            <option value="excel" className="bg-gray-800">Excel</option>
            <option value="csv" className="bg-gray-800">CSV</option>
          </select>
          <Button onClick={() => exportReport('financeiro')} className="bg-indigo-600 hover:bg-indigo-700">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas Financeiras */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Receita Total</p>
                <p className="text-3xl font-bold text-white">R$ {metrics.totalRevenue.toLocaleString('pt-BR')}</p>
                <p className="text-green-400 text-sm flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +12.5% vs mês anterior
                </p>
              </div>
              <DollarSign className="h-12 w-12 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-300 text-sm font-medium">Despesas Totais</p>
                <p className="text-3xl font-bold text-white">R$ {metrics.totalExpenses.toLocaleString('pt-BR')}</p>
                <p className="text-red-400 text-sm flex items-center mt-1">
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                  -3.2% vs mês anterior
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Lucro Líquido</p>
                <p className="text-3xl font-bold text-white">R$ {metrics.netProfit.toLocaleString('pt-BR')}</p>
                <p className="text-blue-400 text-sm flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +18.7% vs mês anterior
                </p>
              </div>
              <Activity className="h-12 w-12 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Margem de Lucro</p>
                <p className="text-3xl font-bold text-white">{metrics.profitMargin.toFixed(1)}%</p>
                <p className="text-purple-400 text-sm flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +1.8% vs mês anterior
                </p>
              </div>
              <Target className="h-12 w-12 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Receitas vs Despesas */}
      <Card className="bg-white/5 backdrop-blur-2xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Receitas vs Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  formatter={(value: number, name: string) => [
                    `R$ ${value.toLocaleString('pt-BR')}`, 
                    name === 'vendas' ? 'Receitas' : 'Despesas'
                  ]}
                />
                <Area type="monotone" dataKey="vendas" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="despesas" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Componente de Relatório de Performance
  const PerformanceReport = () => (
    <div id="report-performance" className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Relatório de Performance</h2>
          <p className="text-white/70">Métricas de performance da equipe e KPIs</p>
        </div>
        <div className="flex gap-2">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'excel' | 'csv')}
            className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2"
          >
            <option value="pdf" className="bg-gray-800">PDF</option>
            <option value="excel" className="bg-gray-800">Excel</option>
            <option value="csv" className="bg-gray-800">CSV</option>
          </select>
          <Button onClick={() => exportReport('performance')} className="bg-indigo-600 hover:bg-indigo-700">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas de Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Total de Clientes</p>
                <p className="text-3xl font-bold text-white">{totalClients}</p>
                <p className="text-blue-400 text-sm flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +8.2% vs mês anterior
                </p>
              </div>
              <Users className="h-12 w-12 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Taxa de Conversão</p>
                <p className="text-3xl font-bold text-white">{conversionRate.toFixed(1)}%</p>
                <p className="text-purple-400 text-sm flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +2.1% vs mês anterior
                </p>
              </div>
              <Target className="h-12 w-12 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Pipeline Ativo</p>
                <p className="text-3xl font-bold text-white">{totalTasks}</p>
                <p className="text-green-400 text-sm flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +12.3% vs mês anterior
                </p>
              </div>
              <Clock className="h-12 w-12 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-300 text-sm font-medium">Performance Geral</p>
                <p className="text-3xl font-bold text-white">87%</p>
                <p className="text-orange-400 text-sm flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +3.5% vs mês anterior
                </p>
              </div>
              <Activity className="h-12 w-12 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Performance da Equipe */}
      <Card className="bg-white/5 backdrop-blur-2xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Performance da Equipe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'João Silva', vendas: 12, clientes: 8, conversao: 85 },
                { name: 'Maria Santos', vendas: 15, clientes: 12, conversao: 78 },
                { name: 'Carlos Lima', vendas: 8, clientes: 6, conversao: 75 },
                { name: 'Ana Costa', vendas: 18, clientes: 14, conversao: 90 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                <Bar dataKey="vendas" fill="#3b82f6" name="Vendas" />
                <Bar dataKey="clientes" fill="#10b981" name="Clientes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Componente de Análise de Crescimento
  const GrowthAnalysis = () => (
    <div id="report-growth" className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Análise de Crescimento</h2>
          <p className="text-white/70">Estratégias de crescimento e expansão</p>
        </div>
        <div className="flex gap-2">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'excel' | 'csv')}
            className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2"
          >
            <option value="pdf" className="bg-gray-800">PDF</option>
            <option value="excel" className="bg-gray-800">Excel</option>
            <option value="csv" className="bg-gray-800">CSV</option>
          </select>
          <Button onClick={() => exportReport('crescimento')} className="bg-indigo-600 hover:bg-indigo-700">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Análise de Crescimento Estratégico */}
      <Card className="bg-white/5 backdrop-blur-2xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Análise de Crescimento Estratégico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg border border-green-500/20">
              <Clock className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Curto Prazo</h3>
              <p className="text-green-300 text-sm mb-4">Próximos 3 meses</p>
              <ul className="text-white/70 text-sm space-y-1">
                <li>• Aumentar conversão em 15%</li>
                <li>• Reduzir custos operacionais</li>
                <li>• Melhorar atendimento</li>
              </ul>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20">
              <Target className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Médio Prazo</h3>
              <p className="text-blue-300 text-sm mb-4">6-12 meses</p>
              <ul className="text-white/70 text-sm space-y-1">
                <li>• Expansão de mercado</li>
                <li>• Novos produtos/serviços</li>
                <li>• Parcerias estratégicas</li>
              </ul>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg border border-purple-500/20">
              <Crown className="h-8 w-8 text-purple-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Longo Prazo</h3>
              <p className="text-purple-300 text-sm mb-4">1-3 anos</p>
              <ul className="text-white/70 text-sm space-y-1">
                <li>• Liderança de mercado</li>
                <li>• Franquias/licenciamento</li>
                <li>• Internacionalização</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projeções de Crescimento */}
      <Card className="bg-white/5 backdrop-blur-2xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Projeções de Crescimento (12 meses)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={[
                { month: 'Jan', receita: 45000, despesas: 30000, lucro: 15000 },
                { month: 'Fev', receita: 52000, despesas: 32000, lucro: 20000 },
                { month: 'Mar', receita: 48000, despesas: 31000, lucro: 17000 },
                { month: 'Abr', receita: 61000, despesas: 35000, lucro: 26000 },
                { month: 'Mai', receita: 55000, despesas: 33000, lucro: 22000 },
                { month: 'Jun', receita: 67000, despesas: 38000, lucro: 29000 },
                { month: 'Jul', receita: 72000, despesas: 40000, lucro: 32000 },
                { month: 'Ago', receita: 68000, despesas: 39000, lucro: 29000 },
                { month: 'Set', receita: 75000, despesas: 42000, lucro: 33000 },
                { month: 'Out', receita: 80000, despesas: 45000, lucro: 35000 },
                { month: 'Nov', receita: 85000, despesas: 48000, lucro: 37000 },
                { month: 'Dez', receita: 90000, despesas: 50000, lucro: 40000 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  formatter={(value: number, name: string) => [
                    `R$ ${value.toLocaleString('pt-BR')}`, 
                    name === 'receita' ? 'Receita' : name === 'despesas' ? 'Despesas' : 'Lucro'
                  ]}
                />
                <Bar dataKey="receita" fill="#10b981" name="receita" />
                <Bar dataKey="despesas" fill="#ef4444" name="despesas" />
                <Line type="monotone" dataKey="lucro" stroke="#3b82f6" strokeWidth={3} name="lucro" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReport = () => {
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
        return null;
    }
  };

  if (activeReport) {
    return (
      <ModernLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveReport(null)}
              className="flex items-center bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {activeReport === 'executive' && 'Relatório Executivo'}
                {activeReport === 'die' && 'DIE - Demonstrativo de Informações Econômicas'}
                {activeReport === 'sales' && 'Relatório de Vendas'}
                {activeReport === 'financial' && 'Relatório Financeiro'}
                {activeReport === 'performance' && 'Relatório de Performance'}
                {activeReport === 'growth' && 'Análise de Crescimento'}
              </h1>
              <p className="text-white/70">Análise detalhada e métricas estratégicas</p>
            </div>
          </div>
          {renderReport()}
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <BarChart3 className="h-10 w-10 text-indigo-400" />
            Centro de Relatórios Estratégicos
          </h1>
          <p className="text-white/70 text-lg">
            Análises completas para crescimento sustentável da empresa
          </p>
        </div>

        {/* Resumo Executivo Rápido */}
        <Card className="bg-white/5 backdrop-blur-2xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-400" />
              Resumo Executivo Rápido
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
                  +12.5% vs anterior
                </div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20">
                <Users className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">{activeClients}</div>
                <div className="text-sm text-blue-300">Clientes Ativos</div>
                <div className="text-xs text-blue-400 mt-1 flex items-center justify-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +8.2% vs anterior
                </div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg border border-purple-500/20">
                <Target className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">{conversionRate.toFixed(1)}%</div>
                <div className="text-sm text-purple-300">Taxa de Conversão</div>
                <div className="text-xs text-purple-400 mt-1 flex items-center justify-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +2.1% vs anterior
                </div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-lg border border-orange-500/20">
                <TrendingUp className="h-8 w-8 text-orange-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">{metrics.profitMargin.toFixed(1)}%</div>
                <div className="text-sm text-orange-300">Margem de Lucro</div>
                <div className="text-xs text-orange-400 mt-1 flex items-center justify-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +1.8% vs anterior
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards de Relatórios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Relatório Executivo */}
          <Card className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border-indigo-500/30 hover:from-indigo-500/30 hover:to-purple-600/30 transition-all duration-300 cursor-pointer group" onClick={() => setActiveReport('executive')}>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <Crown className="h-6 w-6 text-yellow-400 group-hover:scale-110 transition-transform" />
                Relatório Executivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 mb-4">
                Visão estratégica completa com KPIs e análise de crescimento
              </p>
              <div className="space-y-2 text-sm text-white/60">
                <p>• KPIs principais e tendências</p>
                <p>• Análise de crescimento (curto/médio/longo prazo)</p>
                <p>• Gráficos executivos</p>
                <p>• Recomendações estratégicas</p>
              </div>
            </CardContent>
          </Card>

          {/* DIE */}
          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-green-500/30 hover:from-green-500/30 hover:to-emerald-600/30 transition-all duration-300 cursor-pointer group" onClick={() => setActiveReport('die')}>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <FileText className="h-6 w-6 text-green-400 group-hover:scale-110 transition-transform" />
                DIE - Demonstrativo Econômico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 mb-4">
                Análise financeira detalhada e projeções econômicas
              </p>
              <div className="space-y-2 text-sm text-white/60">
                <p>• Receitas, despesas e lucratividade</p>
                <p>• Projeções financeiras 12 meses</p>
                <p>• Análise de custos por categoria</p>
                <p>• Indicadores de performance financeira</p>
              </div>
            </CardContent>
          </Card>

          {/* Relatório de Vendas */}
          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border-blue-500/30 hover:from-blue-500/30 hover:to-cyan-600/30 transition-all duration-300 cursor-pointer group" onClick={() => setActiveReport('sales')}>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-blue-400 group-hover:scale-110 transition-transform" />
                Relatório de Vendas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 mb-4">
                Performance comercial e análise de conversão
              </p>
              <div className="space-y-2 text-sm text-white/60">
                <p>• Evolução de vendas por período</p>
                <p>• Taxa de conversão de leads</p>
                <p>• Análise por origem de clientes</p>
                <p>• Pipeline de oportunidades</p>
              </div>
            </CardContent>
          </Card>

          {/* Relatório Financeiro */}
          <Card className="bg-gradient-to-br from-orange-500/20 to-red-600/20 border-orange-500/30 hover:from-orange-500/30 hover:to-red-600/30 transition-all duration-300 cursor-pointer group" onClick={() => setActiveReport('financial')}>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <DollarSign className="h-6 w-6 text-orange-400 group-hover:scale-110 transition-transform" />
                Relatório Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 mb-4">
                Controle financeiro e análise de fluxo de caixa
              </p>
              <div className="space-y-2 text-sm text-white/60">
                <p>• Fluxo de caixa detalhado</p>
                <p>• Controle de despesas</p>
                <p>• Análise de rentabilidade</p>
                <p>• Alertas financeiros</p>
              </div>
            </CardContent>
          </Card>

          {/* Relatório de Performance */}
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 border-purple-500/30 hover:from-purple-500/30 hover:to-pink-600/30 transition-all duration-300 cursor-pointer group" onClick={() => setActiveReport('performance')}>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <Target className="h-6 w-6 text-purple-400 group-hover:scale-110 transition-transform" />
                Relatório de Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 mb-4">
                Métricas de equipe e KPIs operacionais
              </p>
              <div className="space-y-2 text-sm text-white/60">
                <p>• Performance individual</p>
                <p>• Metas vs realizado</p>
                <p>• Ranking de performance</p>
                <p>• Análise de produtividade</p>
              </div>
            </CardContent>
          </Card>

          {/* Análise de Crescimento */}
          <Card className="bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border-yellow-500/30 hover:from-yellow-500/30 hover:to-amber-600/30 transition-all duration-300 cursor-pointer group" onClick={() => setActiveReport('growth')}>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <Zap className="h-6 w-6 text-yellow-400 group-hover:scale-110 transition-transform" />
                Análise de Crescimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 mb-4">
                Estratégias de crescimento e expansão
              </p>
              <div className="space-y-2 text-sm text-white/60">
                <p>• Oportunidades de mercado</p>
                <p>• Análise de concorrência</p>
                <p>• Estratégias de expansão</p>
                <p>• Projeções de crescimento</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo Executivo Rápido */}
        <Card className="bg-white/5 backdrop-blur-2xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-400" />
              Resumo Executivo Rápido
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
                  +12.5% vs anterior
                </div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20">
                <Users className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">{activeClients}</div>
                <div className="text-sm text-blue-300">Clientes Ativos</div>
                <div className="text-xs text-blue-400 mt-1 flex items-center justify-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +8.2% vs anterior
                </div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg border border-purple-500/20">
                <Target className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">{conversionRate.toFixed(1)}%</div>
                <div className="text-sm text-purple-300">Taxa de Conversão</div>
                <div className="text-xs text-purple-400 mt-1 flex items-center justify-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +2.1% vs anterior
                </div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-lg border border-orange-500/20">
                <TrendingUp className="h-8 w-8 text-orange-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white">{metrics.profitMargin.toFixed(1)}%</div>
                <div className="text-sm text-orange-300">Margem de Lucro</div>
                <div className="text-xs text-orange-400 mt-1 flex items-center justify-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +1.8% vs anterior
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModernLayout>
  );
}
