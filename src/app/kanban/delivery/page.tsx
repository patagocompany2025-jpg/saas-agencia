'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useStackAuth } from '@/lib/contexts/StackAuthContext-approval';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { DeliveryKanbanBoard } from '@/components/kanban/DeliveryKanbanBoard';
import { DeliveryTaskForm } from '@/components/kanban/DeliveryTaskForm';
import { Button } from '@/components/ui/button';
import { 
  Plus,
  Filter,
  Search,
  Download,
  Truck,
  Heart,
  ArrowRight,
  Target,
  Settings
} from 'lucide-react';
import Link from 'next/link';

export default function DeliveryPage() {
  const { user, isLoading } = useStackAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<{
    id: string;
    clientName: string;
    service: string;
    value: number;
    status: 'confirmado' | 'planejamento' | 'preparacao' | 'execucao' | 'concluido' | 'pos-venda';
    priority: 'baixa' | 'media' | 'alta';
    paymentDate: string;
    startDate: string;
    endDate: string;
    travelers: number;
    destination: string;
    assignedTo: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
  } | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [showFilters, setShowFilters] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string>('todos');
  const [dateFilter, setDateFilter] = useState<string>('todos');
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnData, setNewColumnData] = useState({
    title: '',
    subtitle: '',
    color: 'blue'
  });
  const [customColumns, setCustomColumns] = useState<{[key: string]: {title: string, subtitle: string, color: string}}>({});

  // Todos os callbacks devem estar no início, antes dos returns condicionais
  const handleNewTask = () => {
    setEditingTask(undefined);
    setShowForm(true);
  };

  const handleEditTask = useCallback((task: {
    id: string;
    clientName: string;
    service: string;
    value: number;
    status: 'confirmado' | 'planejamento' | 'preparacao' | 'execucao' | 'concluido' | 'pos-venda';
    priority: 'baixa' | 'media' | 'alta';
    paymentDate: string;
    startDate: string;
    endDate: string;
    travelers: number;
    destination: string;
    assignedTo: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
  }) => {
    console.log('🔧 HANDLE EDIT TASK CHAMADO:', task);
    setEditingTask(task);
    setShowForm(true);
  }, []);

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

  const handleSaveTask = (taskData: Partial<{
    id: string;
    clientName: string;
    service: string;
    value: number;
    status: 'confirmado' | 'planejamento' | 'preparacao' | 'execucao' | 'concluido' | 'pos-venda';
    priority: 'baixa' | 'media' | 'alta';
    paymentDate: string;
    startDate: string;
    endDate: string;
    travelers: number;
    destination: string;
    assignedTo: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
  }>) => {
    try {
      if (editingTask) {
        // Atualizar tarefa existente
        console.log('Atualizando tarefa:', taskData);
        alert(`Entrega "${taskData.clientName}" atualizada com sucesso!`);
      } else {
        // Criar nova tarefa
        console.log('Criando nova tarefa:', taskData);
        alert(`Nova entrega "${taskData.clientName}" criada com sucesso!`);
      }
      
      setShowForm(false);
      setEditingTask(undefined);
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      alert('Erro ao salvar a entrega. Tente novamente.');
    }
  };

  const handleDeleteTask = (taskId: string) => {
    console.log('🗑️ HANDLE DELETE TASK CHAMADO NA PÁGINA:', taskId);
    // Implementar lógica de exclusão
    console.log('Excluindo tarefa:', taskId);
    alert(`Entrega ${taskId} excluída com sucesso!`);
  };

  const handleExportTasks = () => {
    // Dados mockados para demonstração
    const mockTasks = [
      {
        id: '1',
        clientName: 'Família Silva',
        service: 'Pacote Concierge Bariloche - 7 dias',
        value: 15000,
        status: 'confirmado',
        priority: 'alta',
        paymentDate: '2024-01-15',
        startDate: '2024-02-01',
        endDate: '2024-02-07',
        travelers: 4,
        destination: 'Bariloche, Argentina',
        assignedTo: 'Alexandre',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-15'
      },
      {
        id: '2',
        clientName: 'Casal Johnson',
        service: 'Experiência Gastronômica Premium',
        value: 8500,
        status: 'planejamento',
        priority: 'media',
        paymentDate: '2024-01-20',
        startDate: '2024-02-15',
        endDate: '2024-02-18',
        travelers: 2,
        destination: 'Buenos Aires, Argentina',
        assignedTo: 'Amanda',
        createdAt: '2024-01-18',
        updatedAt: '2024-01-20'
      }
    ];

    // Filtrar tarefas baseado nos filtros ativos
    let filteredTasks = mockTasks;

    if (statusFilter !== 'todos') {
      filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
    }

    if (priorityFilter !== 'todos') {
      filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
    }

    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.clientName.toLowerCase().includes(searchLower) ||
        task.service.toLowerCase().includes(searchLower) ||
        task.destination.toLowerCase().includes(searchLower)
      );
    }

    // Gerar CSV
    const headers = [
      'ID', 'Cliente', 'Serviço', 'Valor', 'Status', 'Prioridade', 
      'Data Pagamento', 'Data Início', 'Data Fim', 'Viajantes', 
      'Destino', 'Responsável', 'Criado em', 'Atualizado em'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredTasks.map(task => [
        task.id,
        `"${task.clientName}"`,
        `"${task.service}"`,
        task.value,
        task.status,
        task.priority,
        task.paymentDate,
        task.startDate,
        task.endDate,
        task.travelers,
        `"${task.destination}"`,
        task.assignedTo,
        task.createdAt,
        task.updatedAt
      ].join(','))
    ].join('\n');

    // Download do arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `entregas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`Exportação concluída! ${filteredTasks.length} entregas exportadas.`);
  };

  const handleFilters = () => {
    setShowFilters(true);
  };

  const handleClearFilters = () => {
    setStatusFilter('todos');
    setPriorityFilter('todos');
    setDateFilter('todos');
    setSearchTerm('');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (statusFilter !== 'todos') count++;
    if (priorityFilter !== 'todos') count++;
    if (dateFilter !== 'todos') count++;
    if (searchTerm.trim() !== '') count++;
    return count;
  };

  const handleAddColumn = () => {
    setShowAddColumn(true);
  };

  const handleSaveNewColumn = () => {
    if (newColumnData.title.trim() === '') {
      alert('Por favor, preencha o título da coluna.');
      return;
    }
    
    // Criar nova coluna com ID único
    const newColumnId = `custom_${Date.now()}`;
    setCustomColumns(prev => ({
      ...prev,
      [newColumnId]: newColumnData
    }));
    
    alert(`Nova coluna "${newColumnData.title}" criada com sucesso!`);
    setShowAddColumn(false);
    setNewColumnData({ title: '', subtitle: '', color: 'blue' });
  };

  const handleCancelAddColumn = () => {
    setShowAddColumn(false);
    setNewColumnData({ title: '', subtitle: '', color: 'blue' });
  };

  const handleUpdateCustomColumn = (columnId: string, data: {title: string, subtitle: string, color: string}) => {
    setCustomColumns(prev => ({
      ...prev,
      [columnId]: data
    }));
  };

  const handleDeleteCustomColumn = (columnId: string) => {
    setCustomColumns(prev => {
      const updated = { ...prev };
      delete updated[columnId];
      return updated;
    });
  };


  if (showForm) {
    return (
      <ModernLayout>
        <div className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            {editingTask ? 'Editar Entrega' : 'Nova Entrega'}
          </h2>
          <p className="text-white/70 mb-8">
            {editingTask ? 'Edite os dados da entrega' : 'Preencha os dados da nova entrega'}
          </p>
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-xl p-8">
            <DeliveryTaskForm
              task={editingTask}
              onSave={handleSaveTask}
              onCancel={() => {
                setShowForm(false);
                setEditingTask(undefined);
              }}
            />
          </div>
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
            <Truck className="h-10 w-10 text-orange-400" />
            Entrega de Serviços
          </h1>
          <p className="text-white/70 text-lg mb-6">
            Acompanhe a execução e entrega dos serviços vendidos
          </p>
          
          {/* Navegação entre sub-menus */}
          <div className="flex justify-center gap-4">
            <Link href="/kanban">
              <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/40 px-6 py-3 font-medium">
                <Target className="h-5 w-5 mr-2" />
                Vendas
              </Button>
            </Link>
            <Link href="/kanban/delivery">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 font-medium">
                <Truck className="h-5 w-5 mr-2" />
                Entrega de Serviços
              </Button>
            </Link>
            <Link href="/kanban/post-sale">
              <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/40 px-6 py-3 font-medium">
                <Heart className="h-5 w-5 mr-2" />
                Pós-Venda
              </Button>
            </Link>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/15"
              onClick={handleFilters}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
              {getActiveFiltersCount() > 0 && (
                <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  {getActiveFiltersCount()}
                </span>
              )}
            </Button>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar entregas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-lg px-3 py-2 pr-10 w-48 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/15"
              onClick={handleExportTasks}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            {user?.role === 'socio' && (
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/15"
                onClick={handleAddColumn}
              >
                <Settings className="w-4 h-4 mr-2" />
                Adicionar Coluna
              </Button>
            )}
          </div>
          <Button 
            onClick={handleNewTask}
            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all shadow-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Entrega
          </Button>
        </div>

        {/* Board Kanban */}
        <DeliveryKanbanBoard
          onNewTask={handleNewTask}
          onEditTask={handleEditTask}
          customColumns={customColumns}
          onUpdateCustomColumn={handleUpdateCustomColumn}
          onDeleteCustomColumn={handleDeleteCustomColumn}
        />

        {/* Modal de Filtros */}
        {showFilters && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold text-white mb-4">Filtros Avançados</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="todos">Todos os Status</option>
                    <option value="confirmado">Pagamento Confirmado</option>
                    <option value="planejamento">Planejamento</option>
                    <option value="preparacao">Preparação</option>
                    <option value="execucao">Em Execução</option>
                    <option value="concluido">Concluído</option>
                    <option value="pos-venda">Pós-Venda</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Prioridade
                  </label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="todos">Todas as Prioridades</option>
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Período
                  </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="todos">Todos os Períodos</option>
                    <option value="hoje">Hoje</option>
                    <option value="semana">Esta Semana</option>
                    <option value="mes">Este Mês</option>
                    <option value="trimestre">Este Trimestre</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleClearFilters}
                    variant="outline"
                    className="bg-gray-600 border-gray-500 text-white hover:bg-gray-700 hover:border-gray-400 flex-1"
                  >
                    Limpar Filtros
                  </Button>
                  <Button
                    onClick={() => setShowFilters(false)}
                    className="bg-orange-600 hover:bg-orange-700 text-white flex-1"
                  >
                    Aplicar Filtros
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal para Adicionar Nova Coluna */}
        {showAddColumn && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold text-white mb-4">Adicionar Nova Coluna</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Título da Coluna
                  </label>
                  <input
                    type="text"
                    value={newColumnData.title}
                    onChange={(e) => setNewColumnData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Ex: Qualidade"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Subtítulo da Coluna
                  </label>
                  <input
                    type="text"
                    value={newColumnData.subtitle}
                    onChange={(e) => setNewColumnData(prev => ({ ...prev, subtitle: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Ex: Verificação de qualidade"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Cor da Coluna
                  </label>
                  <select
                    value={newColumnData.color}
                    onChange={(e) => setNewColumnData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="blue">Azul</option>
                    <option value="green">Verde</option>
                    <option value="yellow">Amarelo</option>
                    <option value="orange">Laranja</option>
                    <option value="red">Vermelho</option>
                    <option value="purple">Roxo</option>
                    <option value="pink">Rosa</option>
                    <option value="indigo">Índigo</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSaveNewColumn}
                    className="bg-orange-600 hover:bg-orange-700 text-white flex-1"
                  >
                    Adicionar Coluna
                  </Button>
                  <Button
                    onClick={handleCancelAddColumn}
                    variant="outline"
                    className="bg-gray-600 border-gray-500 text-white hover:bg-gray-700 hover:border-gray-400 flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModernLayout>
  );
}