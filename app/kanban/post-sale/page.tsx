'use client';

import React, { useState, useCallback } from 'react';
import { useHybridAuth } from '@/lib/contexts/HybridAuthContext';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { PostSaleKanbanBoard } from '@/components/kanban/PostSaleKanbanBoard';
import { PostSaleTaskForm } from '@/components/kanban/PostSaleTaskForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Star, 
  MessageCircle, 
  Phone, 
  Mail, 
  Calendar, 
  Users, 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ThumbsUp, 
  Gift, 
  Award, 
  Target, 
  Truck,
  Filter,
  Search,
  Download,
  Settings
} from 'lucide-react';
import Link from 'next/link';

// Status do pós-venda
const POST_SALE_STATUS = {
  'aguardando': { name: 'Aguardando Feedback', color: 'bg-yellow-500', icon: Clock },
  'contato': { name: 'Em Contato', color: 'bg-blue-500', icon: Phone },
  'satisfeito': { name: 'Cliente Satisfeito', color: 'bg-green-500', icon: ThumbsUp },
  'reclamacao': { name: 'Reclamação', color: 'bg-red-500', icon: AlertCircle },
  'fidelizado': { name: 'Cliente Fidelizado', color: 'bg-purple-500', icon: Heart },
  'indicacao': { name: 'Indicação Recebida', color: 'bg-emerald-500', icon: Gift }
};

// Dados mockados para demonstração
const mockPostSaleTasks = [
  {
    id: '1',
    clientName: 'Família Silva',
    service: 'Pacote Concierge Bariloche - 7 dias',
    value: 15000,
    status: 'satisfeito' as keyof typeof POST_SALE_STATUS,
    completionDate: '2024-02-07',
    feedbackDate: '2024-02-10',
    satisfaction: 5,
    feedback: 'Experiência incrível! Superou todas as expectativas. Recomendamos para todos os amigos.',
    nextContact: '2024-03-07',
    assignedTo: 'Alexandre',
    priority: 'media' as 'baixa' | 'media' | 'alta',
    notes: 'Cliente muito satisfeito - possível indicação',
    createdAt: '2024-02-07',
    updatedAt: '2024-02-10'
  },
  {
    id: '2',
    clientName: 'Casal Johnson',
    service: 'Experiência Gastronômica Premium',
    value: 8500,
    status: 'contato' as keyof typeof POST_SALE_STATUS,
    completionDate: '2024-01-27',
    feedbackDate: null,
    satisfaction: null,
    feedback: null,
    nextContact: '2024-02-03',
    assignedTo: 'Amanda',
    priority: 'alta' as 'baixa' | 'media' | 'alta',
    notes: 'Ligar para verificar satisfação',
    createdAt: '2024-01-27',
    updatedAt: '2024-01-30'
  },
  {
    id: '3',
    clientName: 'Grupo Empresarial ABC',
    service: 'Retiro Corporativo na Patagônia',
    value: 25000,
    status: 'fidelizado' as keyof typeof POST_SALE_STATUS,
    completionDate: '2024-01-24',
    feedbackDate: '2024-01-28',
    satisfaction: 5,
    feedback: 'Excelente organização! Já queremos repetir no próximo ano.',
    nextContact: '2024-06-24',
    assignedTo: 'Vitor',
    priority: 'alta' as 'baixa' | 'media' | 'alta',
    notes: 'Cliente fidelizado - agendar próximo evento',
    createdAt: '2024-01-24',
    updatedAt: '2024-01-28'
  },
  {
    id: '4',
    clientName: 'Maria Santos',
    service: 'Tour Fotográfico Privado',
    value: 3200,
    status: 'indicacao' as keyof typeof POST_SALE_STATUS,
    completionDate: '2024-01-12',
    feedbackDate: '2024-01-15',
    satisfaction: 5,
    feedback: 'Fotos lindas! Já indiquei para 3 amigas.',
    nextContact: '2024-04-12',
    assignedTo: 'Kyra',
    priority: 'baixa' as 'baixa' | 'media' | 'alta',
    notes: 'Recebeu 3 indicações - acompanhar conversões',
    createdAt: '2024-01-12',
    updatedAt: '2024-01-15'
  },
  {
    id: '5',
    clientName: 'João Oliveira',
    service: 'Aventura na Patagônia',
    value: 12000,
    status: 'reclamacao' as keyof typeof POST_SALE_STATUS,
    completionDate: '2024-01-20',
    feedbackDate: '2024-01-22',
    satisfaction: 2,
    feedback: 'O guia não estava preparado e o tempo estava ruim. Esperava mais.',
    nextContact: '2024-01-25',
    assignedTo: 'Alex',
    priority: 'alta' as 'baixa' | 'media' | 'alta',
    notes: 'Reclamação sobre guia e clima - oferecer desconto',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-22'
  }
];

