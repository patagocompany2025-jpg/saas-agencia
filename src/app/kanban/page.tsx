'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { TaskForm } from '@/components/kanban/TaskForm';
import { Button } from '@/components/ui/button';
import { Plus, Filter, Search, Download, Truck, Heart, ArrowRight, Target, Settings, Edit, Save, X, Search as SearchIcon, Clipboard, MessageCircle, FileText, Handshake, CheckCircle, XCircle, Trash2, GripVertical, ArrowUp, ArrowDown, PlusCircle, Move } from 'lucide-react';
import Link from 'next/link';
import { KanbanTask } from '@/lib/types';
import { useKanban } from '@/lib/contexts/KanbanContext';

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
    { value: 'Search', label: 'Busca' },
    { value: 'Clipboard', label: 'Lista' },
    { value: 'MessageCircle', label: 'Chat' },
    { value: 'FileText', label: 'Documento' },
    { value: 'Handshake', label: 'Aperto de mão' },
    { value: 'CheckCircle', label: 'Check' },
    { value: 'XCircle', label: 'X' }
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
    icon: 'Search'
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
    { value: 'Search', label: 'Busca' },
    { value: 'Clipboard', label: 'Lista' },
    { value: 'MessageCircle', label: 'Chat' },
    { value: 'FileText', label: 'Documento' },
    { value: 'Handshake', label: 'Aperto de mão' },
    { value: 'CheckCircle', label: 'Check' },
    { value: 'XCircle', label: 'X' }
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
            placeholder="Ex: Apresentação, Contrato, etc."
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

