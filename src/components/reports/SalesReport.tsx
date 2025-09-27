'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Calendar, TrendingUp, Users, DollarSign } from 'lucide-react';
import { useClients } from '@/lib/contexts/ClientContext';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function SalesReport() {
  const { clients } = useClients();
  const [period, setPeriod] = useState('30');

  // Dados mockados para demonstração (em produção, viria de uma API)
  const salesData = [
    { month: 'Jan', vendas: 45000, clientes: 12 },
    { month: 'Fev', vendas: 52000, clientes: 15 },
    { month: 'Mar', vendas: 48000, clientes: 11 },
    { month: 'Abr', vendas: 61000, clientes: 18 },
    { month: 'Mai', vendas: 55000, clientes: 14 },
    { month: 'Jun', vendas: 67000, clientes: 20 },
  ];

  const statusData = [
    { name: 'Leads', value: clients.filter(c => c.status === 'lead').length, color: '#f59e0b' },
    { name: 'Prospects', value: clients.filter(c => c.status === 'prospect').length, color: '#3b82f6' },
    { name: 'Clientes', value: clients.filter(c => c.status === 'cliente').length, color: '#10b981' },
    { name: 'Inativos', value: clients.filter(c => c.status === 'inativo').length, color: '#6b7280' },
  ];

  const sourceData = [
    { name: 'Website', value: clients.filter(c => c.source === 'Website').length },
    { name: 'Facebook', value: clients.filter(c => c.source === 'Facebook').length },
    { name: 'Instagram', value: clients.filter(c => c.source === 'Instagram').length },
    { name: 'Indicação', value: clients.filter(c => c.source === 'Indicação').length },
    { name: 'Google', value: clients.filter(c => c.source === 'Google').length },
    { name: 'WhatsApp', value: clients.filter(c => c.source === 'WhatsApp').length },
  ];

  const totalRevenue = salesData.reduce((sum, item) => sum + item.vendas, 0);
  const totalClients = clients.length;
  const conversionRate = totalClients > 0 ? ((clients.filter(c => c.status === 'cliente').length / totalClients) * 100).toFixed(1) : 0;

  const exportToPDF = () => {
    // Simular exportação para PDF
    alert('Relatório de vendas exportado para PDF!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatório de Vendas</h2>
          <p className="text-gray-600">Análise de performance e métricas de vendas</p>
        </div>
        <div className="flex space-x-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportToPDF}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalRevenue.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Período selecionado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">Clientes cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">Leads convertidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalClients > 0 ? (totalRevenue / totalClients).toLocaleString('pt-BR') : '0'}</div>
            <p className="text-xs text-muted-foreground">Por cliente</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Vendas']}
                  />
                  <Bar dataKey="vendas" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status dos Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de origens */}
      <Card>
        <CardHeader>
          <CardTitle>Clientes por Origem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sourceData.map((source) => (
              <div key={source.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="font-medium">{source.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ 
                        width: `${totalClients > 0 ? (source.value / totalClients) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{source.value}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
