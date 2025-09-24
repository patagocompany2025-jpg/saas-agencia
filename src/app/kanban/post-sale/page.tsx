'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ModernLayout } from '@/components/layout/ModernLayout';
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
  Truck,
  Settings,
  Save,
  X,
  Search,
  Filter,
  FileText,
  Eye,
  User,
  Lightbulb,
  TrendingUp,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Zap,
  Crown,
  Sparkles,
  Snowflake,
  Camera
} from 'lucide-react';
import Link from 'next/link';

// Status do pós-venda
const POST_SALE_STATUS = {
  'aguardando': { 
    name: 'Aguardando Feedback', 
    color: 'bg-yellow-500', 
    icon: Clock,
    description: 'Aguardando retorno do cliente'
  },
  'contato': { 
    name: 'Em Contato', 
    color: 'bg-blue-500', 
    icon: Phone,
    description: 'Em comunicação com o cliente'
  },
  'satisfeito': { 
    name: 'Cliente Satisfeito', 
    color: 'bg-green-500', 
    icon: ThumbsUp,
    description: 'Cliente demonstrou satisfação'
  },
  'reclamacao': { 
    name: 'Reclamação', 
    color: 'bg-red-500', 
    icon: AlertCircle,
    description: 'Cliente apresentou reclamação'
  },
  'fidelizado': { 
    name: 'Cliente Fidelizado', 
    color: 'bg-purple-500', 
    icon: Heart,
    description: 'Cliente fidelizado para futuros serviços'
  },
  'indicacao': { 
    name: 'Indicação Recebida', 
    color: 'bg-emerald-500', 
    icon: Gift,
    description: 'Cliente fez indicações para outros'
  }
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
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState(mockPostSaleTasks);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showPageSettings, setShowPageSettings] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [pageSettings, setPageSettings] = useState({
    showValueCounters: true,
    showStageDescriptions: true,
    enableDragDrop: true,
    showSearchByDefault: true,
    showAdvancedFilters: false,
    showSatisfactionMetrics: true,
    showSatisfactionRating: true,
    showClientFeedback: true,
    showNextContact: true,
    showAssignedTo: true,
    showEditButton: true,
    showDeleteButton: true,
    showViewButton: true,
    showContactButton: true,
    notifyFeedbackReceived: true,
    notifyComplaints: true,
    notifyIndications: true,
    notifyNextContacts: true
  });

  // Carregar configurações salvas do localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('postSalePageSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setPageSettings(parsedSettings);
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    }
  }, []);

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

  const getPriorityColor = (priority: 'baixa' | 'media' | 'alta') => {
    switch (priority) {
      case 'alta': return 'bg-red-500';
      case 'media': return 'bg-yellow-500';
      case 'baixa': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
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

  const handleDrop = (e: React.DragEvent, targetStatus: keyof typeof POST_SALE_STATUS) => {
    e.preventDefault();
    
    if (!draggedTask) return;

    moveTask(draggedTask, targetStatus);
    setDraggedTask(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  // Funções para os botões de ações rápidas
  const handleSaveSettings = () => {
    // Salvar configurações no localStorage
    localStorage.setItem('postSalePageSettings', JSON.stringify(pageSettings));
    
    // Mostrar feedback visual
    const button = document.querySelector('[data-save-settings]') as HTMLButtonElement;
    if (button) {
      const originalText = button.innerHTML;
      button.innerHTML = '<CheckCircle className="w-4 h-4 mr-2 inline" />Salvo!';
      button.className = 'px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all';
      
      setTimeout(() => {
        button.innerHTML = originalText;
        button.className = 'px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all';
      }, 2000);
    }
  };

  const handleExportSettings = () => {
    // Criar arquivo JSON com as configurações
    const dataStr = JSON.stringify(pageSettings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    // Criar link de download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'configuracoes-pos-venda.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleResetSettings = () => {
    // Resetar para configurações padrão
    const defaultSettings = {
      showValueCounters: true,
      showStageDescriptions: true,
      enableDragDrop: true,
      showSearchByDefault: true,
      showAdvancedFilters: false,
      showSatisfactionMetrics: true,
      showSatisfactionRating: true,
      showClientFeedback: true,
      showNextContact: true,
      showAssignedTo: true,
      showEditButton: true,
      showDeleteButton: true,
      showViewButton: true,
      showContactButton: true,
      notifyFeedbackReceived: true,
      notifyComplaints: true,
      notifyIndications: true,
      notifyNextContacts: true
    };
    
    setPageSettings(defaultSettings);
    
    // Mostrar feedback visual
    const button = document.querySelector('[data-reset-settings]') as HTMLButtonElement;
    if (button) {
      const originalText = button.innerHTML;
      button.innerHTML = '<CheckCircle className="w-4 h-4 mr-2 inline" />Resetado!';
      button.className = 'px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg text-sm font-medium transition-all';
      
      setTimeout(() => {
        button.innerHTML = originalText;
        button.className = 'px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-medium transition-all';
      }, 2000);
    }
  };

  // Sistema de Sugestões Inteligentes
  const generateSuggestions = (task: any) => {
    const suggestions = [];
    const clientValue = task.value;
    const service = task.service.toLowerCase();
    const satisfaction = task.satisfaction || 0;
    const priority = task.priority;
    
    // Sugestões baseadas no valor do serviço
    if (clientValue >= 20000) {
      suggestions.push({
        id: 'luxury-upgrade',
        type: 'upgrade',
        title: 'Upgrade para Experiência Premium',
        description: 'Cliente de alto valor - oferecer pacote VIP com serviços exclusivos',
        potentialRevenue: clientValue * 0.3,
        confidence: 85,
        icon: Crown,
        color: 'bg-purple-500',
        action: 'Contatar para upgrade VIP'
      });
    }
    
    // Sugestões baseadas no tipo de serviço
    if (service.includes('concierge') || service.includes('premium')) {
      suggestions.push({
        id: 'repeat-booking',
        type: 'repeat',
        title: 'Reserva de Repetição',
        description: 'Oferecer desconto para próxima temporada na Patagônia',
        potentialRevenue: clientValue * 0.8,
        confidence: 75,
        icon: Calendar,
        color: 'bg-blue-500',
        action: 'Propor reserva antecipada'
      });
    }
    
    if (service.includes('fotográfico') || service.includes('fotos')) {
      suggestions.push({
        id: 'photo-package',
        type: 'cross-sell',
        title: 'Pacote Fotográfico Estendido',
        description: 'Oferecer sessão adicional em diferentes locais da Patagônia',
        potentialRevenue: clientValue * 0.6,
        confidence: 70,
        icon: Camera,
        color: 'bg-pink-500',
        action: 'Propor sessão adicional'
      });
    }
    
    if (service.includes('corporativo') || service.includes('empresarial')) {
      suggestions.push({
        id: 'corporate-repeat',
        type: 'repeat',
        title: 'Evento Corporativo Anual',
        description: 'Propor contrato anual para eventos corporativos',
        potentialRevenue: clientValue * 2.5,
        confidence: 80,
        icon: Users,
        color: 'bg-indigo-500',
        action: 'Propor contrato anual'
      });
    }
    
    // Sugestões baseadas na satisfação
    if (satisfaction >= 4) {
      suggestions.push({
        id: 'referral-program',
        type: 'referral',
        title: 'Programa de Indicações',
        description: 'Cliente satisfeito - oferecer benefícios por indicações',
        potentialRevenue: clientValue * 0.2,
        confidence: 90,
        icon: Gift,
        color: 'bg-emerald-500',
        action: 'Ativar programa de indicações'
      });
    }
    
    // Sugestões baseadas na prioridade
    if (priority === 'alta') {
      suggestions.push({
        id: 'priority-service',
        type: 'service',
        title: 'Serviço Prioritário',
        description: 'Oferecer atendimento VIP e benefícios exclusivos',
        potentialRevenue: clientValue * 0.15,
        confidence: 85,
        icon: Star,
        color: 'bg-yellow-500',
        action: 'Ativar atendimento VIP'
      });
    }
    
    // Sugestões sazonais
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 5 && currentMonth <= 8) { // Inverno na Patagônia
      suggestions.push({
        id: 'winter-experience',
        type: 'seasonal',
        title: 'Experiência de Inverno',
        description: 'Oferecer atividades de inverno na Patagônia',
        potentialRevenue: clientValue * 0.4,
        confidence: 65,
        icon: Snowflake,
        color: 'bg-cyan-500',
        action: 'Propor experiência de inverno'
      });
    }
    
    return suggestions.slice(0, 3); // Máximo 3 sugestões por cliente
  };

  // Calcular sugestões para todos os clientes
  const allSuggestions = tasks.map(task => ({
    client: task,
    suggestions: generateSuggestions(task)
  })).filter(item => item.suggestions.length > 0);

  const totalPotentialRevenue = allSuggestions.reduce((total, item) => 
    total + item.suggestions.reduce((sum, sug) => sum + sug.potentialRevenue, 0), 0
  );

  // Funções para os botões das ofertas
  const handleOfferAction = (action: string, clientName: string, suggestionTitle: string) => {
    // Simular ação da oferta
    const message = `Ação "${action}" executada para ${clientName} - ${suggestionTitle}`;
    
    // Mostrar feedback visual
    const button = event?.target as HTMLButtonElement;
    if (button) {
      const originalText = button.textContent;
      button.textContent = '✓ Executado!';
      button.className = 'w-full mt-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-all';
      
      setTimeout(() => {
        button.textContent = originalText;
        button.className = 'w-full mt-2 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium transition-all';
      }, 2000);
    }
    
    // Aqui você pode adicionar lógica real como:
    // - Abrir modal de contato
    // - Enviar email automático
    // - Criar tarefa de follow-up
    // - Registrar no CRM
    console.log(message);
  };

  // Funções para os botões de ações rápidas
  const handleGenerateReport = () => {
    // Gerar relatório de oportunidades
    const reportData = {
      totalPotentialRevenue,
      totalClients: allSuggestions.length,
      totalSuggestions: allSuggestions.reduce((total, item) => total + item.suggestions.length, 0),
      suggestionsByType: allSuggestions.reduce((acc, item) => {
        item.suggestions.forEach(sug => {
          acc[sug.type] = (acc[sug.type] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      generatedAt: new Date().toISOString()
    };

    // Criar e baixar relatório
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'relatorio-oportunidades-pos-venda.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCreateUpsellCampaign = () => {
    // Criar campanha de upsell
    const campaignData = {
      name: 'Campanha de Upsell - Pós-Venda',
      targetClients: allSuggestions.map(item => ({
        clientName: item.client.clientName,
        currentValue: item.client.value,
        potentialRevenue: item.suggestions.reduce((sum, sug) => sum + sug.potentialRevenue, 0),
        suggestions: item.suggestions.map(sug => sug.title)
      })),
      totalPotentialRevenue,
      createdAt: new Date().toISOString()
    };

    // Simular criação da campanha
    console.log('Campanha de Upsell criada:', campaignData);
    
    // Mostrar feedback visual
    const button = event?.target as HTMLButtonElement;
    if (button) {
      const originalText = button.textContent;
      button.textContent = '✓ Campanha Criada!';
      button.className = 'px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all';
      
      setTimeout(() => {
        button.textContent = originalText;
        button.className = 'px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all';
      }, 2000);
    }
  };

  const handleActivateLoyaltyProgram = () => {
    // Ativar programa de fidelidade
    const loyaltyProgram = {
      name: 'Programa de Fidelidade Patagônia',
      benefits: [
        'Desconto de 10% em próximas viagens',
        'Upgrade gratuito de quarto',
        'Acesso a experiências exclusivas',
        'Pontos por indicações',
        'Atendimento prioritário'
      ],
      targetClients: allSuggestions.filter(item => 
        item.client.satisfaction && item.client.satisfaction >= 4
      ).map(item => item.client.clientName),
      activatedAt: new Date().toISOString()
    };

    // Simular ativação do programa
    console.log('Programa de Fidelidade ativado:', loyaltyProgram);
    
    // Mostrar feedback visual
    const button = event?.target as HTMLButtonElement;
    if (button) {
      const originalText = button.textContent;
      button.textContent = '✓ Programa Ativado!';
      button.className = 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all';
      
      setTimeout(() => {
        button.textContent = originalText;
        button.className = 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all';
      }, 2000);
    }
  };

  // Filtrar tarefas
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    const matchesSearch = searchTerm === '' || 
      task.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
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
              <Heart className="h-10 w-10 text-pink-400" />
              Pós-Venda
            </h1>
            <div className="flex-1 flex justify-end gap-3">
              <Button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className={`px-4 py-2 ${showSuggestions ? 'bg-pink-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Sugestões Inteligentes
              </Button>
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
            Acompanhe a satisfação e fidelização dos clientes
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
                  placeholder="Buscar por cliente, serviço ou responsável..."
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
        </div>

        {/* Cards de Status Resumidos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(POST_SALE_STATUS).map(([key, status]) => {
            const count = tasks.filter(task => task.status === key).length;
            const totalValue = tasks
              .filter(task => task.status === key)
              .reduce((sum, task) => sum + task.value, 0);
            
            return (
              <div key={key} className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-lg p-4 text-center hover:bg-white/10 transition-all">
                <div className={`w-12 h-12 ${status.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                  {getStatusIcon(key as keyof typeof POST_SALE_STATUS)}
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

        {/* Métricas de Satisfação */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">4.2</div>
            <div className="text-white/60">Satisfação Média</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">85%</div>
            <div className="text-white/60">Taxa de Fidelização</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">12</div>
            <div className="text-white/60">Indicações Recebidas</div>
          </div>
        </div>

        {/* Sugestões Inteligentes */}
        {showSuggestions && (
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-xl">Sugestões Inteligentes de Pós-Venda</h3>
                  <p className="text-white/60">Oportunidades personalizadas para aumentar o lucro</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSuggestions(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resumo das Oportunidades */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  R$ {totalPotentialRevenue.toLocaleString('pt-BR')}
                </div>
                <div className="text-white/60 text-sm">Receita Potencial</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {allSuggestions.length}
                </div>
                <div className="text-white/60 text-sm">Clientes com Oportunidades</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {allSuggestions.reduce((total, item) => total + item.suggestions.length, 0)}
                </div>
                <div className="text-white/60 text-sm">Sugestões Geradas</div>
              </div>
            </div>

            {/* Lista de Sugestões por Cliente */}
            <div className="space-y-4">
              {allSuggestions.map((item, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {item.client.clientName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{item.client.clientName}</h4>
                        <p className="text-white/60 text-sm">{item.client.service}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.client.status)} text-white`}>
                            {POST_SALE_STATUS[item.client.status].name}
                          </div>
                          <div className="text-green-400 text-sm font-medium">
                            R$ {item.client.value.toLocaleString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white/60 text-sm">Receita Potencial</div>
                      <div className="text-green-400 font-semibold">
                        R$ {item.suggestions.reduce((sum, sug) => sum + sug.potentialRevenue, 0).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {item.suggestions.map((suggestion, sugIndex) => {
                      const IconComponent = suggestion.icon;
                      return (
                        <div key={sugIndex} className="bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-all">
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 ${suggestion.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <IconComponent className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-white font-medium text-sm mb-1">{suggestion.title}</h5>
                              <p className="text-white/60 text-xs mb-2">{suggestion.description}</p>
                              <div className="flex items-center justify-between">
                                <div className="text-green-400 font-semibold text-sm">
                                  R$ {suggestion.potentialRevenue.toLocaleString('pt-BR')}
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                  <span className="text-white/60 text-xs">{suggestion.confidence}%</span>
                                </div>
                              </div>
                              <button 
                                onClick={() => handleOfferAction(suggestion.action, item.client.clientName, suggestion.title)}
                                className="w-full mt-2 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium transition-all"
                              >
                                {suggestion.action}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Ações Rápidas das Sugestões */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex gap-3">
                <button 
                  onClick={handleGenerateReport}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm font-medium transition-all"
                >
                  <Sparkles className="w-4 h-4 mr-2 inline" />
                  Gerar Relatório de Oportunidades
                </button>
                <button 
                  onClick={handleCreateUpsellCampaign}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all"
                >
                  <TrendingUp className="w-4 h-4 mr-2 inline" />
                  Criar Campanha de Upsell
                </button>
                <button 
                  onClick={handleActivateLoyaltyProgram}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all"
                >
                  <Users className="w-4 h-4 mr-2 inline" />
                  Ativar Programa de Fidelidade
                </button>
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
                        <input 
                          type="checkbox" 
                          checked={pageSettings.showValueCounters}
                          onChange={(e) => setPageSettings(prev => ({ ...prev, showValueCounters: e.target.checked }))}
                          className="rounded" 
                        />
                        Mostrar contadores de valor
                      </label>
                      <label className="flex items-center gap-2 text-white/70 text-sm">
                        <input 
                          type="checkbox" 
                          checked={pageSettings.showStageDescriptions}
                          onChange={(e) => setPageSettings(prev => ({ ...prev, showStageDescriptions: e.target.checked }))}
                          className="rounded" 
                        />
                        Mostrar descrições das etapas
                      </label>
                      <label className="flex items-center gap-2 text-white/70 text-sm">
                        <input 
                          type="checkbox" 
                          checked={pageSettings.enableDragDrop}
                          onChange={(e) => setPageSettings(prev => ({ ...prev, enableDragDrop: e.target.checked }))}
                          className="rounded" 
                        />
                        Habilitar drag and drop
                      </label>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4">
                    <h5 className="text-white font-medium mb-2">Filtros Padrão</h5>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-white/70 text-sm">
                        <input 
                          type="checkbox" 
                          checked={pageSettings.showSearchByDefault}
                          onChange={(e) => setPageSettings(prev => ({ ...prev, showSearchByDefault: e.target.checked }))}
                          className="rounded" 
                        />
                        Mostrar busca por padrão
                      </label>
                      <label className="flex items-center gap-2 text-white/70 text-sm">
                        <input 
                          type="checkbox" 
                          checked={pageSettings.showAdvancedFilters}
                          onChange={(e) => setPageSettings(prev => ({ ...prev, showAdvancedFilters: e.target.checked }))}
                          className="rounded" 
                        />
                        Mostrar filtros avançados
                      </label>
                      <label className="flex items-center gap-2 text-white/70 text-sm">
                        <input 
                          type="checkbox" 
                          checked={pageSettings.showSatisfactionMetrics}
                          onChange={(e) => setPageSettings(prev => ({ ...prev, showSatisfactionMetrics: e.target.checked }))}
                          className="rounded" 
                        />
                        Mostrar métricas de satisfação
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
                        <input 
                          type="checkbox" 
                          checked={pageSettings.showSatisfactionRating}
                          onChange={(e) => setPageSettings(prev => ({ ...prev, showSatisfactionRating: e.target.checked }))}
                          className="rounded" 
                        />
                        Mostrar avaliação de satisfação
                      </label>
                      <label className="flex items-center gap-2 text-white/70 text-sm">
                        <input 
                          type="checkbox" 
                          checked={pageSettings.showClientFeedback}
                          onChange={(e) => setPageSettings(prev => ({ ...prev, showClientFeedback: e.target.checked }))}
                          className="rounded" 
                        />
                        Mostrar feedback do cliente
                      </label>
                      <label className="flex items-center gap-2 text-white/70 text-sm">
                        <input 
                          type="checkbox" 
                          checked={pageSettings.showNextContact}
                          onChange={(e) => setPageSettings(prev => ({ ...prev, showNextContact: e.target.checked }))}
                          className="rounded" 
                        />
                        Mostrar próximo contato
                      </label>
                      <label className="flex items-center gap-2 text-white/70 text-sm">
                        <input 
                          type="checkbox" 
                          checked={pageSettings.showAssignedTo}
                          onChange={(e) => setPageSettings(prev => ({ ...prev, showAssignedTo: e.target.checked }))}
                          className="rounded" 
                        />
                        Mostrar responsável
                      </label>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4">
                    <h5 className="text-white font-medium mb-2">Ações dos Cards</h5>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-white/70 text-sm">
                        <input 
                          type="checkbox" 
                          checked={pageSettings.showEditButton}
                          onChange={(e) => setPageSettings(prev => ({ ...prev, showEditButton: e.target.checked }))}
                          className="rounded" 
                        />
                        Botão Editar
                      </label>
                      <label className="flex items-center gap-2 text-white/70 text-sm">
                        <input 
                          type="checkbox" 
                          checked={pageSettings.showDeleteButton}
                          onChange={(e) => setPageSettings(prev => ({ ...prev, showDeleteButton: e.target.checked }))}
                          className="rounded" 
                        />
                        Botão Excluir
                      </label>
                      <label className="flex items-center gap-2 text-white/70 text-sm">
                        <input 
                          type="checkbox" 
                          checked={pageSettings.showViewButton}
                          onChange={(e) => setPageSettings(prev => ({ ...prev, showViewButton: e.target.checked }))}
                          className="rounded" 
                        />
                        Botão Visualizar
                      </label>
                      <label className="flex items-center gap-2 text-white/70 text-sm">
                        <input 
                          type="checkbox" 
                          checked={pageSettings.showContactButton}
                          onChange={(e) => setPageSettings(prev => ({ ...prev, showContactButton: e.target.checked }))}
                          className="rounded" 
                        />
                        Botão Contatar
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
                      <input 
                        type="checkbox" 
                        checked={pageSettings.notifyFeedbackReceived}
                        onChange={(e) => setPageSettings(prev => ({ ...prev, notifyFeedbackReceived: e.target.checked }))}
                        className="rounded" 
                      />
                      Notificar sobre feedback recebido
                    </label>
                    <label className="flex items-center gap-2 text-white/70 text-sm">
                      <input 
                        type="checkbox" 
                        checked={pageSettings.notifyComplaints}
                        onChange={(e) => setPageSettings(prev => ({ ...prev, notifyComplaints: e.target.checked }))}
                        className="rounded" 
                      />
                      Notificar sobre reclamações
                    </label>
                    <label className="flex items-center gap-2 text-white/70 text-sm">
                      <input 
                        type="checkbox" 
                        checked={pageSettings.notifyIndications}
                        onChange={(e) => setPageSettings(prev => ({ ...prev, notifyIndications: e.target.checked }))}
                        className="rounded" 
                      />
                      Notificar sobre indicações
                    </label>
                    <label className="flex items-center gap-2 text-white/70 text-sm">
                      <input 
                        type="checkbox" 
                        checked={pageSettings.notifyNextContacts}
                        onChange={(e) => setPageSettings(prev => ({ ...prev, notifyNextContacts: e.target.checked }))}
                        className="rounded" 
                      />
                      Notificar sobre próximos contatos
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <h4 className="text-white font-medium mb-4">Ações Rápidas</h4>
                <div className="flex gap-3">
                  <button 
                    onClick={handleSaveSettings}
                    data-save-settings
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all"
                  >
                    <Save className="w-4 h-4 mr-2 inline" />
                    Salvar Configurações
                  </button>
                  <button 
                    onClick={handleExportSettings}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-all"
                  >
                    <FileText className="w-4 h-4 mr-2 inline" />
                    Exportar Configuração
                  </button>
                  <button 
                    onClick={handleResetSettings}
                    data-reset-settings
                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-medium transition-all"
                  >
                    <Trash2 className="w-4 h-4 mr-2 inline" />
                    Resetar Padrões
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Kanban Board */}
        <div className="kanban-scroll overflow-x-auto overflow-y-visible scrollbar-width: thin scrollbar-color: rgba(255, 255, 255, 0.3) transparent min-height: 100px padding-bottom: 20px">
          <div className="flex gap-6 min-w-max" style={{ minWidth: 'calc(100vw - 200px)' }}>
            {Object.entries(POST_SALE_STATUS).map(([statusKey, status]) => {
              const statusTasks = filteredTasks.filter(task => task.status === statusKey);
              
              return (
                <div 
                  key={statusKey}
                  className="w-80 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-lg p-4 min-h-[600px]"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, statusKey as keyof typeof POST_SALE_STATUS)}
                >
                  {/* Header da Coluna */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 ${status.color} rounded-lg flex items-center justify-center`}>
                        {getStatusIcon(statusKey as keyof typeof POST_SALE_STATUS)}
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
                                {task.assignedTo}
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
                            <Calendar className="h-3 w-3" />
                            <span>Concluído: {task.completionDate}</span>
                          </div>
                          {task.feedbackDate && (
                            <div className="flex items-center gap-1 text-xs text-white/60">
                              <MessageCircle className="h-3 w-3" />
                              <span>Feedback: {task.feedbackDate}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-xs text-white/60">
                            <Calendar className="h-3 w-3" />
                            <span>Próximo: {task.nextContact}</span>
                          </div>
                        </div>

                        {/* Avaliação */}
                        {task.satisfaction && (
                          <div className="bg-white/5 rounded-lg p-2 mb-3">
                            <div className="flex items-center justify-between">
                              <span className="text-white/70 text-xs">Satisfação:</span>
                              {renderStars(task.satisfaction)}
                            </div>
                          </div>
                        )}

                        {/* Feedback */}
                        {task.feedback && (
                          <div className="bg-white/5 rounded-lg p-2 mb-3">
                            <div className="text-white/70 text-xs mb-1">Feedback:</div>
                            <div className="text-white text-xs italic">"{task.feedback}"</div>
                          </div>
                        )}

                        {/* Valor */}
                        <div className="bg-white/5 rounded-lg p-2 mb-3">
                          <div className="text-lg font-bold text-green-400">
                            R$ {task.value.toLocaleString('pt-BR')}
                          </div>
                        </div>

                        {/* Notas */}
                        {task.notes && (
                          <div className="bg-white/5 rounded-lg p-2">
                            <div className="text-white/70 text-xs">{task.notes}</div>
                          </div>
                        )}
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
            <Heart className="h-16 w-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhum pós-venda encontrado</h3>
            <p className="text-white/60 mb-6">
              {searchTerm ? 'Nenhum pós-venda corresponde aos critérios de busca.' : 'Não há atividades de pós-venda cadastradas no sistema.'}
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-pink-600 hover:bg-pink-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Nova Atividade
            </Button>
          </div>
        )}
      </div>
    </ModernLayout>
  );
}