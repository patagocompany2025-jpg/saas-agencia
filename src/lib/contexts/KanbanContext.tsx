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

  useEffect(() => {
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
      localStorage.setItem('kanbanTasks', JSON.stringify(initialTasks));
      console.log('Tarefas iniciais salvas no localStorage');
    }
  }, []);

  useEffect(() => {
    console.log('Salvando tarefas no localStorage:', tasks.length);
    localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = useCallback((taskData: Omit<KanbanTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: KanbanTask = {
      id: uuidv4(),
      ...taskData,
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
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus, updatedAt: new Date() } : task
      )
    );
  }, []);

  const getTasksByStatus = useCallback((status: KanbanTask['status']) => {
    return tasks.filter(task => task.status === status);
  }, [tasks]);

  const getTotalValue = useCallback((status: KanbanTask['status']) => {
    return tasks
      .filter(task => task.status === status)
      .reduce((total, task) => total + task.value, 0);
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