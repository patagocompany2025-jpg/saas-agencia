'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Star, 
  MessageCircle, 
  Phone, 
  Mail, 
  Calendar, 
  Users, 
  MapPin, 
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  ThumbsUp,
  Gift,
  Award,
  Target,
  Truck
} from 'lucide-react';
import Link from 'next/link';

// Status do pós-venda
const POST_SALE_STATUS = {
  'aguardando': { name: 'Aguardando Feedback', color: 'bg-yellow-500', icon: Clock },
  'contato': { name: 'Em Contato', color: 'bg-blue-500', icon: Phone },
  'satisfeito': { name: 'Cliente Satisfeito', color: 'bg-green-500', icon: ThumbsUp },
  'reclamacao': { name: 'Reclamação', color: 'bg-red-500', icon: AlertCircle },
  'fidelizado': { name: 'Cliente Fidelizado', color: 'bg-purple-500', icon: Heart },
  'indicacao': { name: 'Indicação Recebida', color: 'bg-emerald-500', icon: Gift }
};

// Dados mockados para demonstração
const mockPostSaleTasks = [
  {
    id: '1',
    clientName: 'Família Silva',
    service: 'Pacote Concierge Bariloche - 7 dias',
    value: 15000,
    status: 'satisfeito' as keyof typeof POST_SALE_STATUS,
    completionDate: '2024-02-07',
    feedbackDate: '2024-02-10',
    satisfaction: 5,
    feedback: 'Experiência incrível! Superou todas as expectativas. Recomendamos para todos os amigos.',
    nextContact: '2024-03-07',
    assignedTo: 'Alexandre',
    priority: 'media' as 'baixa' | 'media' | 'alta',
    notes: 'Cliente muito satisfeito - possível indicação',
    createdAt: '2024-02-07',
    updatedAt: '2024-02-10'
  },
  {
    id: '2',
    clientName: 'Casal Johnson',
    service: 'Experiência Gastronômica Premium',
    value: 8500,
    status: 'contato' as keyof typeof POST_SALE_STATUS,
    completionDate: '2024-01-27',
    feedbackDate: null,
    satisfaction: null,
    feedback: null,
    nextContact: '2024-02-03',
    assignedTo: 'Amanda',
    priority: 'alta' as 'baixa' | 'media' | 'alta',
    notes: 'Ligar para verificar satisfação',
    createdAt: '2024-01-27',
    updatedAt: '2024-01-30'
  },
  {
    id: '3',
    clientName: 'Grupo Empresarial ABC',
    service: 'Retiro Corporativo na Patagônia',
    value: 25000,
    status: 'fidelizado' as keyof typeof POST_SALE_STATUS,
    completionDate: '2024-01-24',
    feedbackDate: '2024-01-28',
    satisfaction: 5,
    feedback: 'Excelente organização! Já queremos repetir no próximo ano.',
    nextContact: '2024-06-24',
    assignedTo: 'Vitor',
    priority: 'alta' as 'baixa' | 'media' | 'alta',
    notes: 'Cliente fidelizado - agendar próximo evento',
    createdAt: '2024-01-24',
    updatedAt: '2024-01-28'
  },
  {
    id: '4',
    clientName: 'Maria Santos',
    service: 'Tour Fotográfico Privado',
    value: 3200,
    status: 'indicacao' as keyof typeof POST_SALE_STATUS,
    completionDate: '2024-01-12',
    feedbackDate: '2024-01-15',
    satisfaction: 5,
    feedback: 'Fotos lindas! Já indiquei para 3 amigas.',
    nextContact: '2024-04-12',
    assignedTo: 'Kyra',
    priority: 'baixa' as 'baixa' | 'media' | 'alta',
    notes: 'Recebeu 3 indicações - acompanhar conversões',
    createdAt: '2024-01-12',
    updatedAt: '2024-01-15'
  },
  {
    id: '5',
    clientName: 'João Oliveira',
    service: 'Aventura na Patagônia',
    value: 12000,
    status: 'reclamacao' as keyof typeof POST_SALE_STATUS,
    completionDate: '2024-01-20',
    feedbackDate: '2024-01-22',
    satisfaction: 2,
    feedback: 'O guia não estava preparado e o tempo estava ruim. Esperava mais.',
    nextContact: '2024-01-25',
    assignedTo: 'Alex',
    priority: 'alta' as 'baixa' | 'media' | 'alta',
    notes: 'Reclamação sobre guia e clima - oferecer desconto',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-22'
  }
];

