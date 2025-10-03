'use client';

import React, { useState } from 'react';
import { useStackAuth } from '@/lib/contexts/StackAuthContext-approval';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { SharedKanbanBoard } from '@/components/kanban/SharedKanbanBoard';
import { TaskForm } from '@/components/kanban/TaskForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Filter, Search, Download, Truck, Heart, ArrowRight, Target, Settings } from 'lucide-react';
import Link from 'next/link';
import { KanbanTask } from '@/lib/types';
import { useKanban } from '@/lib/contexts/KanbanContext';

export default function KanbanPage() {
  const { user, isLoading } = useStackAuth();
  const { addTask, updateTask, deleteTask, tasks } = useKanban();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<KanbanTask | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnData, setNewColumnData] = useState({
    title: '',
    subtitle: '',
    color: 'blue'
  });
  const [customColumns, setCustomColumns] = useState<{[key: string]: {title: string, subtitle: string, color: string}}>({});


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

  const handleSaveTask = (taskData: Omit<KanbanTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTask) {
      // Atualizar tarefa existente
      updateTask(editingTask.id, taskData);
      alert('Tarefa atualizada com sucesso!');
    } else {
      // Adicionar nova tarefa
      addTask(taskData);
      alert('Tarefa criada com sucesso!');
    }
    setShowForm(false);
    setEditingTask(undefined);
  };

  const handleEditTask = (task: KanbanTask) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleNewTask = () => {
    setEditingTask(undefined);
    setShowForm(true);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    alert('Oportunidade excluída com sucesso!');
    setShowForm(false);
    setEditingTask(undefined);
  };

  const handleExportTasks = () => {
    const exportData = tasks.map(task => ({
      'Título': task.title,
      'Destino': task.destination,
      'Status': task.status,
      'Prioridade': task.priority,
      'Valor': task.value,
      'Valor Esperado': task.expectedValue,
      'Data de Criação': new Date(task.createdAt).toLocaleDateString('pt-BR'),
      'Última Atualização': new Date(task.updatedAt).toLocaleDateString('pt-BR')
    }));
    
    const csvContent = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pipeline_vendas_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSearch = () => {
    alert('Funcionalidade de busca será implementada em breve!');
  };

  const handleFilters = () => {
    setShowFilters(!showFilters);
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
        <TaskForm
          task={editingTask}
          onSave={handleSaveTask}
          onCancel={() => {
            setShowForm(false);
            setEditingTask(undefined);
          }}
          onDelete={handleDeleteTask}
        />
      </ModernLayout>
    );
  }

  return (
    <ModernLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Target className="h-10 w-10 text-indigo-400" />
            Pipeline de Vendas
          </h1>
          <p className="text-white/70 text-lg mb-6">
            Gerencie oportunidades de pacotes personalizados
          </p>
          
          {/* Navegação entre sub-menus */}
          <div className="flex justify-center gap-4">
            <Link href="/kanban">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 font-medium">
                <Target className="h-5 w-5 mr-2" />
                Vendas
              </Button>
            </Link>
            <Link href="/kanban/delivery">
              <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/40 px-6 py-3 font-medium">
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
            </Button>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar oportunidades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-lg px-3 py-2 pr-10 w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Oportunidade
          </Button>
        </div>

        {/* Painel de Filtros */}
        {showFilters && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Filtros Avançados</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="text-white/60 hover:text-white"
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="todos">Todos os Status</option>
                    <option value="prospeccao">Prospecção</option>
                    <option value="qualificacao">Qualificação</option>
                    <option value="consultoria">Consultoria</option>
                    <option value="proposta">Proposta</option>
                    <option value="negociacao">Negociação</option>
                    <option value="fechado">Fechado</option>
                    <option value="perdido">Perdido</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Prioridade</label>
                  <select className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="todas">Todas as Prioridades</option>
                    <option value="alta">Alta</option>
                    <option value="media">Média</option>
                    <option value="baixa">Baixa</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Período</label>
                  <select className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="todos">Todos os Períodos</option>
                    <option value="hoje">Hoje</option>
                    <option value="semana">Esta Semana</option>
                    <option value="mes">Este Mês</option>
                    <option value="trimestre">Este Trimestre</option>
                    <option value="ano">Este Ano</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end mt-6 space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatusFilter('todos');
                    setSearchTerm('');
                  }}
                  className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                >
                  Limpar Filtros
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </div>
        )}

        <SharedKanbanBoard
          onAddTask={handleNewTask}
          onEditTask={handleEditTask}
        />

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
                  <Input
                    type="text"
                    value={newColumnData.title}
                    onChange={(e) => setNewColumnData(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Ex: Qualificação Avançada"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Subtítulo da Coluna
                  </label>
                  <Input
                    type="text"
                    value={newColumnData.subtitle}
                    onChange={(e) => setNewColumnData(prev => ({ ...prev, subtitle: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Ex: Análise detalhada do cliente"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Cor da Coluna
                  </label>
                  <select
                    value={newColumnData.color}
                    onChange={(e) => setNewColumnData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1"
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
