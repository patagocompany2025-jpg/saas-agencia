'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const salesData = [
  { month: 'Jan', vendas: 45000, meta: 50000 },
  { month: 'Fev', vendas: 52000, meta: 50000 },
  { month: 'Mar', vendas: 48000, meta: 55000 },
  { month: 'Abr', vendas: 61000, meta: 55000 },
  { month: 'Mai', vendas: 55000, meta: 60000 },
  { month: 'Jun', vendas: 67000, meta: 60000 },
  { month: 'Jul', vendas: 72000, meta: 65000 },
  { month: 'Ago', vendas: 68000, meta: 65000 },
  { month: 'Set', vendas: 75000, meta: 70000 },
  { month: 'Out', vendas: 82000, meta: 70000 },
  { month: 'Nov', vendas: 78000, meta: 75000 },
  { month: 'Dez', vendas: 85000, meta: 75000 },
];

export function SalesChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas vs Meta - Últimos 12 Meses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis 
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `R$ ${value.toLocaleString('pt-BR')}`,
                  name === 'vendas' ? 'Vendas' : 'Meta'
                ]}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="vendas" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="vendas"
              />
              <Line 
                type="monotone" 
                dataKey="meta" 
                stroke="#10b981" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="meta"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
