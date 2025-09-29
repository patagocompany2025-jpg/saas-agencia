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
  Heart,
  ThumbsUp,
  Gift,
  Award,
  AlertCircle
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

// Interface para tarefas de pós-venda
interface PostSaleTask {
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
}

interface PostSaleKanbanBoardProps {
  onNewTask: () => void;
  onEditTask: (task: PostSaleTask) => void;
  customColumns?: {[key: string]: {title: string, subtitle: string, color: string}};
  onUpdateCustomColumn?: (columnId: string, data: {title: string, subtitle: string, color: string}) => void;
  onDeleteCustomColumn?: (columnId: string) => void;
}

const statusConfig = {
  aguardando: {
    title: 'Aguardando Feedback',
    subtitle: 'Aguardando retorno do cliente',
    icon: <Clock className="h-4 w-4 text-yellow-400" />,
    color: 'border-yellow-500/30 bg-yellow-500/5'
  },
  contato: {
    title: 'Em Contato',
    subtitle: 'Seguindo com o cliente',
    icon: <Phone className="h-4 w-4 text-blue-400" />,
    color: 'border-blue-500/30 bg-blue-500/5'
  },
  satisfeito: {
    title: 'Cliente Satisfeito',
    subtitle: 'Feedback positivo recebido',
    icon: <ThumbsUp className="h-4 w-4 text-green-400" />,
    color: 'border-green-500/30 bg-green-500/5'
  },
  reclamacao: {
    title: 'Reclamação',
    subtitle: 'Problema reportado',
    icon: <AlertCircle className="h-4 w-4 text-red-400" />,
    color: 'border-red-500/30 bg-red-500/5'
  },
  fidelizado: {
    title: 'Cliente Fidelizado',
    subtitle: 'Cliente retornou',
    icon: <Heart className="h-4 w-4 text-purple-400" />,
    color: 'border-purple-500/30 bg-purple-500/5'
  },
  indicacao: {
    title: 'Indicação Recebida',
    subtitle: 'Cliente indicou outros',
    icon: <Gift className="h-4 w-4 text-emerald-400" />,
    color: 'border-emerald-500/30 bg-emerald-500/5'
  }
};

// Dados mockados para demonstração
const mockPostSaleTasks: PostSaleTask[] = [
  {
    id: '1',
    clientName: 'Família Silva',
    service: 'Pacote Concierge Bariloche - 7 dias',
    value: 15000,
    status: 'satisfeito',
    completionDate: '2024-02-07',
    feedbackDate: '2024-02-10',
    satisfaction: 5,
    feedback: 'Experiência incrível! Superou todas as expectativas. Recomendamos para todos os amigos.',
    nextContact: '2024-03-07',
    assignedTo: 'Alexandre',
    priority: 'media',
    notes: 'Cliente muito satisfeito - possível indicação',
    createdAt: '2024-02-07',
    updatedAt: '2024-02-10'
  },
  {
    id: '2',
    clientName: 'Casal Johnson',
    service: 'Experiência Gastronômica Premium',
    value: 8500,
    status: 'contato',
    completionDate: '2024-01-27',
    feedbackDate: undefined,
    satisfaction: undefined,
    feedback: undefined,
    nextContact: '2024-02-03',
    assignedTo: 'Amanda',
    priority: 'alta',
    notes: 'Ligar para verificar satisfação',
    createdAt: '2024-01-27',
    updatedAt: '2024-01-30'
  },
  {
    id: '3',
    clientName: 'Grupo Empresarial ABC',
    service: 'Retiro Corporativo na Patagônia',
    value: 25000,
    status: 'fidelizado',
    completionDate: '2024-01-24',
    feedbackDate: '2024-01-28',
    satisfaction: 5,
    feedback: 'Excelente organização! Já queremos repetir no próximo ano.',
    nextContact: '2024-06-24',
    assignedTo: 'Vitor',
    priority: 'alta',
    notes: 'Cliente fidelizado - agendar próximo evento',
    createdAt: '2024-01-24',
    updatedAt: '2024-01-28'
  },
  {
    id: '4',
    clientName: 'Maria Santos',
    service: 'Tour Fotográfico Privado',
    value: 3200,
    status: 'indicacao',
    completionDate: '2024-01-12',
    feedbackDate: '2024-01-15',
    satisfaction: 5,
    feedback: 'Fotos lindas! Já indiquei para 3 amigas.',
    nextContact: '2024-04-12',
    assignedTo: 'Kyra',
    priority: 'baixa',
    notes: 'Recebeu 3 indicações - acompanhar conversões',
    createdAt: '2024-01-12',
    updatedAt: '2024-01-15'
  },
  {
    id: '5',
    clientName: 'João Oliveira',
    service: 'Aventura na Patagônia',
    value: 12000,
    status: 'reclamacao',
    completionDate: '2024-01-20',
    feedbackDate: '2024-01-22',
    satisfaction: 2,
    feedback: 'O guia não estava preparado e o tempo estava ruim. Esperava mais.',
    nextContact: '2024-01-25',
    assignedTo: 'Alex',
    priority: 'alta',
    notes: 'Reclamação sobre guia e clima - oferecer desconto',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-22'
  }
];

