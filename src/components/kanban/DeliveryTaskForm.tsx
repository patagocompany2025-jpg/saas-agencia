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
import { useClients } from '@/lib/contexts/ClientContext';
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
  Heart,
  Plus,
  Search,
  X,
  ArrowLeft
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
  const { clients, addClient, deleteClient } = useClients();
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteCardConfirm, setShowDeleteCardConfirm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<{ id: string; name: string } | null>(null);
  const [newClientData, setNewClientData] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });

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

  // Filtrar clientes baseado na busca
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.company?.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );

  // Selecionar cliente existente
  const handleSelectClient = (client: { id: string; name: string; email: string; company?: string }) => {
    setFormData(prev => ({
      ...prev,
      clientName: client.name
    }));
    setShowClientSelector(false);
    setClientSearchTerm('');
  };

  // Criar novo cliente
  const handleCreateClient = () => {
    if (newClientData.name && newClientData.email) {
      addClient({
        name: newClientData.name,
        email: newClientData.email,
        phone: newClientData.phone,
        company: newClientData.company,
        status: 'cliente',
        source: 'Entrega de Serviço',
        notes: 'Cliente criado durante processo de entrega',
        assignedTo: '1'
      });
      
      setFormData(prev => ({
        ...prev,
        clientName: newClientData.name
      }));
      
      setNewClientData({ name: '', email: '', phone: '', company: '' });
      setShowNewClientForm(false);
      setShowClientSelector(false);
    }
  };

  // Encontrar cliente atual pelo nome
  const findCurrentClient = () => {
    const client = clients.find(client => client.name === formData.clientName);
    console.log('Buscando cliente:', formData.clientName);
    console.log('Clientes disponíveis:', clients.map(c => c.name));
    console.log('Cliente encontrado:', client);
    return client;
  };

  // Verificar se deve mostrar botão de excluir
  const shouldShowDeleteButton = () => {
    const hasClientName = formData.clientName && formData.clientName.trim() !== '';
    const clientExists = findCurrentClient();
    console.log('Deve mostrar botão:', hasClientName && clientExists);
    return hasClientName && clientExists;
  };

  // Iniciar exclusão de cliente
  const handleDeleteClient = () => {
    const currentClient = findCurrentClient();
    if (currentClient) {
      setSelectedClient({ id: currentClient.id, name: currentClient.name });
      setShowDeleteConfirm(true);
    }
  };

  // Confirmar exclusão de cliente
  const confirmDeleteClient = () => {
    if (selectedClient) {
      deleteClient(selectedClient.id);
      setFormData(prev => ({
        ...prev,
        clientName: ''
      }));
      setShowDeleteConfirm(false);
      setSelectedClient(null);
    }
  };

  // Cancelar exclusão
  const cancelDeleteClient = () => {
    setShowDeleteConfirm(false);
    setSelectedClient(null);
  };

  // Iniciar exclusão do card
  const handleDeleteCard = () => {
    setShowDeleteCardConfirm(true);
  };

  // Confirmar exclusão do card
  const confirmDeleteCard = () => {
    if (task) {
      // Aqui você pode implementar a lógica para excluir o card
      // Por enquanto, vamos apenas fechar o modal e cancelar
      console.log('Excluindo card:', task.id);
      setShowDeleteCardConfirm(false);
      onCancel(); // Fecha o modal de edição
    }
  };

  // Cancelar exclusão do card
  const cancelDeleteCard = () => {
    setShowDeleteCardConfirm(false);
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
            {task ? 'Editar Entrega' : 'Nova Entrega'}
          </h2>
          <p className="text-white/70 text-sm">
            {task ? 'Edite os dados da entrega' : 'Preencha os dados da nova entrega'}
          </p>
        </div>
      </div>

      {/* Informações do Cliente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="clientName" className="text-white/70 flex items-center gap-2">
            <User className="h-4 w-4" />
            Nome do Cliente *
          </Label>
          <div className="flex gap-2">
            <Input
              id="clientName"
              value={formData.clientName || ''}
              onChange={(e) => handleInputChange('clientName', e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Ex: Família Silva"
              required
            />
            <Button
              type="button"
              onClick={() => setShowClientSelector(true)}
              variant="outline"
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              title="Buscar cliente"
            >
              <Search className="h-4 w-4" />
            </Button>
            {shouldShowDeleteButton() && (
              <Button
                type="button"
                onClick={handleDeleteClient}
                variant="outline"
                className="bg-red-600 border-red-600 text-white hover:bg-red-700"
                title="Excluir cliente"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Seletor de Clientes */}
          {showClientSelector && (
            <div className="absolute z-50 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <div className="p-3 border-b border-gray-600">
                <div className="flex gap-2">
                  <Input
                    placeholder="Buscar cliente..."
                    value={clientSearchTerm}
                    onChange={(e) => setClientSearchTerm(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Button
                    type="button"
                    onClick={() => setShowNewClientForm(true)}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="max-h-40 overflow-y-auto">
                {filteredClients.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => handleSelectClient(client)}
                    className="w-full p-3 text-left hover:bg-gray-700 border-b border-gray-600 last:border-b-0"
                  >
                    <div className="text-white font-medium">{client.name}</div>
                    <div className="text-gray-400 text-sm">{client.email}</div>
                    {client.company && (
                      <div className="text-gray-500 text-xs">{client.company}</div>
                    )}
                  </button>
                ))}
              </div>
              
              <div className="p-2 border-t border-gray-600">
                <Button
                  type="button"
                  onClick={() => setShowClientSelector(false)}
                  variant="outline"
                  className="w-full bg-gray-700 border-gray-600 text-white"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
          
          {/* Formulário de Novo Cliente */}
          {showNewClientForm && (
            <div className="absolute z-50 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-lg p-4">
              <h3 className="text-white font-medium mb-3">Criar Novo Cliente</h3>
              <div className="space-y-3">
                <Input
                  placeholder="Nome completo"
                  value={newClientData.name}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={newClientData.email}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <Input
                  placeholder="Telefone"
                  value={newClientData.phone}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, phone: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <Input
                  placeholder="Empresa (opcional)"
                  value={newClientData.company}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, company: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleCreateClient}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Criar Cliente
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowNewClientForm(false)}
                    variant="outline"
                    className="bg-gray-700 border-gray-600 text-white"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}
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
        {task && (
          <Button
            type="button"
            onClick={handleDeleteCard}
            className="bg-red-600 hover:bg-red-700 text-white flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Excluir Card
          </Button>
        )}
        <Button
          type="submit"
          className="bg-orange-600 hover:bg-orange-700 text-white flex-1"
        >
          {task ? 'Atualizar Entrega' : 'Criar Entrega'}
        </Button>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <X className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Excluir Cliente</h3>
                <p className="text-gray-400 text-sm">Esta ação não pode ser desfeita</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-white">
                Tem certeza que deseja excluir o cliente <strong>{selectedClient?.name}</strong>?
              </p>
              <p className="text-gray-400 text-sm mt-2">
                O cliente será removido permanentemente do sistema e não aparecerá mais em nenhuma página.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={confirmDeleteClient}
                className="bg-red-600 hover:bg-red-700 text-white flex-1"
              >
                Sim, Excluir
              </Button>
              <Button
                type="button"
                onClick={cancelDeleteClient}
                variant="outline"
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão do Card */}
      {showDeleteCardConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <X className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Excluir Card de Entrega</h3>
                <p className="text-gray-400 text-sm">Esta ação não pode ser desfeita</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-white">
                Tem certeza que deseja excluir o card de entrega <strong>{task?.clientName}</strong>?
              </p>
              <p className="text-gray-400 text-sm mt-2">
                O card será removido permanentemente do sistema e não aparecerá mais no kanban.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={confirmDeleteCard}
                className="bg-red-600 hover:bg-red-700 text-white flex-1"
              >
                Sim, Excluir Card
              </Button>
              <Button
                type="button"
                onClick={cancelDeleteCard}
                variant="outline"
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
