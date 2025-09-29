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
  TrendingUp,
  Phone,
  Mail,
  Settings,
  GripVertical,
  CheckCircle,
  Package,
  Truck,
  Home,
  Heart
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStackAuth } from '@/lib/contexts/StackAuthContext-approval';

// Interface para tarefas de entrega
interface DeliveryTask {
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
}

interface DeliveryKanbanBoardProps {
  onNewTask: () => void;
  onEditTask: (task: DeliveryTask) => void;
  onDeleteTask?: (taskId: string) => void;
  customColumns?: {[key: string]: {title: string, subtitle: string, color: string}};
  onUpdateCustomColumn?: (columnId: string, data: {title: string, subtitle: string, color: string}) => void;
  onDeleteCustomColumn?: (columnId: string) => void;
}

const statusConfig = {
  confirmado: {
    title: 'Pagamento Confirmado',
    subtitle: 'Aguardando planejamento',
    icon: <CheckCircle className="h-4 w-4 text-green-400" />,
    color: 'border-green-500/30 bg-green-500/5'
  },
  planejamento: {
    title: 'Planejamento',
    subtitle: 'Organizando detalhes',
    icon: <Calendar className="h-4 w-4 text-blue-400" />,
    color: 'border-blue-500/30 bg-blue-500/5'
  },
  preparacao: {
    title: 'Preparação',
    subtitle: 'Montando experiência',
    icon: <Package className="h-4 w-4 text-yellow-400" />,
    color: 'border-yellow-500/30 bg-yellow-500/5'
  },
  execucao: {
    title: 'Em Execução',
    subtitle: 'Experiência em andamento',
    icon: <Truck className="h-4 w-4 text-orange-400" />,
    color: 'border-orange-500/30 bg-orange-500/5'
  },
  concluido: {
    title: 'Concluído',
    subtitle: 'Experiência finalizada',
    icon: <CheckCircle className="h-4 w-4 text-green-400" />,
    color: 'border-green-500/30 bg-green-500/5'
  },
  'pos-venda': {
    title: 'Pós-Venda',
    subtitle: 'Acompanhamento',
    icon: <Heart className="h-4 w-4 text-purple-400" />,
    color: 'border-purple-500/30 bg-purple-500/5'
  }
};

// Dados mockados para demonstração
const mockDeliveryTasks: DeliveryTask[] = [
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
    notes: 'Cliente VIP - Atendimento especial',
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
    paymentDate: '2024-01-12',
    startDate: '2024-01-25',
    endDate: '2024-01-27',
    travelers: 2,
    destination: 'El Calafate, Argentina',
    assignedTo: 'Amanda',
    notes: 'Reservas em restaurantes Michelin',
    createdAt: '2024-01-08',
    updatedAt: '2024-01-12'
  },
  {
    id: '3',
    clientName: 'Grupo Empresarial ABC',
    service: 'Retiro Corporativo na Patagônia',
    value: 25000,
    status: 'execucao',
    priority: 'alta',
    paymentDate: '2024-01-05',
    startDate: '2024-01-20',
    endDate: '2024-01-24',
    travelers: 12,
    destination: 'Ushuaia, Argentina',
    assignedTo: 'Vitor',
    notes: 'Evento corporativo - 12 executivos',
    createdAt: '2024-01-02',
    updatedAt: '2024-01-20'
  },
  {
    id: '4',
    clientName: 'Maria Santos',
    service: 'Tour Fotográfico Privado',
    value: 3200,
    status: 'concluido',
    priority: 'baixa',
    paymentDate: '2024-01-01',
    startDate: '2024-01-10',
    endDate: '2024-01-12',
    travelers: 1,
    destination: 'Torres del Paine, Chile',
    assignedTo: 'Kyra',
    notes: 'Fotógrafa profissional - Tour personalizado',
    createdAt: '2023-12-28',
    updatedAt: '2024-01-12'
  }
];

