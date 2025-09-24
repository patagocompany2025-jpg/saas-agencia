'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Star, 
  MapPin, 
  Calendar, 
  Users, 
  Phone, 
  Mail,
  Plus,
  Edit,
  Trash2,
  ArrowRight,
  Package,
  Truck,
  Home,
  Heart,
  Target,
  DollarSign,
  User,
  Settings,
  Eye,
  FileText,
  MessageSquare,
  Bell,
  Filter,
  Search,
  Save,
  X,
  GripVertical,
  ArrowUp,
  ArrowDown,
  PlusCircle
} from 'lucide-react';
import Link from 'next/link';

// Componente para editar etapas
const StageEditForm = ({ stageKey, stage, onSave, onCancel }: any) => {
  const [formData, setFormData] = useState({
    name: stage.name,
    description: stage.description,
    color: stage.color,
    icon: stage.icon
  });

  const handleSave = () => {
    onSave(stageKey, formData);
  };

  const colorOptions = [
    { value: 'bg-blue-500', label: 'Azul', color: 'bg-blue-500' },
    { value: 'bg-yellow-500', label: 'Amarelo', color: 'bg-yellow-500' },
    { value: 'bg-purple-500', label: 'Roxo', color: 'bg-purple-500' },
    { value: 'bg-indigo-500', label: 'Índigo', color: 'bg-indigo-500' },
    { value: 'bg-orange-500', label: 'Laranja', color: 'bg-orange-500' },
    { value: 'bg-green-500', label: 'Verde', color: 'bg-green-500' },
    { value: 'bg-red-500', label: 'Vermelho', color: 'bg-red-500' },
    { value: 'bg-pink-500', label: 'Rosa', color: 'bg-pink-500' }
  ];

  const iconOptions = [
    { value: 'CheckCircle', label: 'Check' },
    { value: 'Calendar', label: 'Calendário' },
    { value: 'Package', label: 'Pacote' },
    { value: 'Truck', label: 'Caminhão' },
    { value: 'Heart', label: 'Coração' }
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="text-white/70 text-sm mb-2 block">Nome da Etapa</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2"
          placeholder="Nome da etapa"
        />
      </div>
      
      <div>
        <label className="text-white/70 text-sm mb-2 block">Descrição</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 h-20 resize-none"
          placeholder="Descrição da etapa"
        />
      </div>
      
      <div>
        <label className="text-white/70 text-sm mb-2 block">Cor</label>
        <div className="grid grid-cols-4 gap-2">
          {colorOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFormData(prev => ({ ...prev, color: option.value }))}
              className={`p-2 rounded-lg border-2 transition-all ${
                formData.color === option.value 
                  ? 'border-white' 
                  : 'border-white/20 hover:border-white/40'
              }`}
            >
              <div className={`w-6 h-6 ${option.color} rounded mx-auto`}></div>
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label className="text-white/70 text-sm mb-2 block">Ícone</label>
        <select
          value={formData.icon}
          onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
          className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2"
        >
          {iconOptions.map((option) => (
            <option key={option.value} value={option.value} className="bg-gray-800">
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex gap-2 pt-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Salvar
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancelar
        </button>
      </div>
    </div>
  );
};

// Componente para adicionar nova etapa
const NewStageForm = ({ onSave, onCancel }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'bg-blue-500',
    icon: 'CheckCircle'
  });

  const handleSave = () => {
    if (!formData.name.trim()) return;
    onSave(formData);
  };

  const colorOptions = [
    { value: 'bg-blue-500', label: 'Azul', color: 'bg-blue-500' },
    { value: 'bg-yellow-500', label: 'Amarelo', color: 'bg-yellow-500' },
    { value: 'bg-purple-500', label: 'Roxo', color: 'bg-purple-500' },
    { value: 'bg-indigo-500', label: 'Índigo', color: 'bg-indigo-500' },
    { value: 'bg-orange-500', label: 'Laranja', color: 'bg-orange-500' },
    { value: 'bg-green-500', label: 'Verde', color: 'bg-green-500' },
    { value: 'bg-red-500', label: 'Vermelho', color: 'bg-red-500' },
    { value: 'bg-pink-500', label: 'Rosa', color: 'bg-pink-500' }
  ];

  const iconOptions = [
    { value: 'CheckCircle', label: 'Check' },
    { value: 'Calendar', label: 'Calendário' },
    { value: 'Package', label: 'Pacote' },
    { value: 'Truck', label: 'Caminhão' },
    { value: 'Heart', label: 'Coração' }
  ];

  return (
    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold text-xl flex items-center gap-2">
          <PlusCircle className="w-6 h-6" />
          Nova Etapa do Pipeline
        </h3>
        <button 
          onClick={onCancel}
          className="text-white/60 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="text-white/70 text-sm mb-2 block">Nome da Etapa *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2"
            placeholder="Ex: Contrato, Execução, etc."
          />
        </div>
        
        <div>
          <label className="text-white/70 text-sm mb-2 block">Descrição</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 h-20 resize-none"
            placeholder="Descreva o que acontece nesta etapa"
          />
        </div>
        
        <div>
          <label className="text-white/70 text-sm mb-2 block">Cor</label>
          <div className="grid grid-cols-4 gap-2">
            {colorOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFormData(prev => ({ ...prev, color: option.value }))}
                className={`p-2 rounded-lg border-2 transition-all ${
                  formData.color === option.value 
                    ? 'border-white' 
                    : 'border-white/20 hover:border-white/40'
                }`}
              >
                <div className={`w-6 h-6 ${option.color} rounded mx-auto`}></div>
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="text-white/70 text-sm mb-2 block">Ícone</label>
          <select
            value={formData.icon}
            onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
            className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2"
          >
            {iconOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-gray-800">
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex gap-2 pt-4">
          <button
            onClick={handleSave}
            disabled={!formData.name.trim()}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Criar Etapa
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

// Status do fluxo de entrega otimizado
const DELIVERY_STATUS = {
  'confirmado': { 
    name: 'Pagamento Confirmado', 
    color: 'bg-green-500', 
    icon: CheckCircle,
    description: 'Pagamento recebido, liberar planejamento'
  },
  'planejamento': { 
    name: 'Planejamento', 
    color: 'bg-blue-500', 
    icon: Calendar,
    description: 'Organizando detalhes e reservas'
  },
  'preparacao': { 
    name: 'Preparação', 
    color: 'bg-yellow-500', 
    icon: Package,
    description: 'Montando pacotes e confirmando'
  },
  'execucao': { 
    name: 'Em Execução', 
    color: 'bg-orange-500', 
    icon: Truck,
    description: 'Serviço sendo prestado'
  },
  'concluido': { 
    name: 'Concluído', 
    color: 'bg-green-600', 
    icon: CheckCircle,
    description: 'Serviço finalizado com sucesso'
  },
  'pos-venda': { 
    name: 'Pós-Venda', 
    color: 'bg-purple-500', 
    icon: Heart,
    description: 'Follow-up e satisfação'
  }
};

// Dados mockados otimizados
const mockDeliveryTasks = [
  {
    id: '1',
    clientName: 'Família Silva',
    service: 'Pacote Concierge Bariloche',
    value: 15000,
    status: 'confirmado' as keyof typeof DELIVERY_STATUS,
    startDate: '2024-02-01',
    endDate: '2024-02-07',
    travelers: 4,
    destination: 'Bariloche, Argentina',
    assignedTo: 'Alexandre',
    priority: 'alta' as 'baixa' | 'media' | 'alta',
    notes: 'Cliente VIP - Atendimento especial',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
    // Informações específicas para turismo
    accommodation: 'Hotel Llao Llao',
    activities: ['Trekking', 'Gastronomia', 'Spa'],
    transport: 'Transfer privado',
    guide: 'Guia especializado',
    specialRequests: 'Dieta vegetariana, acessibilidade'
  },
  {
    id: '2',
    clientName: 'Casal Johnson',
    service: 'Experiência Gastronômica Premium',
    value: 8500,
    status: 'planejamento' as keyof typeof DELIVERY_STATUS,
    startDate: '2024-01-25',
    endDate: '2024-01-27',
    travelers: 2,
    destination: 'El Calafate, Argentina',
    assignedTo: 'Amanda',
    priority: 'media' as 'baixa' | 'media' | 'alta',
    notes: 'Reservas em restaurantes Michelin',
    createdAt: '2024-01-08',
    updatedAt: '2024-01-12',
    accommodation: 'Hotel Xelena',
    activities: ['Degustação', 'Cooking Class'],
    transport: 'Transfer compartilhado',
    guide: 'Chef local',
    specialRequests: 'Menu degustação completo'
  },
  {
    id: '3',
    clientName: 'Grupo Empresarial ABC',
    service: 'Retiro Corporativo Patagônia',
    value: 25000,
    status: 'execucao' as keyof typeof DELIVERY_STATUS,
    startDate: '2024-01-20',
    endDate: '2024-01-24',
    travelers: 12,
    destination: 'Ushuaia, Argentina',
    assignedTo: 'Vitor',
    priority: 'alta' as 'baixa' | 'media' | 'alta',
    notes: 'Evento corporativo - 12 executivos',
    createdAt: '2024-01-02',
    updatedAt: '2024-01-20',
    accommodation: 'Hotel Arakur',
    activities: ['Team Building', 'Trekking', 'Workshops'],
    transport: 'Ônibus executivo',
    guide: 'Coordenador de eventos',
    specialRequests: 'Sala de reuniões, equipamentos'
  },
  {
    id: '4',
    clientName: 'Maria Santos',
    service: 'Tour Fotográfico Privado',
    value: 3200,
    status: 'concluido' as keyof typeof DELIVERY_STATUS,
    startDate: '2024-01-10',
    endDate: '2024-01-12',
    travelers: 1,
    destination: 'Torres del Paine, Chile',
    assignedTo: 'Kyra',
    priority: 'baixa' as 'baixa' | 'media' | 'alta',
    notes: 'Fotógrafa profissional - Tour personalizado',
    createdAt: '2023-12-28',
    updatedAt: '2024-01-12',
    accommodation: 'EcoCamp',
    activities: ['Fotografia', 'Trekking', 'Wildlife'],
    transport: 'Transfer privado',
    guide: 'Fotógrafo especializado',
    specialRequests: 'Equipamentos fotográficos'
  }
];

export default function DeliveryPage() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState(mockDeliveryTasks);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showStageSettings, setShowStageSettings] = useState(false);
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [showNewStageForm, setShowNewStageForm] = useState(false);
  const [draggedStage, setDraggedStage] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [showPageSettings, setShowPageSettings] = useState(false);
  const [stageOrder, setStageOrder] = useState([
    'confirmado', 'planejamento', 'preparacao', 'execucao', 'concluido', 'pos-venda'
  ]);
  const [stageConfig, setStageConfig] = useState({
    confirmado: { name: 'Pagamento Confirmado', description: 'Pagamento recebido, liberar planejamento', color: 'bg-green-500', icon: 'CheckCircle' },
    planejamento: { name: 'Planejamento', description: 'Organizando detalhes e reservas', color: 'bg-blue-500', icon: 'Calendar' },
    preparacao: { name: 'Preparação', description: 'Montando pacotes e confirmando', color: 'bg-yellow-500', icon: 'Package' },
    execucao: { name: 'Em Execução', description: 'Serviço sendo prestado', color: 'bg-orange-500', icon: 'Truck' },
    concluido: { name: 'Concluído', description: 'Serviço finalizado com sucesso', color: 'bg-green-600', icon: 'CheckCircle' },
    'pos-venda': { name: 'Pós-Venda', description: 'Follow-up e satisfação', color: 'bg-purple-500', icon: 'Heart' }
  });

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-300">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acesso Negado</h1>
          <p className="text-gray-300">Você precisa fazer login para acessar esta página.</p>
        </div>
      </div>
    );
  }

  const moveTask = (taskId: string, newStatus: keyof typeof DELIVERY_STATUS) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] } : task
    ));
  };

  const getStatusColor = (status: keyof typeof DELIVERY_STATUS) => {
    return DELIVERY_STATUS[status].color;
  };

  const getStatusIcon = (status: keyof typeof DELIVERY_STATUS) => {
    const IconComponent = DELIVERY_STATUS[status].icon;
    return <IconComponent className="w-4 h-4" />;
  };

  const getPriorityColor = (priority: 'baixa' | 'media' | 'alta') => {
    switch (priority) {
      case 'alta': return 'bg-red-500';
      case 'media': return 'bg-yellow-500';
      case 'baixa': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Funções de Drag and Drop
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStatus: keyof typeof DELIVERY_STATUS) => {
    e.preventDefault();
    
    if (!draggedTask) return;

    moveTask(draggedTask, targetStatus);
    setDraggedTask(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  // Funções para gerenciar etapas
  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      CheckCircle,
      Calendar,
      Package,
      Truck,
      Heart
    };
    return icons[iconName] || CheckCircle;
  };

  const handleEditStage = (stageKey: string) => {
    setEditingStage(stageKey);
  };

  const handleSaveStage = (stageKey: string, newConfig: any) => {
    setStageConfig(prev => ({
      ...prev,
      [stageKey]: { ...(prev as any)[stageKey], ...newConfig }
    }));
    setEditingStage(null);
  };

  const handleCancelEdit = () => {
    setEditingStage(null);
  };

  const handleMoveStage = (stageKey: string, direction: 'up' | 'down') => {
    const currentIndex = stageOrder.indexOf(stageKey);
    if (currentIndex === -1) return;

    const newOrder = [...stageOrder];
    if (direction === 'up' && currentIndex > 0) {
      [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
    } else if (direction === 'down' && currentIndex < newOrder.length - 1) {
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
    }
    setStageOrder(newOrder);
  };

  const handleAddNewStage = (newStage: any) => {
    const stageKey = newStage.name.toLowerCase().replace(/\s+/g, '_');
    setStageConfig(prev => ({
      ...prev,
      [stageKey]: newStage
    } as any));
    setStageOrder(prev => [...prev, stageKey]);
    setShowNewStageForm(false);
  };

  const handleDeleteStage = (stageKey: string) => {
    if (stageOrder.length <= 1) return;
    
    setStageConfig(prev => {
      const newConfig = { ...prev } as any;
      delete newConfig[stageKey];
      return newConfig;
    });
    setStageOrder(prev => prev.filter(key => key !== stageKey));
  };

  // Funções de Drag and Drop para etapas
  const handleStageDragStart = (e: React.DragEvent, stageKey: string) => {
    setDraggedStage(stageKey);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', stageKey);
  };

  const handleStageDragOver = (e: React.DragEvent, stageKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stageKey);
  };

  const handleStageDragLeave = () => {
    setDragOverStage(null);
  };

  const handleStageDrop = (e: React.DragEvent, targetStageKey: string) => {
    e.preventDefault();
    
    if (!draggedStage || draggedStage === targetStageKey) {
      setDraggedStage(null);
      setDragOverStage(null);
      return;
    }

    const draggedIndex = stageOrder.indexOf(draggedStage);
    const targetIndex = stageOrder.indexOf(targetStageKey);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newOrder = [...stageOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedStage);

    setStageOrder(newOrder);
    setDraggedStage(null);
    setDragOverStage(null);
  };

  const handleStageDragEnd = () => {
    setDraggedStage(null);
    setDragOverStage(null);
  };

  // Filtrar tarefas
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    const matchesSearch = searchTerm === '' || 
      task.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.destination.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <ModernLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1"></div>
            <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
              <Truck className="h-10 w-10 text-orange-400" />
              Entrega de Serviços
            </h1>
            <div className="flex-1 flex justify-end">
              <Button
                onClick={() => setShowPageSettings(!showPageSettings)}
                className={`px-4 py-2 ${showPageSettings ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>
          <p className="text-white/70 text-lg mb-6">
            Controle operacional para excelência na entrega de experiências turísticas
          </p>
          
          {/* Navegação entre sub-menus */}
          <div className="flex justify-center gap-4">
            <Link href="/kanban">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3">
                <Target className="h-5 w-5 mr-2" />
                Vendas
              </Button>
            </Link>
            <Link href="/kanban/delivery">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3">
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

        {/* Controles e Filtros */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-lg p-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Busca */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar por cliente, serviço ou destino..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-lg pl-10 pr-4 py-2 placeholder-white/50"
                />
              </div>
            </div>

            {/* Filtros */}
            <div className="flex gap-2">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 ${showFilters ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              
              <Button
                onClick={() => setSelectedStatus('all')}
                className={`px-4 py-2 ${
                  selectedStatus === 'all' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                Todos
              </Button>
              
              {Object.entries(DELIVERY_STATUS).map(([key, status]) => (
                <Button
                  key={key}
                  onClick={() => setSelectedStatus(key)}
                  className={`px-4 py-2 flex items-center gap-2 ${
                    selectedStatus === key 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {getStatusIcon(key as keyof typeof DELIVERY_STATUS)}
                  {status.name}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => setShowStageSettings(!showStageSettings)}
                className={`px-4 py-2 ${showStageSettings ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurar Etapas
              </Button>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Entrega
              </Button>
            </div>
          </div>
        </div>

        {/* Cards de Status Resumidos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(DELIVERY_STATUS).map(([key, status]) => {
            const count = tasks.filter(task => task.status === key).length;
            const totalValue = tasks
              .filter(task => task.status === key)
              .reduce((sum, task) => sum + task.value, 0);
            
            return (
              <div key={key} className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-lg p-4 text-center hover:bg-white/10 transition-all">
                <div className={`w-12 h-12 ${status.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                  {getStatusIcon(key as keyof typeof DELIVERY_STATUS)}
                </div>
                <div className="text-2xl font-bold text-white">{count}</div>
                <div className="text-white/60 text-sm mb-1">{status.name}</div>
                <div className="text-green-400 text-xs font-medium">
                  R$ {totalValue.toLocaleString('pt-BR')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Formulário para Nova Etapa */}
        {showNewStageForm && (
          <NewStageForm
            onSave={handleAddNewStage}
            onCancel={() => setShowNewStageForm(false)}
          />
        )}

        {/* Painel de Configurações das Etapas */}
        {showStageSettings && (
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-xl">Configurações das Etapas</h3>
              <button 
                onClick={() => setShowStageSettings(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-medium flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Etapas do Pipeline de Entrega
                  </h4>
                  <button
                    onClick={() => setShowNewStageForm(true)}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Nova Etapa
                  </button>
                </div>
                
                <div className="space-y-3">
                  {stageOrder.map((stageKey, index) => {
                    const stage = stageConfig[stageKey as keyof typeof stageConfig];
                    if (!stage) return null;
                    
                    const IconComponent = getIconComponent(stage.icon);
                    const isEditing = editingStage === stageKey;
                    const isDragging = draggedStage === stageKey;
                    const isDragOver = dragOverStage === stageKey;
                    
                    return (
                      <div 
                        key={stageKey} 
                        draggable={!isEditing}
                        onDragStart={(e) => handleStageDragStart(e, stageKey)}
                        onDragOver={(e) => handleStageDragOver(e, stageKey)}
                        onDragLeave={handleStageDragLeave}
                        onDrop={(e) => handleStageDrop(e, stageKey)}
                        onDragEnd={handleStageDragEnd}
                        className={`bg-white/5 rounded-lg p-4 border border-white/10 transition-all duration-200 cursor-move ${
                          isDragging ? 'opacity-50 scale-95' : ''
                        } ${
                          isDragOver ? 'border-blue-400 bg-blue-500/10' : ''
                        } ${
                          isEditing ? 'cursor-default' : 'hover:bg-white/10'
                        }`}
                      >
                        {isEditing ? (
                          <StageEditForm
                            stageKey={stageKey}
                            stage={stage}
                            onSave={handleSaveStage}
                            onCancel={handleCancelEdit}
                          />
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {/* Controles de Reordenação */}
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => handleMoveStage(stageKey, 'up')}
                                  disabled={index === 0}
                                  className="p-1 text-white/60 hover:text-white disabled:text-white/30 disabled:cursor-not-allowed transition-colors"
                                  title="Mover para cima"
                                >
                                  <ArrowUp className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleMoveStage(stageKey, 'down')}
                                  disabled={index === stageOrder.length - 1}
                                  className="p-1 text-white/60 hover:text-white disabled:text-white/30 disabled:cursor-not-allowed transition-colors"
                                  title="Mover para baixo"
                                >
                                  <ArrowDown className="w-4 h-4" />
                                </button>
                              </div>
                              
                              {/* Ícone de Arrastar */}
                              <div className="text-white/40 hover:text-white/60 transition-colors">
                                <GripVertical className="w-5 h-5" />
                              </div>
                              
                              {/* Informações da Etapa */}
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 ${stage.color} rounded-lg flex items-center justify-center`}>
                                  <IconComponent className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h5 className="text-white font-medium">{stage.name}</h5>
                                  <p className="text-white/60 text-sm">{stage.description}</p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Ações */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditStage(stageKey)}
                                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                title="Editar etapa"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteStage(stageKey)}
                                disabled={stageOrder.length <= 1}
                                className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 disabled:text-white/30 disabled:cursor-not-allowed rounded-lg transition-all"
                                title="Excluir etapa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <h4 className="text-white font-medium mb-4">Ações Rápidas</h4>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all">
                    <Save className="w-4 h-4 mr-2 inline" />
                    Salvar Configurações
                  </button>
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-all">
                    <FileText className="w-4 h-4 mr-2 inline" />
                    Exportar Configuração
                  </button>
                  <button className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-medium transition-all">
                    <Trash2 className="w-4 h-4 mr-2 inline" />
                    Resetar Padrões
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Painel de Configurações da Página */}
        {showPageSettings && (
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-xl">Configurações da Página</h3>
              <button 
                onClick={() => setShowPageSettings(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-white font-medium mb-4">Exibição</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h5 className="text-white font-medium mb-2">Layout do Kanban</h5>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-white/70 text-sm">
                        <input type="checkbox" defaultChecked className="rounded" />
                        Mostrar contadores de valor
                      </label>
                      <label className="flex items-center gap-2 text-white/70 text-sm">
                        <input type="checkbox" defaultChecked className="rounded" />
                        Mostrar descrições das etapas
                      </label>
                      <label className="flex items-center gap-2 text-white/70 text-sm">
                        <input type="checkbox" defaultChecked className="rounded" />
                        Habilitar drag and drop
                      </label>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4">
                    <h5 className="text-white font-medium mb-2">Filtros Padrão</h5>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-white/70 text-sm">
                        <input type="checkbox" defaultChecked className="rounded" />
                        Mostrar busca por padrão
                      </label>
                      <label className="flex items-center gap-2 text-white/70 text-sm">
                        <input type="checkbox" className="rounded" />
                        Mostrar filtros avançados
                      </label>
                      <label className="flex items-center gap-2 text-white/70 text-sm">
                        <input type="checkbox" defaultChecked className="rounded" />
                        Mostrar cards de status
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-4">Configurações de Cards</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h5 className="text-white font-medium mb-2">Informações Exibidas</h5>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-white/70 text-sm">
                        <input type="checkbox" defaultChecked className="rounded" />
                        Mostrar valor do serviço
                      </label>
                      <label className="flex items-center gap-2 text-white/70 text-sm">
                        <input type="checkbox" defaultChecked className="rounded" />
                        Mostrar responsável
                      </label>
                      <label className="flex items-center gap-2 text-white/70 text-sm">
                        <input type="checkbox" defaultChecked className="rounded" />
                        Mostrar datas
                      </label>
                      <label className="flex items-center gap-2 text-white/70 text-sm">
                        <input type="checkbox" defaultChecked className="rounded" />
                        Mostrar destino
                      </label>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4">
                    <h5 className="text-white font-medium mb-2">Ações dos Cards</h5>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-white/70 text-sm">
                        <input type="checkbox" defaultChecked className="rounded" />
                        Botão Avançar
                      </label>
                      <label className="flex items-center gap-2 text-white/70 text-sm">
                        <input type="checkbox" className="rounded" />
                        Botão Editar
                      </label>
                      <label className="flex items-center gap-2 text-white/70 text-sm">
                        <input type="checkbox" className="rounded" />
                        Botão Excluir
                      </label>
                      <label className="flex items-center gap-2 text-white/70 text-sm">
                        <input type="checkbox" className="rounded" />
                        Botão Visualizar
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-4">Configurações de Notificações</h4>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-white/70 text-sm">
                      <input type="checkbox" defaultChecked className="rounded" />
                      Notificar quando tarefa muda de status
                    </label>
                    <label className="flex items-center gap-2 text-white/70 text-sm">
                      <input type="checkbox" defaultChecked className="rounded" />
                      Notificar sobre tarefas próximas do vencimento
                    </label>
                    <label className="flex items-center gap-2 text-white/70 text-sm">
                      <input type="checkbox" className="rounded" />
                      Notificar sobre novas tarefas atribuídas
                    </label>
                    <label className="flex items-center gap-2 text-white/70 text-sm">
                      <input type="checkbox" defaultChecked className="rounded" />
                      Notificar sobre tarefas concluídas
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <h4 className="text-white font-medium mb-4">Ações Rápidas</h4>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all">
                    <Save className="w-4 h-4 mr-2 inline" />
                    Salvar Configurações
                  </button>
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-all">
                    <FileText className="w-4 h-4 mr-2 inline" />
                    Exportar Configuração
                  </button>
                  <button className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-medium transition-all">
                    <Trash2 className="w-4 h-4 mr-2 inline" />
                    Resetar Padrões
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Kanban Board Otimizado */}
        <div className="kanban-scroll overflow-x-auto overflow-y-visible scrollbar-width: thin scrollbar-color: rgba(255, 255, 255, 0.3) transparent min-height: 100px padding-bottom: 20px">
          <div className="flex gap-6 min-w-max" style={{ minWidth: 'calc(100vw - 200px)' }}>
            {Object.entries(DELIVERY_STATUS).map(([statusKey, status]) => {
              const statusTasks = filteredTasks.filter(task => task.status === statusKey);
              
              return (
                <div 
                  key={statusKey}
                  className="w-80 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-lg p-4 min-h-[600px]"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, statusKey as keyof typeof DELIVERY_STATUS)}
                >
                  {/* Header da Coluna */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 ${status.color} rounded-lg flex items-center justify-center`}>
                        {getStatusIcon(statusKey as keyof typeof DELIVERY_STATUS)}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{status.name}</h3>
                        <p className="text-white/60 text-sm">{statusTasks.length} item(s)</p>
                      </div>
                    </div>
                    <p className="text-white/50 text-xs">{status.description}</p>
                  </div>

                  {/* Lista de Tarefas */}
                  <div className="space-y-3">
                    {statusTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-lg p-4 hover:bg-white/15 transition-all cursor-move group"
                      >
                        {/* Header do Card */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-white font-semibold text-sm mb-1">{task.clientName}</h4>
                            <p className="text-white/80 text-xs mb-2">{task.service}</p>
                            <div className="flex items-center gap-2">
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)} text-white`}>
                                {task.priority.toUpperCase()}
                              </div>
                              <div className="text-white/60 text-xs">
                                {task.travelers} pessoa(s)
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="ghost" className="text-white/60 hover:text-white p-1">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-white/60 hover:text-white p-1">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-white/60 hover:text-red-400 p-1">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Informações Essenciais */}
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-1 text-xs text-white/60">
                            <MapPin className="h-3 w-3" />
                            <span>{task.destination}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-white/60">
                            <Calendar className="h-3 w-3" />
                            <span>{task.startDate} - {task.endDate}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-white/60">
                            <User className="h-3 w-3" />
                            <span>{task.assignedTo}</span>
                          </div>
                        </div>

                        {/* Valor */}
                        <div className="bg-white/5 rounded-lg p-2 mb-3">
                          <div className="text-lg font-bold text-green-400">
                            R$ {task.value.toLocaleString('pt-BR')}
                          </div>
                        </div>

                        {/* Ações removidas conforme solicitado */}
                      </div>
                    ))}
                  </div>

                  {/* Botão de Adicionar */}
                  <Button
                    onClick={() => setShowForm(true)}
                    className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mensagem quando não há tarefas */}
        {filteredTasks.length === 0 && (
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-lg p-12 text-center">
            <Truck className="h-16 w-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhuma entrega encontrada</h3>
            <p className="text-white/60 mb-6">
              {searchTerm ? 'Nenhuma entrega corresponde aos critérios de busca.' : 'Não há entregas cadastradas no sistema.'}
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Nova Entrega
            </Button>
          </div>
        )}
      </div>
    </ModernLayout>
  );
}