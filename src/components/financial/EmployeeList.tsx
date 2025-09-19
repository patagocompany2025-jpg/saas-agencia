'use client';

import React, { useState } from 'react';
import { useFinancial } from '@/lib/contexts/FinancialContext';
import { Employee } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Users, 
  DollarSign,
  Calendar,
  Building,
  CreditCard
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EmployeeListProps {
  onEdit: (employee: Employee) => void;
}

const roleConfig = {
  socio: { color: 'bg-purple-500/20 text-purple-300', label: 'Sócio' },
  vendedor: { color: 'bg-blue-500/20 text-blue-300', label: 'Vendedor' },
  administrativo: { color: 'bg-green-500/20 text-green-300', label: 'Administrativo' },
};

const statusConfig = {
  true: { color: 'bg-green-500/20 text-green-300', label: 'Ativo' },
  false: { color: 'bg-red-500/20 text-red-300', label: 'Inativo' },
};

export function EmployeeList({ onEdit }: EmployeeListProps) {
  const { employees, deleteEmployee } = useFinancial();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.bankAccount.bank.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'todos' || employee.role === roleFilter;
    const matchesStatus = statusFilter === 'todos' || employee.isActive.toString() === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleDeleteEmployee = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este funcionário?')) {
      deleteEmployee(id);
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
                placeholder="Buscar por nome ou banco..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-white/20 rounded-md text-sm bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="todos" className="bg-gray-800">Todos os cargos</option>
              <option value="socio" className="bg-gray-800">Sócios</option>
              <option value="vendedor" className="bg-gray-800">Vendedores</option>
              <option value="administrativo" className="bg-gray-800">Administrativo</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-white/20 rounded-md text-sm bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="todos" className="bg-gray-800">Todos os status</option>
              <option value="true" className="bg-gray-800">Ativos</option>
              <option value="false" className="bg-gray-800">Inativos</option>
            </select>
            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de Funcionários */}
      <div className="bg-white/5 backdrop-blur-2xl rounded-xl border border-white/10 shadow-xl">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">
            {filteredEmployees.length} {filteredEmployees.length === 1 ? 'funcionário encontrado' : 'funcionários encontrados'}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-white/80 font-medium">Funcionário</th>
                <th className="text-left p-4 text-white/80 font-medium">Cargo</th>
                <th className="text-left p-4 text-white/80 font-medium">Salário/Pró-labore</th>
                <th className="text-left p-4 text-white/80 font-medium">Participação</th>
                <th className="text-left p-4 text-white/80 font-medium">Dia Pagamento</th>
                <th className="text-left p-4 text-white/80 font-medium">Banco</th>
                <th className="text-left p-4 text-white/80 font-medium">Status</th>
                <th className="text-left p-4 text-white/80 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-white">{employee.name}</div>
                      <div className="text-sm text-white/60">
                        {employee.bankAccount.agency} / {employee.bankAccount.account}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge className={roleConfig[employee.role].color}>
                      {roleConfig[employee.role].label}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      {employee.salary > 0 && (
                        <div className="text-white/80 text-sm">
                          Salário: {formatCurrency(employee.salary)}
                        </div>
                      )}
                      {employee.proLabore && employee.proLabore > 0 && (
                        <div className="text-white/80 text-sm">
                          Pró-labore: {formatCurrency(employee.proLabore)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-white/80 text-sm">
                      {employee.profitShare ? `${employee.profitShare}%` : '-'}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-white/80 text-sm">
                      Dia {employee.paymentDay}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-white/80 text-sm">
                      {employee.bankAccount.bank}
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge className={statusConfig[employee.isActive ? 'true' : 'false'].color}>
                      {statusConfig[employee.isActive ? 'true' : 'false'].label}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
                          <Users className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-gray-800 border border-gray-700 text-white">
                        <DropdownMenuItem onClick={() => onEdit(employee)} className="hover:bg-gray-700 cursor-pointer">
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-400 hover:bg-red-900/50 cursor-pointer"
                          onClick={() => handleDeleteEmployee(employee.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEmployees.length === 0 && (
            <div className="text-center py-8">
              <p className="text-white/60">Nenhum funcionário encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
