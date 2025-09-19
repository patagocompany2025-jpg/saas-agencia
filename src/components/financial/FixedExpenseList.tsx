'use client';

import React, { useState } from 'react';
import { useFinancial } from '@/lib/contexts/FinancialContext';
import { FixedExpense } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Calendar, 
  DollarSign,
  Building,
  Wifi,
  Zap,
  Droplets,
  Phone,
  Monitor
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FixedExpenseListProps {
  onEdit: (expense: FixedExpense) => void;
}

const categoryConfig = {
  aluguel: { color: 'bg-blue-500/20 text-blue-300', label: 'Aluguel', icon: Building },
  energia: { color: 'bg-yellow-500/20 text-yellow-300', label: 'Energia', icon: Zap },
  agua: { color: 'bg-cyan-500/20 text-cyan-300', label: 'Água', icon: Droplets },
  internet: { color: 'bg-purple-500/20 text-purple-300', label: 'Internet', icon: Wifi },
  telefone: { color: 'bg-green-500/20 text-green-300', label: 'Telefone', icon: Phone },
  sistemas: { color: 'bg-indigo-500/20 text-indigo-300', label: 'Sistemas', icon: Monitor },
  outros: { color: 'bg-gray-500/20 text-gray-300', label: 'Outros', icon: DollarSign },
};

const statusConfig = {
  true: { color: 'bg-green-500/20 text-green-300', label: 'Ativo' },
  false: { color: 'bg-red-500/20 text-red-300', label: 'Inativo' },
};

export function FixedExpenseList({ onEdit }: FixedExpenseListProps) {
  const { fixedExpenses, deleteFixedExpense } = useFinancial();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  const filteredExpenses = fixedExpenses.filter(expense => {
    const matchesSearch = expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'todos' || expense.category === categoryFilter;
    const matchesStatus = statusFilter === 'todos' || expense.isActive.toString() === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDeleteExpense = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta conta fixa?')) {
      deleteFixedExpense(id);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white/5 backdrop-blur-2xl rounded-xl p-6 border border-white/10 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
              <Input
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-white/20 rounded-md text-sm bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="todos" className="bg-gray-800">Todas as categorias</option>
              <option value="aluguel" className="bg-gray-800">Aluguel</option>
              <option value="energia" className="bg-gray-800">Energia</option>
              <option value="agua" className="bg-gray-800">Água</option>
              <option value="internet" className="bg-gray-800">Internet</option>
              <option value="telefone" className="bg-gray-800">Telefone</option>
              <option value="sistemas" className="bg-gray-800">Sistemas</option>
              <option value="outros" className="bg-gray-800">Outros</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-white/20 rounded-md text-sm bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="todos" className="bg-gray-800">Todos os status</option>
              <option value="true" className="bg-gray-800">Ativas</option>
              <option value="false" className="bg-gray-800">Inativas</option>
            </select>
            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de Contas Fixas */}
      <div className="bg-white/5 backdrop-blur-2xl rounded-xl border border-white/10 shadow-xl">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">
            {filteredExpenses.length} {filteredExpenses.length === 1 ? 'conta fixa encontrada' : 'contas fixas encontradas'}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-white/80 font-medium">Nome</th>
                <th className="text-left p-4 text-white/80 font-medium">Categoria</th>
                <th className="text-left p-4 text-white/80 font-medium">Valor</th>
                <th className="text-left p-4 text-white/80 font-medium">Dia Vencimento</th>
                <th className="text-left p-4 text-white/80 font-medium">Status</th>
                <th className="text-left p-4 text-white/80 font-medium">Criado em</th>
                <th className="text-left p-4 text-white/80 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => {
                const CategoryIcon = categoryConfig[expense.category].icon;
                return (
                  <tr key={expense.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-white">{expense.name}</div>
                        {expense.notes && (
                          <div className="text-sm text-white/60 mt-1">{expense.notes}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={categoryConfig[expense.category].color}>
                        <CategoryIcon className="h-3 w-3 mr-1" />
                        {categoryConfig[expense.category].label}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="text-white font-semibold">
                        {formatCurrency(expense.amount)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-white/80 text-sm">
                        Dia {expense.dueDay}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={statusConfig[expense.isActive ? 'true' : 'false'].color}>
                        {statusConfig[expense.isActive ? 'true' : 'false'].label}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="text-white/80 text-sm">
                        {formatDate(expense.createdAt)}
                      </div>
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
                            <Calendar className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-800 border border-gray-700 text-white">
                          <DropdownMenuItem onClick={() => onEdit(expense)} className="hover:bg-gray-700 cursor-pointer">
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-400 hover:bg-red-900/50 cursor-pointer"
                            onClick={() => handleDeleteExpense(expense.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredExpenses.length === 0 && (
            <div className="text-center py-8">
              <p className="text-white/60">Nenhuma conta fixa encontrada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
