'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  ArrowRight,
  Plus,
  DollarSign,
  Calendar,
  User,
  MapPin,
  Users,
  Clock,
  Star,
  Target,
  Plane,
  Hotel,
  Camera,
  Heart,
  Zap,
  Settings,
  GripVertical
} from 'lucide-react';
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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStackAuth } from '@/lib/contexts/StackAuthContext-approval';
import { useClients } from '@/lib/contexts/ClientContext';

const statusConfig = {
  prospeccao: {
    label: 'Prospecção',
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    icon: Target
  },
  qualificacao: {
    label: 'Qualificação',
    color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    icon: Star
  },
  proposta: {
    label: 'Proposta',
    color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    icon: Plane
  },
  negociacao: {
    label: 'Negociação',
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    icon: Users
  },
  'fechado-ganho': {
    label: 'Fechado - Ganho',
    color: 'bg-green-500/20 text-green-300 border-green-500/30',
    icon: Heart
  },
  'fechado-perdido': {
    label: 'Fechado - Perdido',
    color: 'bg-red-500/20 text-red-300 border-red-500/30',
    icon: Settings
  }
};

interface SharedTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  value?: number;
  priority: string;
  dueDate?: string;
  clientId: string;
  client: {
    id: string;
    name: string;
    email?: string;
  };
  user: {
    id: string;
    name?: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface SharedKanbanBoardProps {
  onAddTask: () => void;
  onEditTask: (task: SharedTask) => void;
}

export function SharedKanbanBoard({ onAddTask, onEditTask }: SharedKanbanBoardProps) {
  const { user } = useStackAuth();
  const { clients } = useClients();
  const [tasks, setTasks] = useState<SharedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedTask, setDraggedTask] = useState<SharedTask | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);

  // Carregar tarefas do banco de dados
  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sales');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTasks(data.data);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    
    // Recarregar a cada 10 segundos para sincronização
    const interval = setInterval(loadTasks, 10000);
    return () => clearInterval(interval);
  }, []);

  // Mover tarefa entre colunas
  const moveTask = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/sales', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: taskId,
          status: newStatus,
          userId: user?.id
        })
      });

      if (response.ok) {
        // Recarregar tarefas
        loadTasks();
      }
    } catch (error) {
      console.error('Erro ao mover tarefa:', error);
    }
  };

  // Excluir tarefa
  const deleteTask = async (taskId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;

    try {
      const response = await fetch(`/api/sales?id=${taskId}&userId=${user?.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Recarregar tarefas
        loadTasks();
      }
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
    }
  };

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent, task: SharedTask) => {
    e.stopPropagation();
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.setData('drag-type', 'card');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    
    const dragType = e.dataTransfer.getData('drag-type');
    if (dragType !== 'card') return;

    if (draggedTask && draggedTask.status !== targetStatus) {
      moveTask(draggedTask.id, targetStatus);
    }
    
    setDraggedTask(null);
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const getStatusIcon = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    return config ? config.icon : Target;
  };

  const getStatusColor = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    return config ? config.color : 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-white/60">Carregando tarefas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Pipeline de Vendas</h2>
          <p className="text-white/60">Gerencie suas oportunidades de venda</p>
        </div>
        <Button
          onClick={onAddTask}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Oportunidade
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {Object.entries(statusConfig).map(([status, config]) => {
          const statusTasks = getTasksByStatus(status);
          const StatusIcon = config.icon;

          return (
            <Card
              key={status}
              className="bg-white/5 backdrop-blur-2xl border-white/10 min-h-[600px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusIcon className="h-4 w-4 text-white/60" />
                    <CardTitle className="text-white text-sm font-medium">
                      {config.label}
                    </CardTitle>
                  </div>
                  <Badge className={`text-xs ${config.color}`}>
                    {statusTasks.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {statusTasks.map((task) => (
                  <Card
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    className="bg-white/10 border-white/20 cursor-move hover:bg-white/15 transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="text-white font-medium text-sm line-clamp-2">
                            {task.title}
                          </h4>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                              <DropdownMenuItem 
                                onClick={() => onEditTask(task)}
                                className="text-white hover:bg-gray-700"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => deleteTask(task.id)}
                                className="text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {task.description && (
                          <p className="text-white/60 text-xs line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-xs text-white/60">
                          <User className="h-3 w-3" />
                          <span>{task.client.name}</span>
                        </div>

                        {task.value && (
                          <div className="flex items-center gap-2 text-xs text-green-400">
                            <DollarSign className="h-3 w-3" />
                            <span>R$ {task.value.toLocaleString()}</span>
                          </div>
                        )}

                        {task.dueDate && (
                          <div className="flex items-center gap-2 text-xs text-white/60">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <Badge className={`text-xs ${getStatusColor(task.priority)}`}>
                            {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                          </Badge>
                          <span className="text-xs text-white/40">
                            {task.user.name || task.user.email}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
