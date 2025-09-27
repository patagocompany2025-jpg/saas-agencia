'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, X, Plus, User, Globe, Calendar, DollarSign, Target, Star, Trash2, AlertTriangle } from 'lucide-react';
import { KanbanTask } from '@/lib/types';
import { useClients } from '@/lib/contexts/ClientContext';

interface TaskFormProps {
  task?: KanbanTask;
  onSave: (taskData: Omit<KanbanTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  onDelete?: (taskId: string) => void;
}

export function TaskForm({ task, onSave, onCancel, onDelete }: TaskFormProps) {
  const { clients, addClient } = useClients();
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
  });

  const [formData, setFormData] = useState({
    clientId: task?.clientId || '',
    title: task?.title || '',
    status: task?.status || 'prospeccao' as KanbanTask['status'],
    priority: task?.priority || 'media' as KanbanTask['priority'],
    value: task?.value || 0,
    expectedValue: task?.expectedValue || 0,
    destination: task?.destination || '',
    travelDates: {
      departure: task?.travelDates?.departure || undefined,
      return: task?.travelDates?.return || undefined,
      flexible: task?.travelDates?.flexible || false,
    },
    travelers: {
      adults: task?.travelers?.adults || 1,
      children: task?.travelers?.children || 0,
      infants: task?.travelers?.infants || 0,
    },
    budget: {
      min: task?.budget?.min || 0,
      max: task?.budget?.max || 0,
      disclosed: task?.budget?.disclosed || false,
    },
    interests: task?.interests || [],
    accommodation: {
      type: task?.accommodation?.type || 'hotel' as const,
      category: task?.accommodation?.category || 'medio' as const,
    },
    notes: task?.notes || '',
    nextAction: {
      type: task?.nextAction?.type || 'call' as const,
      description: task?.nextAction?.description || '',
      dueDate: task?.nextAction?.dueDate || new Date(),
      completed: task?.nextAction?.completed || false,
    },
    source: task?.source || 'website' as const,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const interestOptions = [
    'aventura', 'luxo', 'cultural', 'relaxamento', 'natureza', 
    'historia', 'familia', 'romance', 'negocios', 'fotografia',
    'gastronomia', 'esportes', 'arte', 'música', 'festivais'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId) {
      newErrors.clientId = 'Cliente é obrigatório';
    }

    if (!formData.destination.trim()) {
      newErrors.destination = 'Destino é obrigatório';
    }

    if (formData.interests.length === 0) {
      newErrors.interests = 'Selecione pelo menos um interesse';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, unknown>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddClient = async () => {
    if (newClientData.name && newClientData.email) {
      addClient({
        name: newClientData.name,
        email: newClientData.email,
        phone: newClientData.phone,
        company: newClientData.company,
        status: 'lead',
        source: 'sistema',
        notes: 'Cliente adicionado via pipeline',
      });
      
      setNewClientData({ name: '', email: '', phone: '', company: '' });
      setShowNewClientForm(false);
    }
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleDelete = () => {
    if (task && onDelete) {
      onDelete(task.id);
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center">
            <button
              onClick={onCancel}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors mr-3"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
            <h2 className="text-2xl font-bold text-white">
              {task ? 'Editar Oportunidade' : 'Nova Oportunidade'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {task && onDelete && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400 hover:text-red-300"
                title="Excluir oportunidade"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={onCancel}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Cliente e Origem */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center">
                <User className="h-4 w-4 mr-2" />
                Cliente *
              </label>
              <div className="flex gap-2">
                <select
                  className="flex-1 bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.clientId}
                  onChange={(e) => handleInputChange('clientId', e.target.value)}
                >
                  <option value="" className="bg-gray-800 text-white">Selecione um cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id} className="bg-gray-800 text-white">
                      {client.name} - {client.email}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewClientForm(!showNewClientForm)}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {errors.clientId && (
                <p className="text-sm text-red-400">{errors.clientId}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                Origem do Lead
              </label>
              <select
                className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.source}
                onChange={(e) => handleInputChange('source', e.target.value)}
              >
                <option value="website" className="bg-gray-800 text-white">Website</option>
                <option value="facebook" className="bg-gray-800 text-white">Facebook</option>
                <option value="instagram" className="bg-gray-800 text-white">Instagram</option>
                <option value="google" className="bg-gray-800 text-white">Google</option>
                <option value="indicacao" className="bg-gray-800 text-white">Indicação</option>
                <option value="evento" className="bg-gray-800 text-white">Evento</option>
                <option value="outros" className="bg-gray-800 text-white">Outros</option>
              </select>
            </div>
          </div>

          {/* Novo Cliente Form */}
          {showNewClientForm && (
            <div className="bg-white/5 border border-white/20 rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-semibold text-white">Adicionar Novo Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={newClientData.name}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newClientData.email}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="tel"
                  placeholder="Telefone"
                  value={newClientData.phone}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, phone: e.target.value }))}
                  className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Empresa (opcional)"
                  value={newClientData.company}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, company: e.target.value }))}
                  className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAddClient}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Adicionar Cliente
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewClientForm(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Destino e Interesses */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                Destino *
              </label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                placeholder="Ex: Patagônia Argentina, Maldivas, Europa..."
                className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.destination && (
                <p className="text-sm text-red-400">{errors.destination}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center">
                <Star className="h-4 w-4 mr-2" />
                Interesses *
              </label>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      formData.interests.includes(interest)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              {errors.interests && (
                <p className="text-sm text-red-400">{errors.interests}</p>
              )}
            </div>
          </div>

          {/* Datas e Viajantes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Datas de Viagem
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-white/70">Data de Partida</label>
                  <input
                    type="date"
                    value={formData.travelDates.departure && formData.travelDates.departure instanceof Date ? formData.travelDates.departure.toISOString().split('T')[0] : ''}
                    onChange={(e) => handleInputChange('travelDates.departure', e.target.value ? new Date(e.target.value).toISOString() : '')}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/70">Data de Retorno</label>
                  <input
                    type="date"
                    value={formData.travelDates.return && formData.travelDates.return instanceof Date ? formData.travelDates.return.toISOString().split('T')[0] : ''}
                    onChange={(e) => handleInputChange('travelDates.return', e.target.value ? new Date(e.target.value).toISOString() : '')}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.travelDates.flexible}
                    onChange={(e) => handleInputChange('travelDates.flexible', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-white/70">Datas flexíveis</span>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <User className="h-5 w-5 mr-2" />
                Viajantes
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-white/70">Adultos</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.travelers.adults}
                    onChange={(e) => handleInputChange('travelers.adults', parseInt(e.target.value) || 1)}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/70">Crianças</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.travelers.children}
                    onChange={(e) => handleInputChange('travelers.children', parseInt(e.target.value) || 0)}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/70">Bebês</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.travelers.infants}
                    onChange={(e) => handleInputChange('travelers.infants', parseInt(e.target.value) || 0)}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Orçamento e Valores */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Orçamento e Valores
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-white/70">Valor Mínimo (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.budget.min}
                  onChange={(e) => handleInputChange('budget.min', parseFloat(e.target.value) || 0)}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm text-white/70">Valor Máximo (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.budget.max}
                  onChange={(e) => handleInputChange('budget.max', parseFloat(e.target.value) || 0)}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm text-white/70">Valor Esperado (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.expectedValue}
                  onChange={(e) => handleInputChange('expectedValue', parseFloat(e.target.value) || 0)}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.budget.disclosed}
                onChange={(e) => handleInputChange('budget.disclosed', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-white/70">Cliente revelou o orçamento</span>
            </label>
          </div>

          {/* Status e Prioridade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Status
              </label>
              <select
                className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <option value="prospeccao" className="bg-gray-800 text-white">Prospecção</option>
                <option value="qualificacao" className="bg-gray-800 text-white">Qualificação</option>
                <option value="consultoria" className="bg-gray-800 text-white">Consultoria</option>
                <option value="proposta" className="bg-gray-800 text-white">Proposta</option>
                <option value="negociacao" className="bg-gray-800 text-white">Negociação</option>
                <option value="fechado" className="bg-gray-800 text-white">Fechado</option>
                <option value="perdido" className="bg-gray-800 text-white">Perdido</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Prioridade</label>
              <select
                className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
              >
                <option value="baixa" className="bg-gray-800 text-white">Baixa</option>
                <option value="media" className="bg-gray-800 text-white">Média</option>
                <option value="alta" className="bg-gray-800 text-white">Alta</option>
              </select>
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Notas Adicionais</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Informações adicionais sobre a oportunidade..."
              rows={3}
              className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all flex items-center shadow-lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {task ? 'Atualizar' : 'Criar'} Oportunidade
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white/10 backdrop-blur-2xl rounded-xl border border-white/20 shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/20 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Confirmar Exclusão</h3>
              </div>
              <p className="text-white/80 mb-6">
                Tem certeza que deseja excluir esta oportunidade? Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}