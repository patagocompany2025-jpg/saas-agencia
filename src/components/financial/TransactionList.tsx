'use client';

import React, { useState } from 'react';
import { useFinancial } from '@/lib/contexts/FinancialContext';
import { FinancialTransaction } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  XCircle,
  DollarSign,
  Calendar,
  CreditCard
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TransactionListProps {
  onEdit: (transaction: FinancialTransaction) => void;
}

const statusConfig = {
  pendente: { color: 'bg-yellow-500/20 text-yellow-300', label: 'Pendente', icon: Clock },
  pago: { color: 'bg-green-500/20 text-green-300', label: 'Pago', icon: CheckCircle },
  vencido: { color: 'bg-red-500/20 text-red-300', label: 'Vencido', icon: XCircle },
  cancelado: { color: 'bg-gray-500/20 text-gray-300', label: 'Cancelado', icon: XCircle },
};

const typeConfig = {
  receita: { color: 'text-green-400', label: 'Receita', icon: '↗' },
  despesa: { color: 'text-red-400', label: 'Despesa', icon: '↘' },
};

const categoryConfig = {
  vendas: 'Vendas',
  pro_labore: 'Pró-labore',
  salarios: 'Salários',
  lucros: 'Lucros',
  contas_fixas: 'Contas Fixas',
  sistemas: 'Sistemas',
  outros: 'Outros',
};

export function TransactionList({ onEdit }: TransactionListProps) {
  const { transactions, deleteTransaction, markAsPaid } = useFinancial();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'todos' || transaction.type === typeFilter;
    const matchesStatus = statusFilter === 'todos' || transaction.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      deleteTransaction(id);
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
                placeholder="Buscar por descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-white/20 rounded-md text-sm bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="todos" className="bg-gray-800">Todos os tipos</option>
              <option value="receita" className="bg-gray-800">Receitas</option>
              <option value="despesa" className="bg-gray-800">Despesas</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-white/20 rounded-md text-sm bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="todos" className="bg-gray-800">Todos os status</option>
              <option value="pendente" className="bg-gray-800">Pendente</option>
              <option value="pago" className="bg-gray-800">Pago</option>
              <option value="vencido" className="bg-gray-800">Vencido</option>
              <option value="cancelado" className="bg-gray-800">Cancelado</option>
            </select>
            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de Transações */}
      <div className="bg-white/5 backdrop-blur-2xl rounded-xl border border-white/10 shadow-xl">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">
            {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transação encontrada' : 'transações encontradas'}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-white/80 font-medium">Descrição</th>
                <th className="text-left p-4 text-white/80 font-medium">Tipo</th>
                <th className="text-left p-4 text-white/80 font-medium">Categoria</th>
                <th className="text-left p-4 text-white/80 font-medium">Valor</th>
                <th className="text-left p-4 text-white/80 font-medium">Status</th>
                <th className="text-left p-4 text-white/80 font-medium">Vencimento</th>
                <th className="text-left p-4 text-white/80 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => {
                const StatusIcon = statusConfig[transaction.status].icon;
                return (
                  <tr key={transaction.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-white">{transaction.description}</div>
                        {transaction.notes && (
                          <div className="text-sm text-white/60 mt-1">{transaction.notes}</div>
                        )}
                        {transaction.recurring && (
                          <span className="inline-block bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full mt-1">
                            Recorrente
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`flex items-center gap-2 ${typeConfig[transaction.type].color}`}>
                        <span className="text-lg">{typeConfig[transaction.type].icon}</span>
                        <span className="text-sm font-medium">{typeConfig[transaction.type].label}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-white/80 text-sm">
                        {categoryConfig[transaction.category as keyof typeof categoryConfig]}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className={`font-semibold ${typeConfig[transaction.type].color}`}>
                        {formatCurrency(transaction.amount)}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={statusConfig[transaction.status].color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[transaction.status].label}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="text-white/80 text-sm">
                        {transaction.dueDate ? formatDate(transaction.dueDate) : '-'}
                      </div>
                      {transaction.paidDate && (
                        <div className="text-white/60 text-xs">
                          Pago em: {formatDate(transaction.paidDate)}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
                            <DollarSign className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-800 border border-gray-700 text-white">
                          <DropdownMenuItem onClick={() => onEdit(transaction)} className="hover:bg-gray-700 cursor-pointer">
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          {transaction.status === 'pendente' && (
                            <DropdownMenuItem 
                              onClick={() => markAsPaid(transaction.id)} 
                              className="hover:bg-gray-700 cursor-pointer"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Marcar como Pago
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-red-400 hover:bg-red-900/50 cursor-pointer"
                            onClick={() => handleDeleteTransaction(transaction.id)}
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
          {filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-white/60">Nenhuma transação encontrada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
