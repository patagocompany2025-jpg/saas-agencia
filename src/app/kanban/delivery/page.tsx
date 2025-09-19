'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Target
} from 'lucide-react';
import Link from 'next/link';

// Status do fluxo de entrega
const DELIVERY_STATUS = {
  'confirmado': { name: 'Pagamento Confirmado', color: 'bg-green-500', icon: CheckCircle },
  'planejamento': { name: 'Planejamento', color: 'bg-blue-500', icon: Calendar },
  'preparacao': { name: 'Preparação', color: 'bg-yellow-500', icon: Package },
  'execucao': { name: 'Em Execução', color: 'bg-orange-500', icon: Truck },
  'concluido': { name: 'Concluído', color: 'bg-green-600', icon: CheckCircle },
  'pos-venda': { name: 'Pós-Venda', color: 'bg-purple-500', icon: Heart }
};

// Dados mockados para demonstração
const mockDeliveryTasks = [
  {
    id: '1',
    clientName: 'Família Silva',
    service: 'Pacote Concierge Bariloche - 7 dias',
    value: 15000,
    status: 'confirmado' as keyof typeof DELIVERY_STATUS,
    paymentDate: '2024-01-15',
    startDate: '2024-02-01',
    endDate: '2024-02-07',
    travelers: 4,
    destination: 'Bariloche, Argentina',
    assignedTo: 'Alexandre',
    priority: 'alta' as 'baixa' | 'media' | 'alta',
    notes: 'Cliente VIP - Atendimento especial',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    clientName: 'Casal Johnson',
    service: 'Experiência Gastronômica Premium',
    value: 8500,
    status: 'planejamento' as keyof typeof DELIVERY_STATUS,
    paymentDate: '2024-01-12',
    startDate: '2024-01-25',
    endDate: '2024-01-27',
    travelers: 2,
    destination: 'El Calafate, Argentina',
    assignedTo: 'Amanda',
    priority: 'media' as 'baixa' | 'media' | 'alta',
    notes: 'Reservas em restaurantes Michelin',
    createdAt: '2024-01-08',
    updatedAt: '2024-01-12'
  },
  {
    id: '3',
    clientName: 'Grupo Empresarial ABC',
    service: 'Retiro Corporativo na Patagônia',
    value: 25000,
    status: 'execucao' as keyof typeof DELIVERY_STATUS,
    paymentDate: '2024-01-05',
    startDate: '2024-01-20',
    endDate: '2024-01-24',
    travelers: 12,
    destination: 'Ushuaia, Argentina',
    assignedTo: 'Vitor',
    priority: 'alta' as 'baixa' | 'media' | 'alta',
    notes: 'Evento corporativo - 12 executivos',
    createdAt: '2024-01-02',
    updatedAt: '2024-01-20'
  },
  {
    id: '4',
    clientName: 'Maria Santos',
    service: 'Tour Fotográfico Privado',
    value: 3200,
    status: 'concluido' as keyof typeof DELIVERY_STATUS,
    paymentDate: '2024-01-01',
    startDate: '2024-01-10',
    endDate: '2024-01-12',
    travelers: 1,
    destination: 'Torres del Paine, Chile',
    assignedTo: 'Kyra',
    priority: 'baixa' as 'baixa' | 'media' | 'alta',
    notes: 'Fotógrafa profissional - Tour personalizado',
    createdAt: '2023-12-28',
    updatedAt: '2024-01-12'
  }
];

export default function DeliveryPage() {
  const { user, isLoading } = useAuth();
  const [tasks, setTasks] = useState(mockDeliveryTasks);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-300">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acesso Negado</h1>
          <p className="text-gray-300">Você precisa fazer login para acessar esta página.</p>
        </div>
      </div>
    );
  }

  const filteredTasks = selectedStatus === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === selectedStatus);

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

  return (
    <ModernLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Truck className="h-10 w-10 text-orange-400" />
            Entrega de Serviços
          </h1>
          <p className="text-white/70 text-lg mb-6">
            Acompanhe a execução e entrega dos serviços vendidos
          </p>
          
          {/* Navegação entre sub-menus */}
          <div className="flex justify-center gap-4">
            <Link href="/kanban">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-6 py-3">
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
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-6 py-3">
                <Heart className="h-5 w-5 mr-2" />
                Pós-Venda
              </Button>
            </Link>
          </div>
        </div>

        {/* Filtros */}
        <Card className="bg-white/5 backdrop-blur-2xl border-white/10">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-2">
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
              
              <Button
                onClick={() => setShowForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Entrega
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cards de Status */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(DELIVERY_STATUS).map(([key, status]) => {
            const count = tasks.filter(task => task.status === key).length;
            return (
              <Card key={key} className="bg-white/5 backdrop-blur-2xl border-white/10">
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 ${status.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                    {getStatusIcon(key as keyof typeof DELIVERY_STATUS)}
                  </div>
                  <div className="text-2xl font-bold text-white">{count}</div>
                  <div className="text-white/60 text-sm">{status.name}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Lista de Tarefas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="bg-white/5 backdrop-blur-2xl border-white/10 hover:bg-white/10 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg mb-2">{task.clientName}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(task.status)} text-white`}>
                        {getStatusIcon(task.status)}
                        {DELIVERY_STATUS[task.status].name}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.priority === 'alta' ? 'bg-red-500' : 
                        task.priority === 'media' ? 'bg-yellow-500' : 'bg-green-500'
                      } text-white`}>
                        {task.priority.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="text-white/60 hover:text-white">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-white/60 hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Informações do Serviço */}
                <div>
                  <h4 className="text-white font-medium mb-2">{task.service}</h4>
                  <div className="space-y-2 text-sm text-white/70">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{task.destination}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{task.startDate} - {task.endDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{task.travelers} pessoa(s)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Pago em: {task.paymentDate}</span>
                    </div>
                  </div>
                </div>

                {/* Valor */}
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-400">
                    R$ {task.value.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-white/60 text-sm">Valor total do serviço</div>
                </div>

                {/* Responsável */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {task.assignedTo.charAt(0)}
                    </div>
                    <span className="text-white/70 text-sm">{task.assignedTo}</span>
                  </div>
                </div>

                {/* Notas */}
                {task.notes && (
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-white/70 text-sm">{task.notes}</div>
                  </div>
                )}

                {/* Ações */}
                <div className="flex gap-2">
                  {task.status !== 'concluido' && (
                    <Button
                      onClick={() => {
                        const statusKeys = Object.keys(DELIVERY_STATUS) as Array<keyof typeof DELIVERY_STATUS>;
                        const currentIndex = statusKeys.indexOf(task.status);
                        if (currentIndex < statusKeys.length - 1) {
                          moveTask(task.id, statusKeys[currentIndex + 1]);
                        }
                      }}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Avançar
                    </Button>
                  )}
                  <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
                    <Phone className="h-4 w-4 mr-2" />
                    Contatar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mensagem quando não há tarefas */}
        {filteredTasks.length === 0 && (
          <Card className="bg-white/5 backdrop-blur-2xl border-white/10">
            <CardContent className="p-12 text-center">
              <Truck className="h-16 w-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhuma entrega encontrada</h3>
              <p className="text-white/60 mb-6">
                {selectedStatus === 'all' 
                  ? 'Não há entregas cadastradas no sistema.'
                  : `Não há entregas no status "${DELIVERY_STATUS[selectedStatus as keyof typeof DELIVERY_STATUS].name}".`
                }
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Nova Entrega
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ModernLayout>
  );
}
