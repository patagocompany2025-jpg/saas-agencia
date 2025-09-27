'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  AlertCircle,
  CheckCircle,
  Clock,
  Package,
  Truck,
  Home,
  Heart
} from 'lucide-react';

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

interface DeliveryTaskFormProps {
  task?: DeliveryTask;
  onSave: (taskData: Partial<DeliveryTask>) => void;
  onCancel: () => void;
}

export function DeliveryTaskForm({ task, onSave, onCancel }: DeliveryTaskFormProps) {
  const [formData, setFormData] = useState<Partial<DeliveryTask>>({
    clientName: '',
    service: '',
    value: 0,
    status: 'confirmado',
    priority: 'media',
    paymentDate: '',
    startDate: '',
    endDate: '',
    travelers: 1,
    destination: '',
    assignedTo: '',
    notes: ''
  });

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        paymentDate: task.paymentDate,
        startDate: task.startDate,
        endDate: task.endDate
      });
    }
  }, [task]);

  const handleInputChange = (field: keyof DeliveryTask, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.clientName?.trim()) {
      alert('Nome do cliente é obrigatório');
      return;
    }
    
    if (!formData.service?.trim()) {
      alert('Serviço é obrigatório');
      return;
    }
    
    if (!formData.destination?.trim()) {
      alert('Destino é obrigatório');
      return;
    }
    
    if (!formData.assignedTo?.trim()) {
      alert('Responsável é obrigatório');
      return;
    }
    
    if (!formData.paymentDate) {
      alert('Data de pagamento é obrigatória');
      return;
    }
    
    if (!formData.startDate) {
      alert('Data de início é obrigatória');
      return;
    }
    
    if (!formData.endDate) {
      alert('Data de fim é obrigatória');
      return;
    }
    
    if (formData.value && formData.value <= 0) {
      alert('Valor deve ser maior que zero');
      return;
    }
    
    if (formData.travelers && formData.travelers <= 0) {
      alert('Número de viajantes deve ser maior que zero');
      return;
    }
    
    onSave(formData);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmado': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'planejamento': return <Calendar className="h-4 w-4 text-blue-400" />;
      case 'preparacao': return <Package className="h-4 w-4 text-yellow-400" />;
      case 'execucao': return <Truck className="h-4 w-4 text-orange-400" />;
      case 'concluido': return <Home className="h-4 w-4 text-green-400" />;
      case 'pos-venda': return <Heart className="h-4 w-4 text-pink-400" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'alta': return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'media': return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'baixa': return <CheckCircle className="h-4 w-4 text-green-400" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações do Cliente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="clientName" className="text-white/70 flex items-center gap-2">
            <User className="h-4 w-4" />
            Nome do Cliente *
          </Label>
          <Input
            id="clientName"
            value={formData.clientName || ''}
            onChange={(e) => handleInputChange('clientName', e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
            placeholder="Ex: Família Silva"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="assignedTo" className="text-white/70 flex items-center gap-2">
            <User className="h-4 w-4" />
            Responsável *
          </Label>
          <Input
            id="assignedTo"
            value={formData.assignedTo || ''}
            onChange={(e) => handleInputChange('assignedTo', e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
            placeholder="Ex: Alexandre"
            required
          />
        </div>
      </div>

      {/* Serviço e Destino */}
      <div className="space-y-2">
        <Label htmlFor="service" className="text-white/70 flex items-center gap-2">
          <Package className="h-4 w-4" />
          Serviço *
        </Label>
        <Input
          id="service"
          value={formData.service || ''}
          onChange={(e) => handleInputChange('service', e.target.value)}
          className="bg-gray-700 border-gray-600 text-white"
          placeholder="Ex: Pacote Concierge Bariloche - 7 dias"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="destination" className="text-white/70 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Destino *
        </Label>
        <Input
          id="destination"
          value={formData.destination || ''}
          onChange={(e) => handleInputChange('destination', e.target.value)}
          className="bg-gray-700 border-gray-600 text-white"
          placeholder="Ex: Bariloche, Argentina"
          required
        />
      </div>

      {/* Status e Prioridade */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-white/70 flex items-center gap-2">
            {getStatusIcon(formData.status || 'confirmado')}
            Status
          </Label>
          <Select value={formData.status || 'confirmado'} onValueChange={(value) => handleInputChange('status', value)}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="confirmado">Pagamento Confirmado</SelectItem>
              <SelectItem value="planejamento">Planejamento</SelectItem>
              <SelectItem value="preparacao">Preparação</SelectItem>
              <SelectItem value="execucao">Em Execução</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
              <SelectItem value="pos-venda">Pós-Venda</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-white/70 flex items-center gap-2">
            {getPriorityIcon(formData.priority || 'media')}
            Prioridade
          </Label>
          <Select value={formData.priority || 'media'} onValueChange={(value) => handleInputChange('priority', value)}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="baixa">Baixa</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Datas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="paymentDate" className="text-white/70 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Data de Pagamento *
          </Label>
          <Input
            id="paymentDate"
            type="date"
            value={formData.paymentDate || ''}
            onChange={(e) => handleInputChange('paymentDate', e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-white/70 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Data de Início *
          </Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate || ''}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate" className="text-white/70 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Data de Fim *
          </Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate || ''}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
            required
          />
        </div>
      </div>

      {/* Valor e Viajantes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="value" className="text-white/70 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Valor (R$)
          </Label>
          <Input
            id="value"
            type="number"
            min="0"
            step="0.01"
            value={formData.value || ''}
            onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || 0)}
            className="bg-gray-700 border-gray-600 text-white"
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="travelers" className="text-white/70 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Número de Viajantes
          </Label>
          <Input
            id="travelers"
            type="number"
            min="1"
            value={formData.travelers || 1}
            onChange={(e) => handleInputChange('travelers', parseInt(e.target.value) || 1)}
            className="bg-gray-700 border-gray-600 text-white"
            placeholder="1"
          />
        </div>
      </div>

      {/* Notas */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-white/70">
          Observações
        </Label>
        <Textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          className="bg-gray-700 border-gray-600 text-white"
          placeholder="Observações adicionais sobre a entrega..."
          rows={3}
        />
      </div>

      {/* Botões */}
      <div className="flex gap-4 pt-6">
        <Button
          type="button"
          onClick={onCancel}
          className="bg-gray-600 hover:bg-gray-700 text-white flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-orange-600 hover:bg-orange-700 text-white flex-1"
        >
          {task ? 'Atualizar Entrega' : 'Criar Entrega'}
        </Button>
      </div>
    </form>
  );
}
