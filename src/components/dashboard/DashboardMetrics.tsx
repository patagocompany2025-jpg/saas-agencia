'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  DollarSign, 
  Target, 
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { DashboardMetrics as MetricsType } from '@/lib/types';

interface DashboardMetricsProps {
  metrics: MetricsType;
}

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  const metricCards = [
    {
      title: 'Total de Clientes',
      value: metrics.totalClients,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Leads Ativos',
      value: metrics.activeLeads,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Receita Mensal',
      value: `R$ ${metrics.monthlyRevenue.toLocaleString('pt-BR')}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Meta Mensal',
      value: `R$ ${metrics.monthlyGoal.toLocaleString('pt-BR')}`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Pagamentos Pendentes',
      value: metrics.pendingPayments,
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Pagamentos Vencidos',
      value: metrics.overduePayments,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  const goalProgress = (metrics.monthlyRevenue / metrics.monthlyGoal) * 100;

  return (
    <div className="space-y-6">
      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${metric.bgColor}`}>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Progresso da meta */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso da Meta Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>R$ {metrics.monthlyRevenue.toLocaleString('pt-BR')}</span>
              <span>R$ {metrics.monthlyGoal.toLocaleString('pt-BR')}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(goalProgress, 100)}%` }}
              />
            </div>
            <div className="text-right text-sm text-gray-600">
              {goalProgress.toFixed(1)}% da meta
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Taxa de conversão e valor médio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Taxa de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {metrics.conversionRate.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Leads convertidos em clientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Valor Médio por Venda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              R$ {metrics.averageDealValue.toLocaleString('pt-BR')}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Ticket médio dos negócios
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
