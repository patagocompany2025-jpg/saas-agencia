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
    const savedTasks = localStorage.getItem('kanbanTasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
          ...task,
          // Garantir que os novos campos tenham valores padrão
          travelDates: task.travelDates || {},
          travelers: task.travelers || { adults: 1, children: 0, infants: 0 },
          budget: task.budget || { disclosed: false },
          interests: task.interests || [],
          accommodation: task.accommodation || { type: 'hotel', category: 'medio' },
          nextAction: task.nextAction || null,
          source: task.source || 'outros',
          expectedValue: task.expectedValue || 0,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
        }));
        setTasks(parsedTasks);
      } catch (error) {
        console.error('Erro ao carregar tarefas do localStorage:', error);
        setTasks([]);
      }
    } else {
      // Mock initial tasks if none are saved
      const initialTasks: KanbanTask[] = [
        {
          id: uuidv4(),
          clientId: '1',
          title: 'Patagônia Aventura - Alice Johnson',
          status: 'prospeccao',
          priority: 'alta',
          value: 0,
          expectedValue: 8500,
          destination: 'Patagônia Argentina',
          travelDates: {
            departure: new Date('2024-12-15'),
            return: new Date('2024-12-22'),
            flexible: true
          },
          travelers: { adults: 2, children: 0, infants: 0 },
          budget: { min: 6000, max: 10000, disclosed: true },
          interests: ['aventura', 'natureza', 'fotografia'],
          accommodation: { type: 'hotel', category: 'superior' },
          notes: 'Interessada em trekking e observação de vida selvagem. Primeira vez na Patagônia.',
          nextAction: {
            type: 'call',
            description: 'Ligar para entender melhor as expectativas e datas',
            dueDate: new Date('2024-09-20'),
            completed: false
          },
          source: 'website',
          assignedTo: '2',
          createdAt: new Date('2024-09-15T10:00:00Z'),
          updatedAt: new Date('2024-09-15T10:00:00Z'),
        },
        {
          id: uuidv4(),
          clientId: '2',
          title: 'Lua de Mel Luxo - Bob & Maria Williams',
          status: 'qualificacao',
          priority: 'alta',
          value: 0,
          expectedValue: 15000,
          destination: 'Maldivas',
          travelDates: {
            departure: new Date('2025-02-14'),
            return: new Date('2025-02-21'),
            flexible: false
          },
          travelers: { adults: 2, children: 0, infants: 0 },
          budget: { min: 12000, max: 18000, disclosed: true },
          interests: ['luxo', 'relaxamento', 'romance'],
          accommodation: { type: 'resort', category: 'luxo' },
          notes: 'Casal jovem, orçamento flexível. Querem experiência única e memorável.',
          nextAction: {
            type: 'meeting',
            description: 'Reunião presencial para apresentar opções de resorts',
            dueDate: new Date('2024-09-22'),
            completed: false
          },
          source: 'indicacao',
          assignedTo: '2',
          createdAt: new Date('2024-09-10T14:30:00Z'),
          updatedAt: new Date('2024-09-18T09:15:00Z'),
        },
        {
          id: uuidv4(),
          clientId: '3',
          title: 'Viagem Família - Família Brown',
          status: 'consultoria',
          priority: 'media',
          value: 0,
          expectedValue: 12000,
          destination: 'Europa',
          travelDates: {
            departure: new Date('2025-06-15'),
            return: new Date('2025-06-30'),
            flexible: true
          },
          travelers: { adults: 2, children: 2, infants: 0 },
          budget: { min: 8000, max: 15000, disclosed: true },
          interests: ['cultural', 'historia', 'familia'],
          accommodation: { type: 'hotel', category: 'medio' },
          notes: 'Família com crianças de 8 e 12 anos. Interessados em museus e atrações familiares.',
          nextAction: {
            type: 'proposal',
            description: 'Elaborar roteiro personalizado para família',
            dueDate: new Date('2024-09-25'),
            completed: false
          },
          source: 'google',
          assignedTo: '2',
          createdAt: new Date('2024-09-05T16:20:00Z'),
          updatedAt: new Date('2024-09-17T11:45:00Z'),
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
      setTasks(initialTasks);
      localStorage.setItem('kanbanTasks', JSON.stringify(initialTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = useCallback((taskData: Omit<KanbanTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: KanbanTask = {
      id: uuidv4(),
      ...taskData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  }, []);

  const updateTask = useCallback((id: string, taskData: Partial<Omit<KanbanTask, 'id' | 'createdAt' | 'updatedAt'>>) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, ...taskData, updatedAt: new Date() } : task
      )
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  }, []);

  const moveTask = useCallback((taskId: string, newStatus: KanbanTask['status']) => {
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