export function PostSaleKanbanBoard({ onNewTask, onEditTask, customColumns = {}, onUpdateCustomColumn, onDeleteCustomColumn }: PostSaleKanbanBoardProps) {
  const { user } = useStackAuth();
  const [tasks, setTasks] = useState<PostSaleTask[]>([]);
qy  const [isInitialized, setIsInitialized] = useState(false);
  const [draggedTask, setDraggedTask] = useState<PostSaleTask | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [columnOrder, setColumnOrder] = useState<(PostSaleTask['status'] | string)[]>([
    'aguardando', 'contato', 'satisfeito', 'reclamacao', 'fidelizado', 'indicacao'
  ]);
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  const [editingColumn, setEditingColumn] = useState<PostSaleTask['status'] | null>(null);
  const [columnConfig, setColumnConfig] = useState({
    title: '',
    subtitle: ''
  });
  // Estado para armazenar configurações personalizadas das colunas padrão
  const [customColumnConfigs, setCustomColumnConfigs] = useState<{[key: string]: {title: string, subtitle: string}}>({});
  
  // Carregar tarefas e tarefas excluídas do localStorage
  useEffect(() => {
    console.log('🔄 INICIALIZANDO POST SALE KANBAN BOARD');

    // Carregar tarefas do localStorage
    const savedTasks = localStorage.getItem('postSaleTasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        console.log('📋 TAREFAS PÓS-VENDA CARREGADAS DO LOCALSTORAGE:', parsedTasks.length);
        setTasks(parsedTasks);
      } catch (error) {
        console.error('Erro ao carregar tarefas pós-venda:', error);
        console.log('📋 ERRO NO PARSE - INICIANDO COM ARRAY VAZIO');
        setTasks([]);
      }
    } else {
      // Verificar se o usuário já interagiu com o sistema
      const hasUserInteracted = localStorage.getItem('postSaleUserInteracted');
      if (hasUserInteracted) {
        console.log('📋 USUÁRIO JÁ INTERAGIU - INICIANDO COM ARRAY VAZIO');
        setTasks([]);
      } else {
        console.log('📋 PRIMEIRA VEZ - USANDO TAREFAS PÓS-VENDA MOCK');
        setTasks(mockPostSaleTasks);
        // Salvar tarefas mock no localStorage
        localStorage.setItem('postSaleTasks', JSON.stringify(mockPostSaleTasks));
        // Marcar que o usuário interagiu
        localStorage.setItem('postSaleUserInteracted', 'true');
      }
    }
    
    // Marcar como inicializado
    setIsInitialized(true);
  }, []);

  // useEffect automático para salvar tarefas no localStorage (igual ao KanbanContext)
  useEffect(() => {
    // Só salva depois da inicialização
    if (!isInitialized) return;
    
    console.log('💾 SALVANDO TAREFAS PÓS-VENDA AUTOMATICAMENTE:', tasks.length);
    localStorage.setItem('postSaleTasks', JSON.stringify(tasks));
  }, [tasks, isInitialized]);

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

  const handleDragStart = (e: React.DragEvent, task: PostSaleTask) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: PostSaleTask['status']) => {
    e.preventDefault();
    
    if (draggedTask && draggedTask.status !== newStatus) {
      setTasks(prev => prev.map(task => 
        task.id === draggedTask.id 
          ? { ...task, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }
          : task
      ));
    }
    
    setDraggedTask(null);
  };

  // Funções para drag and drop de colunas
  const handleColumnDragStart = (e: React.DragEvent, columnStatus: PostSaleTask['status']) => {
    setDraggedColumn(columnStatus);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColumnDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleColumnDrop = (e: React.DragEvent, targetColumn: PostSaleTask['status']) => {
    e.preventDefault();
    
    if (draggedColumn && draggedColumn !== targetColumn) {
      const newOrder = [...columnOrder];
      const draggedIndex = newOrder.indexOf(draggedColumn as PostSaleTask['status']);
      const targetIndex = newOrder.indexOf(targetColumn);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        newOrder[draggedIndex] = targetColumn;
        newOrder[targetIndex] = draggedColumn as PostSaleTask['status'];
      }
      
      setColumnOrder(newOrder);
    }
    
    setDraggedColumn(null);
  };

  const handleColumnDragEnd = () => {
    setDraggedColumn(null);
  };

  const handleDeleteTask = (taskId: string) => {
    console.log('🗑️ HANDLE DELETE POST SALE TASK CHAMADO:', taskId);
    
    if (confirm('Tem certeza que deseja excluir esta atividade de pós-venda?')) {
      console.log('🗑️ CONFIRMAÇÃO ACEITA - EXCLUINDO POST SALE TASK:', taskId);
      
      // Remover da lista de tarefas (useEffect automático salvará)
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      console.log('🗑️ POST SALE TASK EXCLUÍDA - useEffect automático salvará');
    } else {
      console.log('🗑️ EXCLUSÃO PÓS-VENDA CANCELADA');
    }
  };

  const handleEditColumn = (columnStatus: string) => {
    const isCustomColumn = columnStatus.startsWith('custom_');
    const config = isCustomColumn ? customColumns[columnStatus] : statusConfig[columnStatus as PostSaleTask['status']];
    
    if (isCustomColumn && !config) {
      alert('Coluna customizada não encontrada.');
      return;
    }
    
    setEditingColumn(columnStatus as PostSaleTask['status']);
    
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
    const config = isCustomColumn ? customColumns[columnStatus] : statusConfig[columnStatus as PostSaleTask['status']];
    
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
    const filteredTasks = tasks.filter(task => task.status === status);
    
    console.log(`📊 GET POST SALE TASKS BY STATUS (${status}):`);
    console.log(`  - Total tasks: ${tasks.length}`);
    console.log(`  - Tasks for status: ${filteredTasks.length}`);
    console.log(`  - Task IDs: ${filteredTasks.map(t => t.id)}`);
    
    return filteredTasks;
  };

  const getTotalValue = (status: string) => {
    return getTasksByStatus(status).reduce((total, task) => total + task.value, 0);
  };


  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-white/40">Sem avaliação</span>;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-white/30'
            }`}
          />
        ))}
        <span className="text-white/70 text-xs ml-1">{rating}/5</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Board Kanban - Layout Horizontal */}
      <div className="kanban-scroll">
        <div className="flex gap-6 overflow-x-auto pb-4">
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
              const defaultConfig = statusConfig[status as PostSaleTask['status']];
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
                    ? 'border-indigo-400 bg-indigo-500/10' 
                    : 'hover:bg-white/10'
                } ${
                  draggedColumn === status ? 'opacity-50 scale-95' : ''
                }`}
                onDragOver={(e) => {
                  handleDragOver(e);
                  handleColumnDragOver(e);
                }}
                onDragLeave={handleDragLeave}
                onDrop={(e) => {
                  if (!status.startsWith('custom_')) {
                    handleDrop(e, status as PostSaleTask['status']);
                  }
                  handleColumnDrop(e, status as PostSaleTask['status']);
                }}
                draggable
                onDragStart={(e) => handleColumnDragStart(e, status as PostSaleTask['status'])}
                onDragEnd={handleColumnDragEnd}
              >
                {/* Header da Coluna */}
                <div className="mb-4 flex-shrink-0 column-header">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-white/40 cursor-move" />
                      <div className={`p-2 rounded-lg ${config.color}`}>
                        {config.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-sm">{config.title}</h3>
                        <p className="text-xs text-white/60">{config.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full">
                        {statusTasks.length}
                      </span>
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
                  
                  {/* Total da Coluna */}
                  <div className="flex items-center justify-between text-xs text-white/70 mb-3">
                    <span>Total: {formatCurrency(totalValue)}</span>
                    <span>{statusTasks.length} atividade{statusTasks.length !== 1 ? 's' : ''}</span>
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
                              <MapPin className="h-3 w-3 text-pink-400 flex-shrink-0" />
                              <span className="text-xs text-pink-300 font-medium truncate">
                                {task.service}
                              </span>
                            </div>
                            <h4 className="font-semibold text-white text-sm mb-1 truncate">
                              {task.clientName}
                            </h4>
                            <p className="text-xs text-white/70 truncate">
                              Concluído em: {task.completionDate}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditTask(task);
                            }}
                            className="p-1.5 hover:bg-white/20 rounded-lg transition-all duration-200 flex-shrink-0 hover:scale-110"
                            title="Editar pós-venda"
                          >
                            <Edit className="h-3.5 w-3.5 text-white/70 hover:text-white" />
                          </button>
                        </div>

                        {/* Informações Compactas */}
                        <div className="space-y-2">
                          {/* Avaliação */}
                          {task.satisfaction && (
                            <div className="flex items-center text-xs text-white/70 bg-white/5 rounded-lg px-2 py-1.5">
                              <Star className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-yellow-400" />
                              <span className="truncate font-medium">
                                {renderStars(task.satisfaction)}
                              </span>
                            </div>
                          )}

                          {/* Feedback */}
                          {task.feedback && (
                            <div className="bg-white/5 rounded-lg p-2">
                              <div className="text-white/70 text-xs mb-1">Feedback:</div>
                              <div className="text-white text-xs italic line-clamp-2">&ldquo;{task.feedback}&rdquo;</div>
                            </div>
                          )}

                          {/* Valor */}
                          <div className="flex items-center text-xs text-green-300 bg-green-500/10 rounded-lg px-2 py-1.5 border border-green-500/20">
                            <DollarSign className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-green-400" />
                            <span className="truncate font-semibold">
                              {formatCurrency(task.value)}
                            </span>
                          </div>

                          {/* Responsável */}
                          <div className="flex items-center text-xs text-white/70 bg-white/5 rounded-lg px-2 py-1.5">
                            <User className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-pink-400" />
                            <span className="truncate font-medium">
                              {task.assignedTo}
                            </span>
                          </div>

                          {/* Próximo Contato */}
                          <div className="flex items-center text-xs text-white/70 bg-white/5 rounded-lg px-2 py-1.5">
                            <Calendar className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-blue-400" />
                            <span className="truncate font-medium">
                              Próximo: {task.nextContact}
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

                {/* Botão Adicionar Tarefa */}
                <div className="mt-4 flex-shrink-0">
                  <Button
                    onClick={onNewTask}
                    variant="outline"
                    className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Atividade
                  </Button>
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
                className="bg-pink-600 hover:bg-pink-700 text-white flex-1"
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
