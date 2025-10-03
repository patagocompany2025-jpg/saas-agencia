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
import { KanbanTask } from '@/lib/types';
import { useKanban } from '@/lib/contexts/KanbanContext';
import { useClients } from '@/lib/contexts/ClientContext';
import { useStackAuth } from '@/lib/contexts/StackAuthContext-approval';

const statusConfig = {
  prospeccao: {
    title: 'Prospecção',
    subtitle: 'Identificação de leads',
    color: 'bg-gray-100 text-gray-800',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: '🔍'
  },
  qualificacao: {
    title: 'Qualificação',
    subtitle: 'Avaliação de potencial',
    color: 'bg-blue-100 text-blue-800',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: '📋'
  },
  consultoria: {
    title: 'Consultoria',
    subtitle: 'Entendimento de necessidades',
    color: 'bg-purple-100 text-purple-800',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: '💬'
  },
  proposta: {
    title: 'Proposta',
    subtitle: 'Elaboração do pacote',
    color: 'bg-yellow-100 text-yellow-800',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: '📄'
  },
  negociacao: {
    title: 'Negociação',
    subtitle: 'Ajustes e fechamento',
    color: 'bg-orange-100 text-orange-800',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: '🤝'
  },
  fechado: {
    title: 'Fechado',
    subtitle: 'Venda concluída',
    color: 'bg-green-100 text-green-800',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: '✅'
  },
  perdido: {
    title: 'Perdido',
    subtitle: 'Oportunidade perdida',
    color: 'bg-red-100 text-red-800',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: '❌'
  }
};

const priorityConfig = {
  baixa: { color: 'bg-gray-100 text-gray-800', label: 'Baixa' },
  media: { color: 'bg-blue-100 text-blue-800', label: 'Média' },
  alta: { color: 'bg-red-100 text-red-800', label: 'Alta' }
};

interface KanbanBoardProps {
  onNewTask: () => void;
  onEditTask: (task: KanbanTask) => void;
  customColumns?: {[key: string]: {title: string, subtitle: string, color: string}};
  onUpdateCustomColumn?: (columnId: string, data: {title: string, subtitle: string, color: string}) => void;
  onDeleteCustomColumn?: (columnId: string) => void;
}

