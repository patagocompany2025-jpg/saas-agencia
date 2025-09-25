'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { TaskForm } from '@/components/kanban/TaskForm';
import { Button } from '@/components/ui/button';
import { Plus, Filter, Search, Download, Truck, Heart, ArrowRight, Target } from 'lucide-react';
import Link from 'next/link';
import { KanbanTask } from '@/lib/types';
import { useKanban } from '@/lib/contexts/KanbanContext';

export default function KanbanPage() {
  const { user, isLoading } = useAuth();
  const { addTask, updateTask, deleteTask, tasks } = useKanban();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<KanbanTask | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');


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
    alert('Funcionalidade de filtros será implementada em breve!');
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
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white">Pipeline de Vendas</h2>
              <p className="text-white/60">Gerencie oportunidades de pacotes personalizados</p>
              
              {/* Navegação entre sub-menus */}
              <div className="flex gap-4 mt-4">
                <Link href="/kanban">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2">
                    <Target className="h-4 w-4 mr-2" />
                    Vendas
                  </Button>
                </Link>
                <Link href="/kanban/delivery">
                  <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/40 px-4 py-2 font-medium">
                    <Truck className="h-4 w-4 mr-2" />
                    Entrega de Serviços
                  </Button>
                </Link>
                <Link href="/kanban/post-sale">
                  <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/40 px-4 py-2 font-medium">
                    <Heart className="h-4 w-4 mr-2" />
                    Pós-Venda
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/15"
                title="Filtros"
                onClick={handleFilters}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/15"
                title="Buscar"
                onClick={handleSearch}
              >
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/15"
                title="Exportar"
                onClick={handleExportTasks}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button 
                onClick={handleNewTask}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Oportunidade
              </Button>
            </div>
          </div>
        </header>

        <KanbanBoard
          onNewTask={handleNewTask}
          onEditTask={handleEditTask}
        />
      </div>
    </ModernLayout>
  );
}