export default function KanbanPage() {
  const { data: session, status } = useSession();
  const { addTask, updateTask, deleteTask } = useKanban();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<KanbanTask | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [showNewStageForm, setShowNewStageForm] = useState(false);
  const [draggedStage, setDraggedStage] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [stageOrder, setStageOrder] = useState([
    'prospeccao', 'qualificacao', 'consultoria', 'proposta', 'negociacao', 'fechado', 'perdido'
  ]);
  const [stageConfig, setStageConfig] = useState({
    prospeccao: { name: 'Prospecção', description: 'Identificação de leads', color: 'bg-blue-500', icon: 'Search' },
    qualificacao: { name: 'Qualificação', description: 'Avaliação de potencial', color: 'bg-yellow-500', icon: 'Clipboard' },
    consultoria: { name: 'Consultoria', description: 'Entendimento de necessidades', color: 'bg-purple-500', icon: 'MessageCircle' },
    proposta: { name: 'Proposta', description: 'Elaboração do pacote', color: 'bg-indigo-500', icon: 'FileText' },
    negociacao: { name: 'Negociação', description: 'Ajustes e fechamento', color: 'bg-orange-500', icon: 'Handshake' },
    fechado: { name: 'Fechado', description: 'Venda concluída', color: 'bg-green-500', icon: 'CheckCircle' },
    perdido: { name: 'Perdido', description: 'Oportunidade perdida', color: 'bg-red-500', icon: 'XCircle' }
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

  const handleFilter = () => {
    setShowFilters(!showFilters);
  };

  const handleSearch = () => {
    setShowSearch(!showSearch);
  };

  const handleDownload = () => {
    // Implementar download de dados
    console.log('Download de dados do pipeline');
  };

  const handleSettings = () => {
    setShowSettings(!showSettings);
  };

  const handleEditStage = (stageKey: string) => {
    setEditingStage(stageKey);
  };

  const handleSaveStage = (stageKey: string, newConfig: any) => {
    setStageConfig(prev => ({
      ...prev,
      [stageKey]: { ...prev[stageKey], ...newConfig }
    }));
    setEditingStage(null);
  };

  const handleCancelEdit = () => {
    setEditingStage(null);
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Search: SearchIcon,
      Clipboard,
      MessageCircle,
      FileText,
      Handshake,
      CheckCircle,
      XCircle
    };
    return icons[iconName] || SearchIcon;
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
    if (stageOrder.length <= 1) return; // Não permitir deletar a última etapa
    
    setStageConfig(prev => {
      const newConfig = { ...prev } as any;
      delete newConfig[stageKey];
      return newConfig;
    });
    setStageOrder(prev => prev.filter(key => key !== stageKey));
  };

  // Funções de Drag and Drop
  const handleDragStart = (e: React.DragEvent, stageKey: string) => {
    setDraggedStage(stageKey);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', stageKey);
  };

  const handleDragOver = (e: React.DragEvent, stageKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stageKey);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, targetStageKey: string) => {
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

  const handleDragEnd = () => {
    setDraggedStage(null);
    setDragOverStage(null);
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
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2">
                    <Truck className="h-4 w-4 mr-2" />
                    Entrega de Serviços
                  </Button>
                </Link>
                <Link href="/kanban/post-sale">
                  <Button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2">
                    <Heart className="h-4 w-4 mr-2" />
                    Pós-Venda
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleFilter}
                className={`p-2 border border-white/20 rounded-lg text-white transition-all hover:bg-white/15 ${
                  showFilters ? 'bg-white/20' : 'bg-white/10'
                }`}
              >
                <Filter className="w-5 h-5" />
              </button>
              <button 
                onClick={handleSearch}
                className={`p-2 border border-white/20 rounded-lg text-white transition-all hover:bg-white/15 ${
                  showSearch ? 'bg-white/20' : 'bg-white/10'
                }`}
              >
                <Search className="w-5 h-5" />
              </button>
              <button 
                onClick={handleDownload}
                className="p-2 bg-white/10 border border-white/20 rounded-lg text-white transition-all hover:bg-white/15"
              >
                <Download className="w-5 h-5" />
              </button>
              <button 
                onClick={handleSettings}
                className={`p-2 border border-white/20 rounded-lg text-white transition-all hover:bg-white/15 ${
                  showSettings ? 'bg-white/20' : 'bg-white/10'
                }`}
              >
                <Settings className="w-5 h-5" />
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

        {/* Painel de Filtros */}
        {showFilters && (
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-lg p-4 mb-6">
            <h3 className="text-white font-semibold mb-4">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Status</label>
                <select className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2">
                  <option value="">Todos os status</option>
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
                <label className="text-white/70 text-sm mb-2 block">Prioridade</label>
                <select className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2">
                  <option value="">Todas as prioridades</option>
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
              <div>
                <label className="text-white/70 text-sm mb-2 block">Valor</label>
                <select className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2">
                  <option value="">Qualquer valor</option>
                  <option value="0-5000">R$ 0 - R$ 5.000</option>
                  <option value="5000-15000">R$ 5.000 - R$ 15.000</option>
                  <option value="15000+">Acima de R$ 15.000</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Painel de Busca */}
        {showSearch && (
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-lg p-4 mb-6">
            <h3 className="text-white font-semibold mb-4">Buscar Oportunidades</h3>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Digite o nome do cliente, destino ou interesse..."
                className="flex-1 bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 placeholder-white/50"
              />
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
                Buscar
              </button>
            </div>
          </div>
        )}

        {/* Formulário para Nova Etapa */}
        {showNewStageForm && (
          <NewStageForm
            onSave={handleAddNewStage}
            onCancel={() => setShowNewStageForm(false)}
          />
        )}

        {/* Painel de Configurações */}
        {showSettings && (
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-xl">Configurações do Pipeline</h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-white font-medium flex items-center gap-2 mb-1">
                      <Settings className="w-5 h-5" />
                      Etapas do Pipeline
                    </h4>
                    <p className="text-white/60 text-sm flex items-center gap-1">
                      <Move className="w-4 h-4" />
                      Arraste e solte para reordenar • Use as setas para mover
                    </p>
                  </div>
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
                        onDragStart={(e) => handleDragStart(e, stageKey)}
                        onDragOver={(e) => handleDragOver(e, stageKey)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, stageKey)}
                        onDragEnd={handleDragEnd}
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
                    <Download className="w-4 h-4 mr-2 inline" />
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

        <KanbanBoard
          onNewTask={handleNewTask}
          onEditTask={handleEditTask}
        />
      </div>
    </ModernLayout>
  );
}