export function KanbanBoard({ onNewTask, onEditTask, customColumns = {}, onUpdateCustomColumn, onDeleteCustomColumn }: KanbanBoardProps) {
  const { user } = useStackAuth();
  const { tasks, moveTask, deleteTask, getTasksByStatus, getTotalValue } = useKanban();
  const { getClient } = useClients();
  const [draggedTask, setDraggedTask] = useState<KanbanTask | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [columnOrder, setColumnOrder] = useState<KanbanTask['status'][]>(['prospeccao', 'qualificacao', 'consultoria', 'proposta', 'negociacao', 'fechado', 'perdido']);
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  const [editingColumn, setEditingColumn] = useState<KanbanTask['status'] | null>(null);
  const [columnConfig, setColumnConfig] = useState({
    title: '',
    subtitle: ''
  });
  // Estado para armazenar configurações personalizadas das colunas padrão
  const [customColumnConfigs, setCustomColumnConfigs] = useState<{[key: string]: {title: string, subtitle: string}}>({});

  // Atualizar a ordem das colunas quando novas colunas customizadas são adicionadas
  useEffect(() => {
    // Comentado temporariamente para evitar erros de tipo
    // const customColumnIds = Object.keys(customColumns);
    // if (customColumnIds.length > 0) {
    //   setColumnOrder(prev => {
    //     const existingCustom = prev.filter(col => col.startsWith('custom_'));
    //     const newCustom = customColumnIds.filter(id => !existingCustom.includes(id));
    //     return [...prev.filter(col => !col.startsWith('custom_')), ...newCustom];
    //   });
    // }
  }, [customColumns]);

  const handleDragStart = (e: React.DragEvent, task: KanbanTask) => {
    e.stopPropagation(); // Impedir que o evento se propague para a coluna
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.setData('drag-type', 'card'); // Marcar como arrastar card
    
    // Adicionar classe visual ao card sendo arrastado
    const target = e.target as HTMLElement;
    const card = target.closest('[draggable="true"]') as HTMLElement;
    if (card) {
      card.style.opacity = '0.5';
      card.style.transform = 'rotate(5deg) scale(1.05)';
      card.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
      card.style.zIndex = '1000';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Restaurar aparência do card
    const target = e.target as HTMLElement;
    const card = target.closest('[draggable="true"]') as HTMLElement;
    if (card) {
      card.style.opacity = '1';
      card.style.transform = 'rotate(0deg) scale(1)';
      card.style.boxShadow = '';
      card.style.zIndex = '';
    }
    setDraggedTask(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Adicionar efeito visual na coluna de destino
    const target = e.currentTarget as HTMLElement;
    const column = target.querySelector('.column-header') as HTMLElement;
    if (column) {
      column.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
      column.style.borderRadius = '8px';
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Remover efeito visual quando sair da coluna
    const target = e.currentTarget as HTMLElement;
    const column = target.querySelector('.column-header') as HTMLElement;
    if (column) {
      column.style.backgroundColor = '';
      column.style.borderRadius = '';
    }
  };

  const handleDrop = (e: React.DragEvent, newStatus: KanbanTask['status']) => {
    e.preventDefault();
    
    // Verificar se é arrastar card (não coluna)
    const dragType = e.dataTransfer.getData('drag-type');
    if (dragType !== 'card') return;
    
    // Remover efeito visual
    const target = e.currentTarget as HTMLElement;
    const column = target.querySelector('.column-header') as HTMLElement;
    if (column) {
      column.style.backgroundColor = '';
      column.style.borderRadius = '';
    }
    
    if (draggedTask && draggedTask.status !== newStatus) {
      moveTask(draggedTask.id, newStatus);
      
      // Feedback visual de sucesso
      if (column) {
        column.style.color = '#10b981';
        column.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
        setTimeout(() => {
          column.style.color = '';
          column.style.backgroundColor = '';
        }, 1000);
      }
    }
    setDraggedTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      deleteTask(taskId);
    }
  };

  const handleEditColumn = (columnStatus: KanbanTask['status']) => {
    const config = statusConfig[columnStatus];
    setEditingColumn(columnStatus);
    
    // Verificar se há configuração personalizada salva
    if (customColumnConfigs[columnStatus]) {
      setColumnConfig({
        title: customColumnConfigs[columnStatus].title,
        subtitle: customColumnConfigs[columnStatus].subtitle
      });
    } else {
      setColumnConfig({
        title: config.title,
        subtitle: config.subtitle
      });
    }
    setShowColumnConfig(true);
  };

  const handleSaveColumnConfig = () => {
    if (editingColumn) {
      // Salvar configuração personalizada no estado local
      setCustomColumnConfigs(prev => ({
        ...prev,
        [editingColumn]: {
          title: columnConfig.title,
          subtitle: columnConfig.subtitle
        }
      }));
      alert(`Configurações da coluna "${columnConfig.title}" salvas com sucesso!`);
      setShowColumnConfig(false);
      setEditingColumn(null);
    }
  };

  const handleCancelColumnConfig = () => {
    setShowColumnConfig(false);
    setEditingColumn(null);
    setColumnConfig({ title: '', subtitle: '' });
  };

  const handleDeleteColumn = (columnStatus: KanbanTask['status']) => {
    if (confirm(`Tem certeza que deseja excluir a coluna "${statusConfig[columnStatus].title}"? Esta ação não pode ser desfeita.`)) {
      // Remover a coluna da ordem das colunas
      setColumnOrder(prev => prev.filter(col => col !== columnStatus));
      
      // Mover todas as tarefas desta coluna para a primeira coluna disponível
      const remainingColumns = columnOrder.filter(col => col !== columnStatus);
      if (remainingColumns.length > 0) {
        const firstColumn = remainingColumns[0] as KanbanTask['status'];
        // Aqui você poderia implementar a lógica para mover as tarefas
        // Por enquanto, apenas removemos a coluna da visualização
      }
      
      alert(`Coluna "${statusConfig[columnStatus].title}" excluída com sucesso!`);
    }
  };

  // Funções para drag and drop de colunas
  const handleColumnDragStart = (e: React.DragEvent, columnStatus: KanbanTask['status']) => {
    // Só permitir arrastar coluna se clicar especificamente no GripVertical
    const target = e.target as HTMLElement;
    const gripElement = target.closest('.grip-handle');
    
    if (!gripElement) {
      e.preventDefault(); // Cancelar o drag se não for no grip
      return;
    }
    
    setDraggedColumn(columnStatus);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', columnStatus);
    e.dataTransfer.setData('drag-type', 'column'); // Marcar como arrastar coluna
  };

  const handleColumnDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleColumnDrop = (e: React.DragEvent, targetColumn: KanbanTask['status']) => {
    e.preventDefault();
    
    // Verificar se é arrastar coluna (não card)
    const dragType = e.dataTransfer.getData('drag-type');
    if (dragType !== 'column') return;
    
    if (draggedColumn && draggedColumn !== targetColumn) {
      const newOrder = [...columnOrder];
      const draggedIndex = newOrder.indexOf(draggedColumn as KanbanTask['status']);
      const targetIndex = newOrder.indexOf(targetColumn);
      
      // Trocar posições
      if (draggedIndex !== -1 && targetIndex !== -1) {
        newOrder[draggedIndex] = targetColumn;
        newOrder[targetIndex] = draggedColumn as KanbanTask['status'];
      }
      
      setColumnOrder(newOrder);
    }
    setDraggedColumn(null);
  };

  const handleColumnDragEnd = () => {
    setDraggedColumn(null);
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
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      {/* Board Kanban - Layout Horizontal */}
      <div className="kanban-scroll">
        <div className="flex gap-4" style={{ minWidth: 'calc(100vw - 200px)' }}>
        {columnOrder.map((status) => {
          const isCustomColumn = status.startsWith('custom_');
          let config;
          
          if (isCustomColumn) {
            config = {
              title: customColumns[status]?.title || 'Nova Coluna',
              subtitle: customColumns[status]?.subtitle || 'Descrição',
              icon: <Settings className="h-4 w-4 text-blue-400" />,
              color: 'border-blue-500/30 bg-blue-500/5'
            };
          } else {
            const defaultConfig = statusConfig[status];
            const customConfig = customColumnConfigs[status];
            
            // Usar configuração personalizada se disponível, senão usar padrão
            config = {
              ...defaultConfig,
              title: customConfig?.title || defaultConfig.title,
              subtitle: customConfig?.subtitle || defaultConfig.subtitle
            };
          }
          
          const statusTasks = isCustomColumn ? [] : getTasksByStatus(status as KanbanTask['status']);
          const totalValue = isCustomColumn ? 0 : getTotalValue(status as KanbanTask['status']);
          const expectedValue = statusTasks.reduce((total, task) => total + (task.expectedValue || 0), 0);
          
          return (
            <div
              key={status}
              className={`bg-white/5 backdrop-blur-2xl border border-white/10 rounded-xl p-3 min-h-[600px] w-72 shadow-xl flex flex-col transition-all duration-200 ${
                draggedTask && draggedTask.status !== status 
                  ? 'border-indigo-400 border-2 bg-indigo-500/5' 
                  : ''
              } ${
                draggedColumn === status 
                  ? 'opacity-50 scale-95' 
                  : ''
              }`}
              onDragOver={(e) => {
                handleDragOver(e);
                handleColumnDragOver(e);
              }}
              onDragLeave={handleDragLeave}
              onDrop={(e) => {
                handleDrop(e, status);
                handleColumnDrop(e, status);
              }}
              draggable
              onDragStart={(e) => handleColumnDragStart(e, status)}
              onDragEnd={handleColumnDragEnd}
            >
              {/* Header da Coluna */}
              <div className="mb-4 flex-shrink-0 column-header">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-white/40 cursor-move grip-handle" />
                    <span className="text-sm">{config.icon}</span>
                    <div>
                      <h3 className="font-semibold text-white text-sm">{config.title}</h3>
                      <p className="text-xs text-white/60">{config.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                      {statusTasks.length}
                    </div>
                    {user?.role === 'socio' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
                            title="Configurar coluna"
                          >
                            <Settings className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                          <DropdownMenuItem 
                            onClick={() => handleEditColumn(status)}
                            className="text-white hover:bg-gray-700"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar Coluna
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteColumn(status)}
                            className="text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir Coluna
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
                
                {/* Métricas */}
                <div className="space-y-1">
                  <div className="text-sm font-bold text-white">
                    {formatCurrency(totalValue)}
                  </div>
                  {expectedValue > 0 && (
                    <div className="text-xs text-white/60">
                      <span className="text-xs">Esperado:</span> {formatCurrency(expectedValue)}
                    </div>
                  )}
                </div>
              </div>

              {/* Lista de Tarefas */}
              <div className="flex-1 space-y-2 overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {draggedTask && draggedTask.status !== status && (
                  <div className="border-2 border-dashed border-indigo-400 bg-indigo-500/10 rounded-lg p-4 text-center text-indigo-300 text-sm font-medium mb-2 animate-pulse">
                    <div className="flex items-center justify-center gap-2">
                      <ArrowRight className="h-4 w-4" />
                      Solte aqui para mover para {config.title}
                    </div>
                  </div>
                )}
                {statusTasks.map((task) => {
                  const client = getClient(task.clientId);
                  
                  return (
                    <div
                      key={task.id}
                      className="cursor-move hover:shadow-xl transition-all duration-200 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-3 hover:bg-white/15 hover:border-white/30 hover:scale-[1.02] select-none touch-manipulation"
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      onTouchStart={(e) => {
                        // Suporte básico para touch - pode ser expandido
                        const touch = e.touches[0];
                        if (touch) {
                          // Preparar para drag em dispositivos touch
                          e.preventDefault();
                        }
                      }}
                    >
                      {/* Header do Card */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="h-3 w-3 text-indigo-400 flex-shrink-0" />
                            <h4 className="font-semibold text-sm text-white truncate">
                              {task.destination}
                            </h4>
                          </div>
                          {client && (
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3 text-white/50 flex-shrink-0" />
                              <p className="text-xs text-white/70 truncate font-medium">
                                {client.name}
                              </p>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditTask(task);
                          }}
                          className="p-1.5 hover:bg-white/20 rounded-lg transition-all duration-200 flex-shrink-0 hover:scale-110"
                          title="Editar oportunidade"
                        >
                          <Edit className="h-3.5 w-3.5 text-white/70 hover:text-white" />
                        </button>
                      </div>

                      {/* Informações Compactas */}
                      <div className="space-y-2">
                        {/* Datas */}
                        {task.travelDates && task.travelDates.departure && (
                          <div className="flex items-center text-xs text-white/70 bg-white/5 rounded-lg px-2 py-1.5">
                            <Calendar className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-blue-400" />
                            <span className="truncate font-medium">
                              {formatDate(task.travelDates.departure)}
                              {task.travelDates.return && ` - ${formatDate(task.travelDates.return)}`}
                            </span>
                          </div>
                        )}

                        {/* Viajantes */}
                        {task.travelers && (
                          <div className="flex items-center text-xs text-white/70 bg-white/5 rounded-lg px-2 py-1.5">
                            <Users className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-purple-400" />
                            <span className="truncate font-medium">
                              {task.travelers.adults} adulto{task.travelers.adults !== 1 ? 's' : ''}
                              {task.travelers.children > 0 && `, ${task.travelers.children} criança${task.travelers.children !== 1 ? 's' : ''}`}
                            </span>
                          </div>
                        )}

                        {/* Orçamento */}
                        {task.budget && task.budget.disclosed && (
                          <div className="flex items-center text-xs text-green-300 bg-green-500/10 rounded-lg px-2 py-1.5 border border-green-500/20">
                            <DollarSign className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-green-400" />
                            <span className="truncate font-semibold">
                              {task.budget.min && task.budget.max 
                                ? `${formatCurrency(task.budget.min)} - ${formatCurrency(task.budget.max)}`
                                : task.expectedValue 
                                  ? `Esperado: ${formatCurrency(task.expectedValue)}`
                                  : 'Orçamento definido'
                              }
                            </span>
                          </div>
                        )}

                        {/* Interesses */}
                        {task.interests && task.interests.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {task.interests.slice(0, 2).map((interest, index) => {
                              const getInterestIcon = (interest: string) => {
                                const lowerInterest = interest.toLowerCase();
                                if (lowerInterest.includes('aventura') || lowerInterest.includes('esporte')) return <Zap className="h-3 w-3" />;
                                if (lowerInterest.includes('cultura') || lowerInterest.includes('história')) return <Camera className="h-3 w-3" />;
                                if (lowerInterest.includes('natureza') || lowerInterest.includes('paisagem')) return <Heart className="h-3 w-3" />;
                                if (lowerInterest.includes('gastronomia') || lowerInterest.includes('comida')) return <Star className="h-3 w-3" />;
                                return <Target className="h-3 w-3" />;
                              };
                              
                              return (
                                <span key={index} className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 text-xs px-2 py-1.5 rounded-full border border-indigo-500/30 flex items-center gap-1 font-medium">
                                  {getInterestIcon(interest)}
                                  {interest}
                                </span>
                              );
                            })}
                            {task.interests.length > 2 && (
                              <span className="bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-300 text-xs px-2 py-1.5 rounded-full border border-gray-500/30 flex items-center gap-1 font-medium">
                                <Star className="h-3 w-3" />
                                +{task.interests.length - 2}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Próxima ação */}
                        {task.nextAction && !task.nextAction.completed && (
                          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 p-2 rounded-lg text-xs">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                              <div className="font-semibold text-blue-300 truncate">
                                {task.nextAction.description}
                              </div>
                            </div>
                            <div className="text-blue-400 text-xs font-medium ml-5">
                              {formatDate(task.nextAction.dueDate)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer do Card */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          task.priority === 'alta' ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 border border-red-500/30' :
                          task.priority === 'media' ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border border-yellow-500/30' :
                          'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-300 border border-gray-500/30'
                        }`}>
                          {priorityConfig[task.priority as keyof typeof priorityConfig].label}
                        </span>
                        <div className="text-xs text-white/60 font-medium">
                          {formatDate(task.updatedAt)}
                        </div>
                      </div>

                      {/* Botão Avançar */}
                      {status !== 'fechado' && status !== 'perdido' && (
                        <div className="mt-3">
                          <button
                            className="w-full text-xs bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 px-3 py-2 rounded-lg hover:from-indigo-500/30 hover:to-purple-500/30 hover:border-indigo-500/50 transition-all duration-200 flex items-center justify-center gap-2 font-semibold hover:scale-[1.02]"
                            onClick={() => {
                              const statusOrder = ['prospeccao', 'qualificacao', 'consultoria', 'proposta', 'negociacao', 'fechado'];
                              const currentIndex = statusOrder.indexOf(task.status);
                              if (currentIndex < statusOrder.length - 1) {
                                const nextStatus = statusOrder[currentIndex + 1] as KanbanTask['status'];
                                moveTask(task.id, nextStatus);
                              }
                            }}
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                            Avançar
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Botão para adicionar nova tarefa */}
                <button
                  className="w-full h-10 border-2 border-dashed border-white/30 hover:border-white/50 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-all flex items-center justify-center text-xs"
                  onClick={onNewTask}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar
                </button>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* Modal de Configuração da Coluna */}
      <Dialog open={showColumnConfig} onOpenChange={setShowColumnConfig}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Configurar Coluna</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="columnTitle" className="text-white/70">Título da Coluna</Label>
              <Input
                id="columnTitle"
                value={columnConfig.title}
                onChange={(e) => setColumnConfig(prev => ({ ...prev, title: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Ex: Nova Etapa"
              />
            </div>
            <div>
              <Label htmlFor="columnSubtitle" className="text-white/70">Subtítulo da Coluna</Label>
              <Input
                id="columnSubtitle"
                value={columnConfig.subtitle}
                onChange={(e) => setColumnConfig(prev => ({ ...prev, subtitle: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Ex: Descrição da etapa"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleCancelColumnConfig}
                variant="outline"
                className="bg-gray-600 border-gray-500 text-white hover:bg-gray-700 hover:border-gray-400 flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveColumnConfig}
                className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1"
              >
                Salvar Configurações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
