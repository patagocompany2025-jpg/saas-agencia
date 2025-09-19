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
  const { addTask, updateTask, deleteTask } = useKanban();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<KanbanTask | undefined>();

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
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-4 py-2">
                    <Truck className="h-4 w-4 mr-2" />
                    Entrega de Serviços
                  </Button>
                </Link>
                <Link href="/kanban/post-sale">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-4 py-2">
                    <Heart className="h-4 w-4 mr-2" />
                    Pós-Venda
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 bg-white/10 border border-white/20 rounded-lg text-white transition-all hover:bg-white/15">
                <Filter className="w-5 h-5" />
              </button>
              <button className="p-2 bg-white/10 border border-white/20 rounded-lg text-white transition-all hover:bg-white/15">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 bg-white/10 border border-white/20 rounded-lg text-white transition-all hover:bg-white/15">
                <Download className="w-5 h-5" />
              </button>
              <button 
                onClick={handleNewTask}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Oportunidade
              </button>
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
