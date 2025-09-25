'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Client } from '@/lib/types';
import { useClients } from '@/lib/contexts/ClientContext';
import { exportToCSV } from '@/lib/utils/export';

const statusColors = {
  lead: 'bg-yellow-500/20 text-yellow-300',
  prospect: 'bg-blue-500/20 text-blue-300',
  cliente: 'bg-green-500/20 text-green-300',
  inativo: 'bg-gray-500/20 text-gray-300',
};

const statusLabels = {
  lead: 'Lead',
  prospect: 'Prospect',
  cliente: 'Cliente',
  inativo: 'Inativo',
};

interface ClientListProps {
  onNewClient: () => void;
  onEditClient: (client: Client) => void;
}

export function ClientList({ onNewClient, onEditClient }: ClientListProps) {
  const { clients, deleteClient } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [sourceFilter, setSourceFilter] = useState<string>('todos');
  const [dateFilter, setDateFilter] = useState<string>('todos');
  const [showFilters, setShowFilters] = useState(false);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'todos' || client.status === statusFilter;
    const matchesSource = sourceFilter === 'todos' || client.source === sourceFilter;
    
    // Filtro por data
    let matchesDate = true;
    if (dateFilter !== 'todos') {
      const now = new Date();
      const clientDate = new Date(client.createdAt);
      const daysDiff = Math.floor((now.getTime() - clientDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case 'hoje':
          matchesDate = daysDiff === 0;
          break;
        case 'semana':
          matchesDate = daysDiff <= 7;
          break;
        case 'mes':
          matchesDate = daysDiff <= 30;
          break;
        case 'trimestre':
          matchesDate = daysDiff <= 90;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesSource && matchesDate;
  });

  const handleDeleteClient = (clientId: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      deleteClient(clientId);
    }
  };

  const handleExportClients = () => {
    const exportData = filteredClients.map(client => ({
      Nome: client.name,
      Email: client.email,
      Telefone: client.phone,
      Empresa: client.company || '',
      Status: statusLabels[client.status],
      Origem: client.source,
      Notas: client.notes || '',
      'Data de Criação': new Date(client.createdAt).toLocaleDateString('pt-BR'),
      'Última Atualização': new Date(client.updatedAt).toLocaleDateString('pt-BR')
    }));
    
    exportToCSV(exportData, 'clientes');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('todos');
    setSourceFilter('todos');
    setDateFilter('todos');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (statusFilter !== 'todos') count++;
    if (sourceFilter !== 'todos') count++;
    if (dateFilter !== 'todos') count++;
    return count;
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
                placeholder="Buscar por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-white/20 rounded-md text-sm bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="todos" className="bg-gray-800">Todos os status</option>
              <option value="lead" className="bg-gray-800">Leads</option>
              <option value="prospect" className="bg-gray-800">Prospects</option>
              <option value="cliente" className="bg-gray-800">Clientes</option>
              <option value="inativo" className="bg-gray-800">Inativos</option>
            </select>
            <Dialog open={showFilters} onOpenChange={setShowFilters}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                  {getActiveFiltersCount() > 0 && (
                    <Badge className="ml-2 bg-indigo-500 text-white text-xs">
                      {getActiveFiltersCount()}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-white flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filtros Avançados
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-white/80 mb-2 block">Origem</label>
                    <select
                      value={sourceFilter}
                      onChange={(e) => setSourceFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-white/20 rounded-md text-sm bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="todos" className="bg-gray-800">Todas as origens</option>
                      <option value="Website" className="bg-gray-800">Website</option>
                      <option value="Facebook" className="bg-gray-800">Facebook</option>
                      <option value="Instagram" className="bg-gray-800">Instagram</option>
                      <option value="Indicação" className="bg-gray-800">Indicação</option>
                      <option value="Google" className="bg-gray-800">Google</option>
                      <option value="WhatsApp" className="bg-gray-800">WhatsApp</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-white/80 mb-2 block">Período</label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-white/20 rounded-md text-sm bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="todos" className="bg-gray-800">Todos os períodos</option>
                      <option value="hoje" className="bg-gray-800">Hoje</option>
                      <option value="semana" className="bg-gray-800">Última semana</option>
                      <option value="mes" className="bg-gray-800">Último mês</option>
                      <option value="trimestre" className="bg-gray-800">Último trimestre</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={clearFilters}
                      variant="outline" 
                      size="sm" 
                      className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Limpar
                    </Button>
                    <Button 
                      onClick={() => setShowFilters(false)}
                      size="sm" 
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Tabela de clientes */}
      <div className="bg-white/5 backdrop-blur-2xl rounded-xl border border-white/10 shadow-xl">
        <div className="p-6 border-b border-white/10">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">
              {filteredClients.length} {filteredClients.length === 1 ? 'cliente encontrado' : 'clientes encontrados'}
            </h3>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleExportClients} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button size="sm" onClick={onNewClient} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Novo Cliente
              </Button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-white/80">Cliente</TableHead>
                <TableHead className="text-white/80">Contato</TableHead>
                <TableHead className="text-white/80">Status</TableHead>
                <TableHead className="text-white/80">Origem</TableHead>
                <TableHead className="text-white/80">Data</TableHead>
                <TableHead className="w-[50px] text-white/80"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id} className="border-white/10 hover:bg-white/5">
                  <TableCell>
                    <div>
                      <div className="font-medium text-white">{client.name}</div>
                      {client.company && (
                        <div className="text-sm text-white/60">{client.company}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-white/80">
                        <Mail className="h-3 w-3 mr-1" />
                        {client.email}
                      </div>
                      <div className="flex items-center text-sm text-white/60">
                        <Phone className="h-3 w-3 mr-1" />
                        {client.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[client.status]}>
                      {statusLabels[client.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-white/60">
                    {client.source}
                  </TableCell>
                  <TableCell className="text-sm text-white/60">
                    {client.createdAt.toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-gray-800 border border-gray-700 text-white">
                        <DropdownMenuItem className="hover:bg-gray-700 cursor-pointer">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditClient(client)} className="hover:bg-gray-700 cursor-pointer">
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-400 hover:bg-red-900/50 cursor-pointer"
                          onClick={() => handleDeleteClient(client.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
