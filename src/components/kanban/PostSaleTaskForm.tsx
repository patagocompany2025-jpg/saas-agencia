'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CURRENCIES, CurrencyCode, formatCurrency } from '@/lib/utils/currency';
import {
  DollarSign,
  Users,
  Calendar,
  MapPin,
  User,
  Heart,
  Star,
  MessageCircle,
  Phone,
  Mail,
  CheckCircle,
  Clock,
  AlertCircle,
  ThumbsUp,
  Gift,
  Award,
  ArrowLeft
} from 'lucide-react';
import { useClients } from '@/lib/contexts/ClientContext';

interface PostSaleTask {
  id: string;
  clientName: string;
  service: string;
  value: number;
  valueCurrency?: string;
  closedValue?: number;
  closedValueCurrency?: string;
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

interface PostSaleTaskFormProps {
  initialTask?: PostSaleTask;
  onSave: (taskData: Partial<PostSaleTask>) => void;
  onCancel: () => void;
}

export function PostSaleTaskForm({ initialTask, onSave, onCancel }: PostSaleTaskFormProps) {
  const { clients } = useClients();
  const [formData, setFormData] = useState({
    clientName: '',
    service: '',
    value: 0,
    valueCurrency: 'BRL' as CurrencyCode,
    closedValue: 0,
    closedValueCurrency: 'BRL' as CurrencyCode,
    status: 'aguardando' as PostSaleTask['status'],
    completionDate: '',
    feedbackDate: '',
    satisfaction: 0,
    feedback: '',
    nextContact: '',
    assignedTo: '',
    priority: 'media' as PostSaleTask['priority'],
    notes: ''
  });
  const [selectedClientId, setSelectedClientId] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (initialTask) {
      setFormData({
        clientName: initialTask.clientName || '',
        service: initialTask.service || '',
        value: initialTask.value || 0,
        valueCurrency: (initialTask.valueCurrency as CurrencyCode) || 'BRL',
        closedValue: initialTask.closedValue || 0,
        closedValueCurrency: (initialTask.closedValueCurrency as CurrencyCode) || 'BRL',
        status: initialTask.status || 'aguardando',
        completionDate: initialTask.completionDate || '',
        feedbackDate: initialTask.feedbackDate || '',
        satisfaction: initialTask.satisfaction || 0,
        feedback: initialTask.feedback || '',
        nextContact: initialTask.nextContact || '',
        assignedTo: initialTask.assignedTo || '',
        priority: initialTask.priority || 'media',
        notes: initialTask.notes || ''
      });
    }
  }, [initialTask]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Nome do cliente é obrigatório';
    }

    if (!formData.service.trim()) {
      newErrors.service = 'Serviço é obrigatório';
    }

    if (formData.value <= 0) {
      newErrors.value = 'Valor deve ser maior que zero';
    }

    if (!formData.completionDate) {
      newErrors.completionDate = 'Data de conclusão é obrigatória';
    }

    if (!formData.nextContact) {
      newErrors.nextContact = 'Próximo contato é obrigatório';
    }

    if (!formData.assignedTo.trim()) {
      newErrors.assignedTo = 'Responsável é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const taskData = {
        ...formData,
        value: Number(formData.value),
        satisfaction: formData.satisfaction > 0 ? formData.satisfaction : undefined,
        feedback: formData.feedback.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        createdAt: initialTask?.createdAt || new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      
      onSave(taskData);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Selecionar cliente do dropdown
  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    const selectedClient = clients.find(client => client.id === clientId);
    if (selectedClient) {
      setFormData(prev => ({
        ...prev,
        clientName: selectedClient.name
      }));
    }
  };

  // Handler para valores monetários com formatação
  const handleCurrencyInputChange = (field: string, value: string, currencyCode: CurrencyCode) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');

    if (!numbers) {
      handleInputChange(field, 0);
      return;
    }

    // Converte para número (centavos)
    const numericValue = parseInt(numbers, 10) / 100;
    handleInputChange(field, numericValue);
  };

  // Formata o valor para exibição
  const getFormattedValue = (value: number, currencyCode: CurrencyCode): string => {
    if (!value || value === 0) return '';
    return formatCurrency(value, currencyCode).replace(/[^\d,.]/g, '');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header com botão de voltar */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h2 className="text-xl font-semibold text-white">
            {initialTask ? 'Editar Pós-Venda' : 'Nova Atividade de Pós-Venda'}
          </h2>
          <p className="text-white/70 text-sm">
            {initialTask ? 'Edite os dados da atividade' : 'Preencha os dados da nova atividade'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome do Cliente */}
        <div className="space-y-2">
          <Label htmlFor="clientName" className="text-white/70 flex items-center gap-2">
            <User className="h-4 w-4" />
            Nome do Cliente *
          </Label>
          <select
            value={selectedClientId}
            onChange={(e) => handleClientSelect(e.target.value)}
            className="w-full bg-gray-700 border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="" className="bg-gray-800 text-white">Selecione um cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id} className="bg-gray-800 text-white">
                {client.name} - {client.email}
              </option>
            ))}
          </select>
          {errors.clientName && (
            <p className="text-red-400 text-sm">{errors.clientName}</p>
          )}
        </div>

        {/* Serviço */}
        <div className="space-y-2">
          <Label htmlFor="service" className="text-white/70 flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Serviço Contratado *
          </Label>
          <Input
            id="service"
            value={formData.service}
            onChange={(e) => handleInputChange('service', e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
            placeholder="Ex: Pacote Concierge Bariloche"
          />
          {errors.service && (
            <p className="text-red-400 text-sm">{errors.service}</p>
          )}
        </div>

        {/* Valor */}
        <div className="space-y-2">
          <Label htmlFor="value" className="text-white/70 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Valor do Serviço *
          </Label>
          <div className="flex gap-2">
            <select
              value={formData.valueCurrency}
              onChange={(e) => handleInputChange('valueCurrency', e.target.value)}
              className="w-32 bg-gray-700 border-gray-600 text-white rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {Object.entries(CURRENCIES).map(([code, currency]) => (
                <option key={code} value={code}>
                  {currency.symbol} {code}
                </option>
              ))}
            </select>
            <Input
              id="value"
              type="text"
              value={getFormattedValue(formData.value, formData.valueCurrency)}
              onChange={(e) => handleCurrencyInputChange('value', e.target.value, formData.valueCurrency)}
              className="flex-1 bg-gray-700 border-gray-600 text-white"
              placeholder="0,00"
            />
          </div>
          {errors.value && (
            <p className="text-red-400 text-sm">{errors.value}</p>
          )}
        </div>

        {/* Valor Fechado */}
        <div className="space-y-2">
          <Label htmlFor="closedValue" className="text-white/70 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Valor Fechado
          </Label>
          <div className="flex gap-2">
            <select
              value={formData.closedValueCurrency}
              onChange={(e) => handleInputChange('closedValueCurrency', e.target.value)}
              className="w-32 bg-gray-700 border-gray-600 text-white rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {Object.entries(CURRENCIES).map(([code, currency]) => (
                <option key={code} value={code}>
                  {currency.symbol} {code}
                </option>
              ))}
            </select>
            <Input
              id="closedValue"
              type="text"
              value={getFormattedValue(formData.closedValue, formData.closedValueCurrency)}
              onChange={(e) => handleCurrencyInputChange('closedValue', e.target.value, formData.closedValueCurrency)}
              className="flex-1 bg-gray-700 border-gray-600 text-white"
              placeholder="0,00"
            />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status" className="text-white/70 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Status do Pós-Venda *
          </Label>
          <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="aguardando" className="text-white hover:bg-gray-700">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-400" />
                  Aguardando Feedback
                </div>
              </SelectItem>
              <SelectItem value="contato" className="text-white hover:bg-gray-700">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-400" />
                  Em Contato
                </div>
              </SelectItem>
              <SelectItem value="satisfeito" className="text-white hover:bg-gray-700">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-green-400" />
                  Cliente Satisfeito
                </div>
              </SelectItem>
              <SelectItem value="reclamacao" className="text-white hover:bg-gray-700">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  Reclamação
                </div>
              </SelectItem>
              <SelectItem value="fidelizado" className="text-white hover:bg-gray-700">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-purple-400" />
                  Cliente Fidelizado
                </div>
              </SelectItem>
              <SelectItem value="indicacao" className="text-white hover:bg-gray-700">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-emerald-400" />
                  Indicação Recebida
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data de Conclusão */}
        <div className="space-y-2">
          <Label htmlFor="completionDate" className="text-white/70 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Data de Conclusão *
          </Label>
          <Input
            id="completionDate"
            type="date"
            value={formData.completionDate}
            onChange={(e) => handleInputChange('completionDate', e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
          />
          {errors.completionDate && (
            <p className="text-red-400 text-sm">{errors.completionDate}</p>
          )}
        </div>

        {/* Data de Feedback */}
        <div className="space-y-2">
          <Label htmlFor="feedbackDate" className="text-white/70 flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Data do Feedback
          </Label>
          <Input
            id="feedbackDate"
            type="date"
            value={formData.feedbackDate}
            onChange={(e) => handleInputChange('feedbackDate', e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>

        {/* Satisfação */}
        <div className="space-y-2">
          <Label htmlFor="satisfaction" className="text-white/70 flex items-center gap-2">
            <Star className="h-4 w-4" />
            Satisfação (1-5)
          </Label>
          <Select value={formData.satisfaction.toString()} onValueChange={(value) => handleInputChange('satisfaction', Number(value))}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="0" className="text-white hover:bg-gray-700">Sem avaliação</SelectItem>
              <SelectItem value="1" className="text-white hover:bg-gray-700">1 - Muito insatisfeito</SelectItem>
              <SelectItem value="2" className="text-white hover:bg-gray-700">2 - Insatisfeito</SelectItem>
              <SelectItem value="3" className="text-white hover:bg-gray-700">3 - Neutro</SelectItem>
              <SelectItem value="4" className="text-white hover:bg-gray-700">4 - Satisfeito</SelectItem>
              <SelectItem value="5" className="text-white hover:bg-gray-700">5 - Muito satisfeito</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Próximo Contato */}
        <div className="space-y-2">
          <Label htmlFor="nextContact" className="text-white/70 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Próximo Contato *
          </Label>
          <Input
            id="nextContact"
            type="date"
            value={formData.nextContact}
            onChange={(e) => handleInputChange('nextContact', e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
          />
          {errors.nextContact && (
            <p className="text-red-400 text-sm">{errors.nextContact}</p>
          )}
        </div>

        {/* Responsável */}
        <div className="space-y-2">
          <Label htmlFor="assignedTo" className="text-white/70 flex items-center gap-2">
            <User className="h-4 w-4" />
            Responsável *
          </Label>
          <Input
            id="assignedTo"
            value={formData.assignedTo}
            onChange={(e) => handleInputChange('assignedTo', e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
            placeholder="Ex: Alexandre"
          />
          {errors.assignedTo && (
            <p className="text-red-400 text-sm">{errors.assignedTo}</p>
          )}
        </div>

        {/* Prioridade */}
        <div className="space-y-2">
          <Label htmlFor="priority" className="text-white/70 flex items-center gap-2">
            <Award className="h-4 w-4" />
            Prioridade
          </Label>
          <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="baixa" className="text-white hover:bg-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Baixa
                </div>
              </SelectItem>
              <SelectItem value="media" className="text-white hover:bg-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  Média
                </div>
              </SelectItem>
              <SelectItem value="alta" className="text-white hover:bg-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  Alta
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Feedback */}
      <div className="space-y-2">
        <Label htmlFor="feedback" className="text-white/70 flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Feedback do Cliente
        </Label>
        <Textarea
          id="feedback"
          value={formData.feedback}
          onChange={(e) => handleInputChange('feedback', e.target.value)}
          className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
          placeholder="Ex: Experiência incrível! Superou todas as expectativas..."
        />
      </div>

      {/* Notas */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-white/70 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Notas Adicionais
        </Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          className="bg-gray-700 border-gray-600 text-white min-h-[80px]"
          placeholder="Ex: Cliente muito satisfeito - possível indicação"
        />
      </div>

      {/* Botões */}
      <div className="flex gap-4 pt-6">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="bg-gray-600 border-gray-500 text-white hover:bg-gray-700 hover:border-gray-400 flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-pink-600 hover:bg-pink-700 text-white flex-1"
        >
          {initialTask ? 'Atualizar Atividade' : 'Criar Atividade'}
        </Button>
      </div>
    </form>
  );
}