export default function PostSalePage() {
  const { user, isLoading } = useHybridAuth();
  const [tasks, setTasks] = useState<{
    id: string;
    clientName: string;
    service: string;
    value: number;
    status: 'aguardando' | 'contato' | 'satisfeito' | 'reclamacao' | 'fidelizado' | 'indicacao';
    completionDate: string;
    feedbackDate?: string;
    satisfaction?: number;
    feedback?: string;
    nextContact: string;
    assignedTo: string;
    priority: 'baixa' | 'media' | 'alta';
    notes?: string;
    createdAt: string;
    updatedAt: string;
  }[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<{
    id: string;
    clientName: string;
    service: string;
    value: number;
    status: 'aguardando' | 'contato' | 'satisfeito' | 'reclamacao' | 'fidelizado' | 'indicacao';
    completionDate: string;
    feedbackDate?: string;
    satisfaction?: number;
    feedback?: string;
    nextContact: string;
    assignedTo: string;
    priority: 'baixa' | 'media' | 'alta';
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

  const handleNewTask = () => {
    setEditingTask(undefined);
    setShowForm(true);
  };

  const handleEditTask = useCallback((task: {
    id: string;
    clientName: string;
    service: string;
    value: number;
    status: 'aguardando' | 'contato' | 'satisfeito' | 'reclamacao' | 'fidelizado' | 'indicacao';
    completionDate: string;
    feedbackDate?: string;
    satisfaction?: number;
    feedback?: string;
    nextContact: string;
    assignedTo: string;
    priority: 'baixa' | 'media' | 'alta';
    notes?: string;
    createdAt: string;
    updatedAt: string;
  }) => {
    setEditingTask(task);
    setShowForm(true);
  }, []);

  const handleSaveTask = (taskData: Partial<{
    id: string;
    clientName: string;
    service: string;
    value: number;
    status: 'aguardando' | 'contato' | 'satisfeito' | 'reclamacao' | 'fidelizado' | 'indicacao';
    completionDate: string;
    feedbackDate?: string;
    satisfaction?: number;
    feedback?: string;
    nextContact: string;
    assignedTo: string;
    priority: 'baixa' | 'media' | 'alta';
    notes?: string;
    createdAt: string;
    updatedAt: string;
  }>) => {
    try {
      if (editingTask) {
        // Atualizar tarefa existente
        console.log('Atualizando tarefa:', taskData);
        alert(`Atividade de pós-venda "${taskData.clientName}" atualizada com sucesso!`);
      } else {
        // Criar nova tarefa
        console.log('Criando nova tarefa:', taskData);
        
        // Criar nova tarefa com ID único
        const newTask = {
          id: `postsale_${Date.now()}`,
          clientName: taskData.clientName || '',
          service: taskData.service || '',
          value: taskData.value || 0,
          status: (taskData.status as 'aguardando' | 'contato' | 'satisfeito' | 'reclamacao' | 'fidelizado' | 'indicacao') || 'aguardando',
          completionDate: taskData.completionDate || '',
          feedbackDate: taskData.feedbackDate || '',
          satisfaction: taskData.satisfaction || null,
          feedback: taskData.feedback || '',
          nextContact: taskData.nextContact || '',
          assignedTo: taskData.assignedTo || '',
          priority: (taskData.priority as 'baixa' | 'media' | 'alta') || 'media',
          notes: taskData.notes || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Adicionar nova tarefa ao localStorage
        const existingTasks = JSON.parse(localStorage.getItem('postSaleTasks') || '[]');
        const updatedTasks = [...existingTasks, newTask];
        localStorage.setItem('postSaleTasks', JSON.stringify(updatedTasks));
        
        alert(`Nova atividade de pós-venda "${taskData.clientName}" criada com sucesso!`);
      }
      
      setShowForm(false);
      setEditingTask(undefined);
      
      // Recarregar a página para mostrar a nova tarefa
      window.location.reload();
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      alert('Erro ao salvar a atividade de pós-venda. Tente novamente.');
    }
  };

  const handleDeleteTask = (taskId: string) => {
    console.log('🗑️ HANDLE DELETE TASK CHAMADO NA PÁGINA PÓS-VENDA:', taskId);
    
    if (confirm('Tem certeza que deseja excluir esta atividade de pós-venda?')) {
      console.log('🗑️ CONFIRMAÇÃO ACEITA - EXCLUINDO TASK:', taskId);
      
      // Remover do localStorage
      const existingTasks = JSON.parse(localStorage.getItem('postSaleTasks') || '[]');
      const updatedTasks = existingTasks.filter((task: { id: string }) => task.id !== taskId);
      localStorage.setItem('postSaleTasks', JSON.stringify(updatedTasks));
      
      console.log('🗑️ TASK EXCLUÍDA PERMANENTEMENTE DO LOCALSTORAGE');
      alert(`Atividade de pós-venda excluída com sucesso!`);
      
      // Recarregar a página para refletir a mudança
      window.location.reload();
    } else {
      console.log('🗑️ EXCLUSÃO CANCELADA');
    }
  };

  const handleExportTasks = () => {
    // Aplicar filtros
    let filteredTasks = tasks;
    
    // Filtro por status
    if (statusFilter !== 'todos') {
      filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
    }
    
    // Filtro por prioridade
    if (priorityFilter !== 'todos') {
      filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
    }
    
    // Filtro por data
    if (dateFilter !== 'todos') {
      const today = new Date();
      const filterDate = new Date(today);
      
      switch (dateFilter) {
        case 'hoje':
          filterDate.setDate(today.getDate());
          break;
        case 'semana':
          filterDate.setDate(today.getDate() - 7);
          break;
        case 'mes':
          filterDate.setMonth(today.getMonth() - 1);
          break;
      }
      
      filteredTasks = filteredTasks.filter(task => {
        const taskDate = new Date(task.completionDate);
        return taskDate >= filterDate;
      });
    }
    
    // Filtro por busca
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.clientName.toLowerCase().includes(searchLower) ||
        task.service.toLowerCase().includes(searchLower) ||
        task.assignedTo.toLowerCase().includes(searchLower)
      );
    }

    // Gerar CSV
    const headers = [
      'ID', 'Cliente', 'Serviço', 'Valor', 'Status', 'Prioridade', 
      'Data Conclusão', 'Data Feedback', 'Satisfação', 'Feedback', 
      'Próximo Contato', 'Responsável', 'Notas', 'Criado em', 'Atualizado em'
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
        task.completionDate,
        task.feedbackDate || '',
        task.satisfaction || '',
        `"${task.feedback || ''}"`,
        task.nextContact,
        task.assignedTo,
        `"${task.notes || ''}"`,
        task.createdAt,
        task.updatedAt
      ].join(','))
    ].join('\n');

    // Download do arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pos_venda_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`Exportação concluída! ${filteredTasks.length} atividades de pós-venda exportadas.`);
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

  if (showForm) {
    return (
      <ModernLayout>
        <div className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            {editingTask ? 'Editar Pós-Venda' : 'Nova Atividade de Pós-Venda'}
          </h2>
          <p className="text-white/70 mb-8">
            {editingTask ? 'Edite os dados da atividade' : 'Preencha os dados da nova atividade'}
          </p>
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-xl p-8">
            <PostSaleTaskForm
              initialTask={editingTask}
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
            <Heart className="h-10 w-10 text-pink-400" />
            Pós-Venda
          </h1>
          <p className="text-white/70 text-lg mb-6">
            Acompanhe a satisfação e fidelização dos clientes
          </p>
          
          {/* Navegação entre sub-menus */}
          <div className="flex justify-center gap-4">
            <Link href="/kanban">
              <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/40 px-6 py-3">
                <Target className="h-5 w-5 mr-2" />
                Vendas
              </Button>
            </Link>
            <Link href="/kanban/delivery">
              <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/40 px-6 py-3">
                <Truck className="h-5 w-5 mr-2" />
                Entrega de Serviços
              </Button>
            </Link>
            <Link href="/kanban/post-sale">
              <Button className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3">
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
                <span className="ml-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                  {getActiveFiltersCount()}
                </span>
              )}
            </Button>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar pós-venda..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-lg px-3 py-2 pr-10 w-48 focus:outline-none focus:ring-2 focus:ring-pink-500"
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
            className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg font-medium hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Atividade
          </Button>
        </div>

        {/* Board Kanban */}
        <PostSaleKanbanBoard
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
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="todos">Todos os Status</option>
                    <option value="aguardando">Aguardando Feedback</option>
                    <option value="contato">Em Contato</option>
                    <option value="satisfeito">Cliente Satisfeito</option>
                    <option value="reclamacao">Reclamação</option>
                    <option value="fidelizado">Cliente Fidelizado</option>
                    <option value="indicacao">Indicação Recebida</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Prioridade
                  </label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="todos">Todas as Prioridades</option>
                    <option value="alta">Alta</option>
                    <option value="media">Média</option>
                    <option value="baixa">Baixa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Data de Conclusão
                  </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="todos">Todas as Datas</option>
                    <option value="hoje">Hoje</option>
                    <option value="semana">Última Semana</option>
                    <option value="mes">Último Mês</option>
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
                    className="bg-pink-600 hover:bg-pink-700 text-white flex-1"
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
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Ex: Follow-up"
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
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Ex: Acompanhamento pós-venda"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Cor da Coluna
                  </label>
                  <select
                    value={newColumnData.color}
                    onChange={(e) => setNewColumnData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                    className="bg-pink-600 hover:bg-pink-700 text-white flex-1"
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
