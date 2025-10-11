'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { KanbanTask } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface KanbanContextType {
  tasks: KanbanTask[];
  addTask: (taskData: Omit<KanbanTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, taskData: Partial<Omit<KanbanTask, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, newStatus: KanbanTask['status']) => void;
  getTasksByStatus: (status: KanbanTask['status']) => KanbanTask[];
  getTotalValue: (status: KanbanTask['status']) => number;
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

export function KanbanProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Verificar se está no navegador (não no servidor)
    if (typeof window === 'undefined') return;

    console.log('Carregando tarefas do localStorage...');
    const savedTasks = localStorage.getItem('kanbanTasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks).map((task: {
          id: string;
          title: string;
          description: string;
          status: string;
          priority: string;
          dueDate: string;
          createdAt: string;
          updatedAt: string;
          userId: string;
          clientId: string;
        }) => ({
          ...task,
          // Garantir que os novos campos tenham valores padrão
          travelDates: (task as Record<string, unknown>).travelDates || {},
          travelers: (task as Record<string, unknown>).travelers || { adults: 1, children: 0, infants: 0 },
          budget: (task as Record<string, unknown>).budget || { disclosed: false },
          interests: (task as Record<string, unknown>).interests || [],
          accommodation: (task as Record<string, unknown>).accommodation || { type: 'hotel', category: 'medio' },
          nextAction: (task as Record<string, unknown>).nextAction || null,
          source: (task as Record<string, unknown>).source || 'outros',
          expectedValue: (task as Record<string, unknown>).expectedValue || 0,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
        }));
        console.log('Tarefas carregadas:', parsedTasks.length);
        setTasks(parsedTasks);
      } catch (error) {
        console.error('Erro ao carregar tarefas do localStorage:', error);
        setTasks([]);
      }
    } else {
      console.log('Nenhuma tarefa salva encontrada, criando dados iniciais...');
      // Mock initial tasks if none are saved
      const initialTasks: KanbanTask[] = [
        {
          id: uuidv4(),
          clientId: '1',
          title: 'Patagônia Aventura - Alice Johnson',
          status: 'prospeccao',
          priority: 'alta',
          value: 0,
          expectedValue: 15000,
          destination: 'Patagônia Argentina',
          travelDates: {
            departure: new Date('2024-12-01'),
            return: new Date('2024-12-10'),
            flexible: true
          },
          travelers: { adults: 2, children: 0, infants: 0 },
          budget: { min: 12000, max: 18000, disclosed: true },
          interests: ['aventura', 'natureza', 'fotografia'],
          accommodation: { type: 'hotel', category: 'superior' },
          notes: 'Cliente interessado em trekking e observação de vida selvagem. Orçamento flexível.',
          nextAction: {
            type: 'call',
            description: 'Ligar para agendar reunião de apresentação',
            dueDate: new Date('2024-09-25'),
            completed: false
          },
          source: 'website',
          assignedTo: '1',
          createdAt: new Date('2024-09-15T10:30:00Z'),
          updatedAt: new Date('2024-09-18T14:20:00Z'),
        },
        {
          id: uuidv4(),
          clientId: '2',
          title: 'Lua de Mel - Carlos & Maria',
          status: 'qualificacao',
          priority: 'media',
          value: 0,
          expectedValue: 25000,
          destination: 'Maldives',
          travelDates: {
            departure: new Date('2025-02-14'),
            return: new Date('2025-02-21'),
            flexible: false
          },
          travelers: { adults: 2, children: 0, infants: 0 },
          budget: { min: 20000, max: 30000, disclosed: true },
          interests: ['romance', 'luxo', 'praia'],
          accommodation: { type: 'resort', category: 'luxo' },
          notes: 'Casal recém-casado buscando experiência romântica e luxuosa.',
          nextAction: {
            type: 'email',
            description: 'Enviar proposta detalhada com opções de resorts',
            dueDate: new Date('2024-09-22'),
            completed: false
          },
          source: 'indicacao',
          assignedTo: '2',
          createdAt: new Date('2024-09-10T15:45:00Z'),
          updatedAt: new Date('2024-09-18T16:30:00Z'),
        },
        {
          id: uuidv4(),
          clientId: '3',
          title: 'Família Silva - Viagem Cultural',
          status: 'consultoria',
          priority: 'baixa',
          value: 0,
          expectedValue: 18000,
          destination: 'Europa',
          travelDates: {
            departure: new Date('2024-11-15'),
            return: new Date('2024-11-25'),
            flexible: true
          },
          travelers: { adults: 2, children: 2, infants: 0 },
          budget: { min: 15000, max: 22000, disclosed: true },
          interests: ['cultura', 'historia', 'museus'],
          accommodation: { type: 'hotel', category: 'medio' },
          notes: 'Família com duas crianças (8 e 12 anos) interessada em roteiro cultural pela Europa.',
          nextAction: {
            type: 'meeting',
            description: 'Reunião presencial para definir roteiro detalhado',
            dueDate: new Date('2024-09-28'),
            completed: false
          },
          source: 'facebook',
          assignedTo: '1',
          createdAt: new Date('2024-09-05T09:15:00Z'),
          updatedAt: new Date('2024-09-18T11:45:00Z'),
        },
        {
          id: uuidv4(),
          clientId: '4',
          title: 'Grupo Executivo - Tech Corp',
          status: 'proposta',
          priority: 'alta',
          value: 0,
          expectedValue: 25000,
          destination: 'Japão',
          travelDates: {
            departure: new Date('2025-03-10'),
            return: new Date('2025-03-17'),
            flexible: false
          },
          travelers: { adults: 8, children: 0, infants: 0 },
          budget: { min: 20000, max: 30000, disclosed: true },
          interests: ['tecnologia', 'cultura', 'negocios'],
          accommodation: { type: 'hotel', category: 'superior' },
          notes: 'Grupo executivo para evento corporativo. Precisam de programação cultural e de negócios.',
          nextAction: {
            type: 'follow_up',
            description: 'Follow-up da proposta enviada há 3 dias',
            dueDate: new Date('2024-09-21'),
            completed: false
          },
          source: 'evento',
          assignedTo: '2',
          createdAt: new Date('2024-09-01T09:00:00Z'),
          updatedAt: new Date('2024-09-18T15:30:00Z'),
        },
        {
          id: uuidv4(),
          clientId: '5',
          title: 'Aventura Solo - João Santos',
          status: 'fechado',
          priority: 'media',
          value: 9500,
          expectedValue: 9500,
          destination: 'Nepal',
          travelDates: {
            departure: new Date('2024-10-01'),
            return: new Date('2024-10-15'),
            flexible: false
          },
          travelers: { adults: 1, children: 0, infants: 0 },
          budget: { min: 8000, max: 12000, disclosed: true },
          interests: ['aventura', 'trekking', 'montanhismo'],
          accommodation: { type: 'pousada', category: 'economico' },
          notes: 'Viajante experiente, já fez várias viagens conosco. Pacote fechado com sucesso.',
          nextAction: {
            type: 'follow_up',
            description: 'Acompanhar viagem e coletar feedback',
            dueDate: new Date('2024-10-20'),
            completed: false
          },
          source: 'indicacao',
          assignedTo: '2',
          createdAt: new Date('2024-08-25T13:15:00Z'),
          updatedAt: new Date('2024-09-10T14:20:00Z'),
        },
      ];
      console.log('Criando tarefas iniciais:', initialTasks.length);
      setTasks(initialTasks);
      if (typeof window !== 'undefined') {
        localStorage.setItem('kanbanTasks', JSON.stringify(initialTasks));
        console.log('Tarefas iniciais salvas no localStorage');
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    // Verificar se está no navegador e se já carregou
    if (typeof window === 'undefined' || !isLoaded) return;

    console.log('Salvando tarefas no localStorage:', tasks.length);
    localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
  }, [tasks, isLoaded]);

  // ⏱️ AUTO-HIDE: Verificar a cada segundo se algum card precisa ser ocultado
  useEffect(() => {
    if (typeof window === 'undefined' || !isLoaded) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      let hasUpdates = false;

      setTasks(prev => {
        const updated = prev.map(task => {
          // Verificar se o card está em "fechado" e tem completedAt
          if (task.status === 'fechado' && task.completedAt && !task.hidden) {
            const completedTime = new Date(task.completedAt).getTime();
            const elapsedMinutes = (now - completedTime) / (1000 * 60);

            // Se passou 3 minutos, ocultar o card
            if (elapsedMinutes >= 3) {
              console.log(`⏰ AUTO-HIDE: Card "${task.title}" fechado há ${elapsedMinutes.toFixed(1)} minutos - OCULTANDO`);
              hasUpdates = true;
              return { ...task, hidden: true };
            }
          }
          return task;
        });

        // Só retorna novo array se houve mudanças (evita re-renders desnecessários)
        return hasUpdates ? updated : prev;
      });
    }, 1000); // Verificar a cada 1 segundo

    return () => clearInterval(interval);
  }, [isLoaded]);

  const addTask = useCallback((taskData: Omit<KanbanTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: KanbanTask = {
      id: uuidv4(),
      ...taskData,
      hidden: false, // Por padrão, não está oculto
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    console.log('Adicionando nova tarefa:', newTask.title, 'Status:', newTask.status);
    setTasks(prevTasks => [...prevTasks, newTask]);
  }, []);

  const updateTask = useCallback((id: string, taskData: Partial<Omit<KanbanTask, 'id' | 'createdAt' | 'updatedAt'>>) => {
    console.log('Atualizando tarefa:', id, 'Dados:', taskData);
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, ...taskData, updatedAt: new Date() } : task
      )
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    console.log('Deletando tarefa:', id);
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  }, []);

  const moveTask = useCallback((taskId: string, newStatus: KanbanTask['status']) => {
    console.log('Movendo tarefa:', taskId, 'para status:', newStatus);

    // Pegar a task antes de mover para verificar status anterior
    const taskBeingMoved = tasks.find(t => t.id === taskId);
    const previousStatus = taskBeingMoved?.status;

    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const updatedTask = {
            ...task,
            status: newStatus,
            updatedAt: new Date()
          };

          // ⏱️ Registrar timestamp quando chegar em "fechado"
          if (newStatus === 'fechado') {
            updatedTask.completedAt = new Date();
            console.log('⏱️ Card movido para FECHADO - Timestamp registrado:', updatedTask.completedAt);
          }

          return updatedTask;
        }
        return task;
      })
    );

    // ✨ FLUXO AUTOMÁTICO: Vendas → Entrega
    if (newStatus === 'fechado' && taskBeingMoved) {
      console.log('🎯 Card movido para FECHADO! Verificando card de entrega...');

      const existingDeliveries = JSON.parse(localStorage.getItem('deliveryTasks') || '[]');
      const existingDelivery = existingDeliveries.find((d: any) => d.originalSaleId === taskId);

      if (existingDelivery) {
        // Card já existe, apenas reaparece
        console.log('🔄 Card de entrega já existe - REAPARECENDO');
        const updatedDeliveries = existingDeliveries.map((d: any) =>
          d.originalSaleId === taskId ? { ...d, hidden: false } : d
        );
        localStorage.setItem('deliveryTasks', JSON.stringify(updatedDeliveries));
        console.log('✅ Card de entrega reapareceu!');
      } else {
        // Criar novo card de entrega
        console.log('➕ Criando novo card de entrega...');

        // Buscar o nome do cliente do CRM usando o clientId
        let clientName = 'Cliente sem nome';

        try {
          const clientsData = localStorage.getItem('clients');
          if (clientsData && taskBeingMoved.clientId) {
            const clients = JSON.parse(clientsData);
            const client = clients.find((c: any) => c.id === taskBeingMoved.clientId);
            if (client && client.name) {
              clientName = client.name;
              console.log('✅ Nome do cliente encontrado no CRM:', clientName);
            } else {
              console.log('⚠️ Cliente não encontrado no CRM, usando fallback');
            }
          } else {
            console.log('⚠️ Sem dados de clientes ou clientId, usando fallback');
          }
        } catch (error) {
          console.error('❌ Erro ao buscar cliente do CRM:', error);
        }

        console.log('📝 Nome do cliente para card de entrega:', clientName);
        console.log('📦 Transferindo TODOS os dados do card de vendas para entrega...');

        // Criar descrição detalhada do serviço
        const adultsText = taskBeingMoved.travelers.adults > 0 ? `${taskBeingMoved.travelers.adults} adulto${taskBeingMoved.travelers.adults > 1 ? 's' : ''}` : '';
        const childrenText = taskBeingMoved.travelers.children > 0 ? `, ${taskBeingMoved.travelers.children} criança${taskBeingMoved.travelers.children > 1 ? 's' : ''}` : '';
        const infantsText = taskBeingMoved.travelers.infants > 0 ? `, ${taskBeingMoved.travelers.infants} bebê${taskBeingMoved.travelers.infants > 1 ? 's' : ''}` : '';
        const serviceDescription = `${taskBeingMoved.destination} - ${adultsText}${childrenText}${infantsText}`;

        // Consolidar notas com informações adicionais do card de vendas
        let consolidatedNotes = taskBeingMoved.notes || '';

        // Adicionar informações de acomodação
        if (taskBeingMoved.accommodation) {
          consolidatedNotes += `\n\n🏨 Acomodação: ${taskBeingMoved.accommodation.type} (${taskBeingMoved.accommodation.category})`;
        }

        // Adicionar interesses do cliente
        if (taskBeingMoved.interests && taskBeingMoved.interests.length > 0) {
          consolidatedNotes += `\n\n⭐ Interesses: ${taskBeingMoved.interests.join(', ')}`;
        }

        // Adicionar informações sobre viajantes
        if (taskBeingMoved.travelers?.adultsDetails && taskBeingMoved.travelers.adultsDetails.length > 0) {
          consolidatedNotes += '\n\n👥 Viajantes:';
          taskBeingMoved.travelers.adultsDetails.forEach((adult, index) => {
            if (adult.name) {
              consolidatedNotes += `\n  Adulto ${index + 1}: ${adult.name}${adult.email ? ` (${adult.email})` : ''}${adult.phone ? ` - ${adult.phone}` : ''}`;
            }
          });
        }

        if (taskBeingMoved.travelers?.childrenDetails && taskBeingMoved.travelers.childrenDetails.length > 0) {
          taskBeingMoved.travelers.childrenDetails.forEach((child, index) => {
            if (child.name) {
              consolidatedNotes += `\n  Criança ${index + 1}: ${child.name}`;
            }
          });
        }

        if (taskBeingMoved.travelers?.infantsDetails && taskBeingMoved.travelers.infantsDetails.length > 0) {
          taskBeingMoved.travelers.infantsDetails.forEach((infant, index) => {
            if (infant.name) {
              consolidatedNotes += `\n  Bebê ${index + 1}: ${infant.name}`;
            }
          });
        }

        // Adicionar informações de orçamento
        if (taskBeingMoved.budget?.disclosed) {
          consolidatedNotes += `\n\n💰 Orçamento revelado:`;
          if (taskBeingMoved.budget.min) {
            consolidatedNotes += ` Mínimo: ${taskBeingMoved.budget.min}${taskBeingMoved.budget.minCurrency ? ` ${taskBeingMoved.budget.minCurrency}` : ''}`;
          }
          if (taskBeingMoved.budget.max) {
            consolidatedNotes += ` - Máximo: ${taskBeingMoved.budget.max}${taskBeingMoved.budget.maxCurrency ? ` ${taskBeingMoved.budget.maxCurrency}` : ''}`;
          }
        }

        // Adicionar informações sobre datas flexíveis
        if (taskBeingMoved.travelDates?.flexible) {
          consolidatedNotes += '\n\n📅 Datas flexíveis';
        }

        // Adicionar origem do lead
        if (taskBeingMoved.source) {
          consolidatedNotes += `\n\n📍 Origem do lead: ${taskBeingMoved.source}`;
        }

        const deliveryTask = {
          id: `delivery_${Date.now()}_${taskId}`,
          clientName: clientName,
          service: serviceDescription,
          value: taskBeingMoved.closedValue || taskBeingMoved.value || taskBeingMoved.expectedValue || 0,
          valueCurrency: taskBeingMoved.closedValueCurrency || taskBeingMoved.expectedValueCurrency || 'BRL',
          closedValue: taskBeingMoved.closedValue || 0,
          closedValueCurrency: taskBeingMoved.closedValueCurrency || 'BRL',
          status: 'confirmado' as const,
          priority: taskBeingMoved.priority,
          paymentDate: new Date().toISOString().split('T')[0],
          startDate: taskBeingMoved.travelDates?.departure ? new Date(taskBeingMoved.travelDates.departure).toISOString().split('T')[0] : '',
          endDate: taskBeingMoved.travelDates?.return ? new Date(taskBeingMoved.travelDates.return).toISOString().split('T')[0] : '',
          travelers: taskBeingMoved.travelers.adults + taskBeingMoved.travelers.children + taskBeingMoved.travelers.infants,
          destination: taskBeingMoved.destination,
          assignedTo: taskBeingMoved.assignedTo || '',
          notes: consolidatedNotes.trim(),
          originalSaleId: taskId,
          hidden: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        console.log('✅ Card de entrega criado com TODAS as informações:', deliveryTask);

        localStorage.setItem('deliveryTasks', JSON.stringify([...existingDeliveries, deliveryTask]));
        console.log('✅ Card criado em Entrega de Serviços!', deliveryTask);
        alert(`✅ Venda fechada! Um card foi criado automaticamente em "Entrega de Serviços" na coluna "Pagamento Confirmado".`);
      }
    }

    // 🔒 OCULTAR: Quando sai de "fechado" para qualquer outra coluna
    if (previousStatus === 'fechado' && newStatus !== 'fechado' && taskBeingMoved) {
      console.log('🔒 Card saiu de FECHADO - Ocultando card de entrega...');

      const existingDeliveries = JSON.parse(localStorage.getItem('deliveryTasks') || '[]');
      const updatedDeliveries = existingDeliveries.map((d: any) =>
        d.originalSaleId === taskId ? { ...d, hidden: true } : d
      );
      localStorage.setItem('deliveryTasks', JSON.stringify(updatedDeliveries));
      console.log('✅ Card de entrega ocultado!');
    }
  }, [tasks]);

  const getTasksByStatus = useCallback((status: KanbanTask['status']) => {
    // Filtrar por status E excluir cards ocultos
    return tasks.filter(task => task.status === status && !task.hidden);
  }, [tasks]);

  const getTotalValue = useCallback((status: KanbanTask['status']) => {
    return tasks
      .filter(task => task.status === status && !task.hidden)
      .reduce((total, task) => total + (task.closedValue || task.value), 0);
  }, [tasks]);

  return (
    <KanbanContext.Provider value={{ 
      tasks, 
      addTask, 
      updateTask, 
      deleteTask, 
      moveTask, 
      getTasksByStatus, 
      getTotalValue 
    }}>
      {children}
    </KanbanContext.Provider>
  );
}

export function useKanban() {
  const context = useContext(KanbanContext);
  if (context === undefined) {
    throw new Error('useKanban must be used within a KanbanProvider');
  }
  return context;
}