export function DeliveryKanbanBoard({ onNewTask, onEditTask, onDeleteTask, customColumns = {}, onUpdateCustomColumn, onDeleteCustomColumn }: DeliveryKanbanBoardProps) {
  const { user } = useStackAuth();
  const [tasks, setTasks] = useState<DeliveryTask[]>(mockDeliveryTasks);
  const [draggedTask, setDraggedTask] = useState<DeliveryTask | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [columnOrder, setColumnOrder] = useState<(DeliveryTask['status'] | string)[]>([
    'confirmado', 'planejamento', 'preparacao', 'execucao', 'concluido', 'pos-venda'
  ]);
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  const [editingColumn, setEditingColumn] = useState<DeliveryTask['status'] | null>(null);
  const [columnConfig, setColumnConfig] = useState({
    title: '',
    subtitle: ''
  });
  // Estado para armazenar configurações personalizadas das colunas padrão
  const [customColumnConfigs, setCustomColumnConfigs] = useState<{[key: string]: {title: string, subtitle: string}}>({});
  // Atualizar a ordem das colunas quando novas colunas customizadas são adicionadas
  useEffect(() => {
    const customColumnIds = Object.keys(customColumns);
    if (customColumnIds.length > 0) {
      setColumnOrder(prev => {
        const existingCustom = prev.filter(col => col.startsWith('custom_'));
        const newCustom = customColumnIds.filter(id => !existingCustom.includes(id));
        return [...prev.filter(col => !col.startsWith('custom_')), ...newCustom];
      });
    }
  }, [customColumns]);

  const handleDragStart = (e: React.DragEvent, task: DeliveryTask) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
    
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

  const handleDrop = (e: React.DragEvent, newStatus: DeliveryTask['status']) => {
    e.preventDefault();
    
    // Remover efeito visual
    const target = e.currentTarget as HTMLElement;
    const column = target.querySelector('.column-header') as HTMLElement;
    if (column) {
      column.style.backgroundColor = '';
      column.style.borderRadius = '';
    }
    
    if (draggedTask && draggedTask.status !== newStatus) {
      setTasks(prev => prev.map(task => 
        task.id === draggedTask.id 
          ? { ...task, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }
          : task
      ));
      
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

  // Funções para drag and drop de colunas
  const handleColumnDragStart = (e: React.DragEvent, columnStatus: DeliveryTask['status']) => {
    setDraggedColumn(columnStatus);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', columnStatus);
  };

  const handleColumnDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleColumnDrop = (e: React.DragEvent, targetColumn: DeliveryTask['status']) => {
    e.preventDefault();
    
    if (draggedColumn && draggedColumn !== targetColumn) {
      const newOrder = [...columnOrder];
      const draggedIndex = newOrder.indexOf(draggedColumn as DeliveryTask['status']);
      const targetIndex = newOrder.indexOf(targetColumn);
      
      // Trocar posições
      if (draggedIndex !== -1 && targetIndex !== -1) {
        newOrder[draggedIndex] = targetColumn;
        newOrder[targetIndex] = draggedColumn as DeliveryTask['status'];
      }
      
      setColumnOrder(newOrder);
    }
    setDraggedColumn(null);
  };

  const handleColumnDragEnd = () => {
    setDraggedColumn(null);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Tem certeza que deseja excluir esta entrega?')) {
      if (onDeleteTask) {
        onDeleteTask(taskId);
      } else {
        setTasks(prev => prev.filter(task => task.id !== taskId));
      }
    }
  };

  const handleEditColumn = (columnStatus: string) => {
    const isCustomColumn = columnStatus.startsWith('custom_');
    const config = isCustomColumn ? customColumns[columnStatus] : statusConfig[columnStatus as DeliveryTask['status']];
    
    if (isCustomColumn && !config) {
      alert('Coluna customizada não encontrada.');
      return;
    }
    
    setEditingColumn(columnStatus as DeliveryTask['status']);
    
    // Para colunas padrão, verificar se há configuração personalizada salva
    if (!isCustomColumn && customColumnConfigs[columnStatus]) {
      setColumnConfig({
        title: customColumnConfigs[columnStatus].title,
        subtitle: customColumnConfigs[columnStatus].subtitle
      });
    } else {
      setColumnConfig({
        title: config?.title || '',
        subtitle: config?.subtitle || ''
      });
    }
    setShowColumnConfig(true);
  };

  const handleSaveColumnConfig = () => {
    if (editingColumn) {
      const isCustomColumn = editingColumn.startsWith('custom_');
      
      if (isCustomColumn && onUpdateCustomColumn) {
        // Para colunas customizadas, notificar o componente pai
        onUpdateCustomColumn(editingColumn, {
          title: columnConfig.title,
          subtitle: columnConfig.subtitle,
          color: customColumns[editingColumn]?.color || 'blue'
        });
        alert(`Configurações da coluna "${columnConfig.title}" salvas com sucesso!`);
      } else if (!isCustomColumn) {
        // Para colunas padrão, salvar no estado local
        setCustomColumnConfigs(prev => ({
          ...prev,
          [editingColumn]: {
            title: columnConfig.title,
            subtitle: columnConfig.subtitle
          }
        }));
        alert(`Configurações da coluna "${columnConfig.title}" salvas com sucesso!`);
      } else {
        alert('Erro: Função de atualização não disponível para colunas customizadas.');
      }
      
      setShowColumnConfig(false);
      setEditingColumn(null);
    }
  };

  const handleCancelColumnConfig = () => {
    setShowColumnConfig(false);
    setEditingColumn(null);
    setColumnConfig({ title: '', subtitle: '' });
  };

  const handleDeleteColumn = (columnStatus: string) => {
    const isCustomColumn = columnStatus.startsWith('custom_');
    const config = isCustomColumn ? customColumns[columnStatus] : statusConfig[columnStatus as DeliveryTask['status']];
    
    if (isCustomColumn && !config) {
      alert('Coluna customizada não encontrada.');
      return;
    }
    
    const columnName = config?.title || 'Coluna';
    
    if (confirm(`Tem certeza que deseja excluir a coluna "${columnName}"? Esta ação não pode ser desfeita.`)) {
      if (isCustomColumn) {
        // Para colunas customizadas, remover da ordem e notificar o pai
        setColumnOrder(prev => prev.filter(col => col !== columnStatus));
        
        // Notificar o componente pai para remover a coluna customizada
        if (onDeleteCustomColumn) {
          onDeleteCustomColumn(columnStatus);
        }
        
        alert(`Coluna customizada "${columnName}" excluída com sucesso!`);
      } else {
        // Para colunas padrão, remover da ordem
        setColumnOrder(prev => prev.filter(col => col !== columnStatus));
        alert(`Coluna "${columnName}" excluída com sucesso!`);
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const getTotalValue = (status: string) => {
    return getTasksByStatus(status).reduce((total, task) => total + task.value, 0);
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
            // Para colunas padrão, verificar se há configuração personalizada
            const defaultConfig = statusConfig[status as DeliveryTask['status']];
            const customConfig = customColumnConfigs[status];
            
            config = {
              ...defaultConfig,
              title: customConfig?.title || defaultConfig?.title || '',
              subtitle: customConfig?.subtitle || defaultConfig?.subtitle || ''
            };
          }
          
          const statusTasks = isCustomColumn ? [] : getTasksByStatus(status);
          const totalValue = isCustomColumn ? 0 : getTotalValue(status);
          
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
                if (!status.startsWith('custom_')) {
                  handleDrop(e, status as DeliveryTask['status']);
                }
                handleColumnDrop(e, status as DeliveryTask['status']);
              }}
              draggable
              onDragStart={(e) => handleColumnDragStart(e, status as DeliveryTask['status'])}
              onDragEnd={handleColumnDragEnd}
            >
              {/* Header da Coluna */}
              <div className="mb-4 flex-shrink-0 column-header">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-white/40 cursor-move" />
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
                  <div className="text-xs text-white/60">
                    Valor total
                  </div>
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
                  return (
                    <div
                      key={task.id}
                      className="cursor-move hover:shadow-xl transition-all duration-200 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-3 hover:bg-white/15 hover:border-white/30 hover:scale-[1.02] select-none touch-manipulation"
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                    >
                      {/* Header do Card */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="h-3 w-3 text-indigo-400 flex-shrink-0" />
                            <span className="text-xs text-indigo-300 font-medium truncate">
                              {task.destination}
                            </span>
                          </div>
                          <h4 className="font-semibold text-white text-sm mb-1 truncate">
                            {task.clientName}
                          </h4>
                          <p className="text-xs text-white/70 truncate">
                            {task.service}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditTask(task);
                          }}
                          className="p-1.5 hover:bg-white/20 rounded-lg transition-all duration-200 flex-shrink-0 hover:scale-110"
                          title="Editar entrega"
                        >
                          <Edit className="h-3.5 w-3.5 text-white/70 hover:text-white" />
                        </button>
                      </div>

                      {/* Informações Compactas */}
                      <div className="space-y-2">
                        {/* Datas */}
                        <div className="flex items-center text-xs text-white/70 bg-white/5 rounded-lg px-2 py-1.5">
                          <Calendar className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-blue-400" />
                          <span className="truncate font-medium">
                            {task.startDate} - {task.endDate}
                          </span>
                        </div>

                        {/* Viajantes */}
                        <div className="flex items-center text-xs text-white/70 bg-white/5 rounded-lg px-2 py-1.5">
                          <Users className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-purple-400" />
                          <span className="truncate font-medium">
                            {task.travelers} pessoa{task.travelers !== 1 ? 's' : ''}
                          </span>
                        </div>

                        {/* Valor */}
                        <div className="flex items-center text-xs text-green-300 bg-green-500/10 rounded-lg px-2 py-1.5 border border-green-500/20">
                          <DollarSign className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-green-400" />
                          <span className="truncate font-semibold">
                            {formatCurrency(task.value)}
                          </span>
                        </div>

                        {/* Responsável */}
                        <div className="flex items-center text-xs text-white/70 bg-white/5 rounded-lg px-2 py-1.5">
                          <User className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-orange-400" />
                          <span className="truncate font-medium">
                            {task.assignedTo}
                          </span>
                        </div>

                        {/* Prioridade */}
                        <div className="flex items-center justify-between">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.priority === 'alta' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                            task.priority === 'media' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                            'bg-green-500/20 text-green-300 border border-green-500/30'
                          }`}>
                            {task.priority.toUpperCase()}
                          </div>
                          <div className="flex items-center gap-1">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white/60 hover:text-white">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditTask(task);
                                  }}
                                  className="text-white hover:bg-gray-700"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTask(task.id);
                                  }}
                                  className="text-red-400 hover:bg-red-500/10"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* Modal de Configuração da Coluna */}
      <Dialog open={showColumnConfig} onOpenChange={setShowColumnConfig}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              Configurar Coluna - {editingColumn && statusConfig[editingColumn]?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="column-title" className="text-white/70">
                Título da Coluna
              </Label>
              <Input
                id="column-title"
                value={columnConfig.title}
                onChange={(e) => setColumnConfig(prev => ({ ...prev, title: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Digite o título da coluna"
              />
            </div>
            <div>
              <Label htmlFor="column-subtitle" className="text-white/70">
                Subtítulo da Coluna
              </Label>
              <Input
                id="column-subtitle"
                value={columnConfig.subtitle}
                onChange={(e) => setColumnConfig(prev => ({ ...prev, subtitle: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Digite o subtítulo da coluna"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSaveColumnConfig}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Salvar Configurações
              </Button>
              <Button
                onClick={handleCancelColumnConfig}
                variant="outline"
                className="bg-gray-600 border-gray-500 text-white hover:bg-gray-700 hover:border-gray-400"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