export default function PostSalePage() {
  const { user, isLoading } = useAuth();
  const [tasks, setTasks] = useState(mockPostSaleTasks);
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

  const moveTask = (taskId: string, newStatus: keyof typeof POST_SALE_STATUS) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] } : task
    ));
  };

  const getStatusColor = (status: keyof typeof POST_SALE_STATUS) => {
    return POST_SALE_STATUS[status].color;
  };

  const getStatusIcon = (status: keyof typeof POST_SALE_STATUS) => {
    const IconComponent = POST_SALE_STATUS[status].icon;
    return <IconComponent className="w-4 h-4" />;
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-white/40">Sem avaliação</span>;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-white/30'
            }`}
          />
        ))}
        <span className="text-white/70 text-sm ml-2">{rating}/5</span>
      </div>
    );
  };

  return (
    <ModernLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Heart className="h-10 w-10 text-pink-400" />
            Pós-Venda
          </h1>
          <p className="text-white/70 text-lg mb-6">
            Acompanhe a satisfação e fidelização dos clientes
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
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-6 py-3">
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
                {Object.entries(POST_SALE_STATUS).map(([key, status]) => (
                  <Button
                    key={key}
                    onClick={() => setSelectedStatus(key)}
                    className={`px-4 py-2 flex items-center gap-2 ${
                      selectedStatus === key 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {getStatusIcon(key as keyof typeof POST_SALE_STATUS)}
                    {status.name}
                  </Button>
                ))}
              </div>
              
              <Button
                onClick={() => setShowForm(true)}
                className="bg-pink-600 hover:bg-pink-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Pós-Venda
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cards de Status */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(POST_SALE_STATUS).map(([key, status]) => {
            const count = tasks.filter(task => task.status === key).length;
            return (
              <Card key={key} className="bg-white/5 backdrop-blur-2xl border-white/10">
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 ${status.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                    {getStatusIcon(key as keyof typeof POST_SALE_STATUS)}
                  </div>
                  <div className="text-2xl font-bold text-white">{count}</div>
                  <div className="text-white/60 text-sm">{status.name}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Métricas de Satisfação */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/5 backdrop-blur-2xl border-white/10">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">4.2</div>
              <div className="text-white/60">Satisfação Média</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-2xl border-white/10">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">85%</div>
              <div className="text-white/60">Taxa de Fidelização</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-2xl border-white/10">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">12</div>
              <div className="text-white/60">Indicações Recebidas</div>
            </CardContent>
          </Card>
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
                        {POST_SALE_STATUS[task.status].name}
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
                      <Calendar className="h-4 w-4" />
                      <span>Concluído em: {task.completionDate}</span>
                    </div>
                    {task.feedbackDate && (
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        <span>Feedback em: {task.feedbackDate}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Próximo contato: {task.nextContact}</span>
                    </div>
                  </div>
                </div>

                {/* Avaliação */}
                {task.satisfaction && (
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/70 text-sm">Satisfação:</span>
                      {renderStars(task.satisfaction)}
                    </div>
                  </div>
                )}

                {/* Feedback */}
                {task.feedback && (
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-white/70 text-sm mb-1">Feedback:</div>
                    <div className="text-white text-sm italic">"{task.feedback}"</div>
                  </div>
                )}

                {/* Valor */}
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-400">
                    R$ {task.value.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-white/60 text-sm">Valor do serviço</div>
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
                  <Button
                    onClick={() => {
                      const statusKeys = Object.keys(POST_SALE_STATUS) as Array<keyof typeof POST_SALE_STATUS>;
                      const currentIndex = statusKeys.indexOf(task.status);
                      if (currentIndex < statusKeys.length - 1) {
                        moveTask(task.id, statusKeys[currentIndex + 1]);
                      }
                    }}
                    className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
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
              <Heart className="h-16 w-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum pós-venda encontrado</h3>
              <p className="text-white/60 mb-6">
                {selectedStatus === 'all' 
                  ? 'Não há atividades de pós-venda cadastradas no sistema.'
                  : `Não há atividades no status "${POST_SALE_STATUS[selectedStatus as keyof typeof POST_SALE_STATUS].name}".`
                }
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-pink-600 hover:bg-pink-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Nova Atividade
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ModernLayout>
  );
}
