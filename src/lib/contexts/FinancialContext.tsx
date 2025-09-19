'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FinancialTransaction, Employee, FixedExpense, FinancialAlert } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface FinancialContextType {
  // Transações
  transactions: FinancialTransaction[];
  addTransaction: (transaction: Omit<FinancialTransaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, transaction: Partial<FinancialTransaction>) => void;
  deleteTransaction: (id: string) => void;
  markAsPaid: (id: string) => void;
  
  // Funcionários
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  
  // Contas Fixas
  fixedExpenses: FixedExpense[];
  addFixedExpense: (expense: Omit<FixedExpense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFixedExpense: (id: string, expense: Partial<FixedExpense>) => void;
  deleteFixedExpense: (id: string) => void;
  
  // Alertas
  alerts: FinancialAlert[];
  addAlert: (alert: Omit<FinancialAlert, 'id' | 'createdAt'>) => void;
  markAlertAsRead: (id: string) => void;
  deleteAlert: (id: string) => void;
  
  // Métricas
  getTotalRevenue: () => number;
  getTotalExpenses: () => number;
  getBalance: () => number;
  getPendingPayments: () => number;
  getOverduePayments: () => number;
  getUpcomingPayments: () => FinancialTransaction[];
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export function FinancialProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [alerts, setAlerts] = useState<FinancialAlert[]>([]);

  // Carregar dados do localStorage
  useEffect(() => {
    const savedTransactions = localStorage.getItem('financialTransactions');
    const savedEmployees = localStorage.getItem('financialEmployees');
    const savedFixedExpenses = localStorage.getItem('financialFixedExpenses');
    const savedAlerts = localStorage.getItem('financialAlerts');

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions).map((t: any) => ({
        ...t,
        dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
        paidDate: t.paidDate ? new Date(t.paidDate) : undefined,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
      })));
    } else {
      // Dados iniciais
      const initialTransactions: FinancialTransaction[] = [
        {
          id: uuidv4(),
          type: 'receita',
          category: 'vendas',
          description: 'Venda Pacote Patagônia - Alice Johnson',
          amount: 8500,
          dueDate: new Date('2024-10-15'),
          status: 'pago',
          paidDate: new Date('2024-10-10'),
          paymentMethod: 'pix',
          createdAt: new Date('2024-10-01'),
          updatedAt: new Date('2024-10-10'),
        },
        {
          id: uuidv4(),
          type: 'despesa',
          category: 'pro_labore',
          description: 'Pró-labore João Silva - Outubro',
          amount: 5000,
          dueDate: new Date('2024-10-05'),
          status: 'pago',
          paidDate: new Date('2024-10-05'),
          paymentMethod: 'transferencia',
          recurring: true,
          recurringInterval: 'mensal',
          assignedTo: '1',
          createdAt: new Date('2024-10-01'),
          updatedAt: new Date('2024-10-05'),
        },
        {
          id: uuidv4(),
          type: 'despesa',
          category: 'contas_fixas',
          description: 'Aluguel Escritório',
          amount: 2500,
          dueDate: new Date('2024-10-10'),
          status: 'pendente',
          recurring: true,
          recurringInterval: 'mensal',
          createdAt: new Date('2024-10-01'),
          updatedAt: new Date('2024-10-01'),
        },
        {
          id: uuidv4(),
          type: 'despesa',
          category: 'sistemas',
          description: 'Assinatura CRM e Ferramentas',
          amount: 300,
          dueDate: new Date('2024-10-15'),
          status: 'pendente',
          recurring: true,
          recurringInterval: 'mensal',
          createdAt: new Date('2024-10-01'),
          updatedAt: new Date('2024-10-01'),
        },
      ];
      setTransactions(initialTransactions);
      localStorage.setItem('financialTransactions', JSON.stringify(initialTransactions));
    }

    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees).map((e: any) => ({
        ...e,
        createdAt: new Date(e.createdAt),
        updatedAt: new Date(e.updatedAt),
      })));
    } else {
      const initialEmployees: Employee[] = [
        {
          id: '1',
          name: 'João Silva',
          email: 'joao@patagonia.com',
          position: 'Sócio Proprietário',
          role: 'socio',
          salary: 0,
          proLabore: 5000,
          profitShare: 60,
          paymentDay: 5,
          bankAccount: {
            bank: 'Banco do Brasil',
            agency: '1234',
            account: '56789-0',
            pix: 'joao@patagonia.com',
          },
          isActive: true,
          hireDate: new Date('2024-01-01'),
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: '2',
          name: 'Maria Santos',
          email: 'maria@patagonia.com',
          position: 'Vendedora',
          role: 'vendedor',
          salary: 3000,
          paymentDay: 5,
          bankAccount: {
            bank: 'Itaú',
            agency: '5678',
            account: '12345-6',
            pix: 'maria@patagonia.com',
          },
          isActive: true,
          hireDate: new Date('2024-01-01'),
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];
      setEmployees(initialEmployees);
      localStorage.setItem('financialEmployees', JSON.stringify(initialEmployees));
    }

    if (savedFixedExpenses) {
      setFixedExpenses(JSON.parse(savedFixedExpenses).map((e: any) => ({
        ...e,
        createdAt: new Date(e.createdAt),
        updatedAt: new Date(e.updatedAt),
      })));
    } else {
      const initialFixedExpenses: FixedExpense[] = [
        {
          id: uuidv4(),
          name: 'Aluguel Escritório',
          amount: 2500,
          dueDay: 10,
          category: 'aluguel',
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: uuidv4(),
          name: 'Energia Elétrica',
          amount: 350,
          dueDay: 15,
          category: 'energia',
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: uuidv4(),
          name: 'Internet Fibra',
          amount: 150,
          dueDay: 20,
          category: 'internet',
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: uuidv4(),
          name: 'Sistema CRM',
          amount: 300,
          dueDay: 15,
          category: 'sistemas',
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];
      setFixedExpenses(initialFixedExpenses);
      localStorage.setItem('financialFixedExpenses', JSON.stringify(initialFixedExpenses));
    }

    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts).map((a: any) => ({
        ...a,
        dueDate: a.dueDate ? new Date(a.dueDate) : undefined,
        createdAt: new Date(a.createdAt),
      })));
    }
  }, []);

  // Salvar dados no localStorage
  useEffect(() => {
    localStorage.setItem('financialTransactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('financialEmployees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('financialFixedExpenses', JSON.stringify(fixedExpenses));
  }, [fixedExpenses]);

  useEffect(() => {
    localStorage.setItem('financialAlerts', JSON.stringify(alerts));
  }, [alerts]);

  // Funções de transações
  const addTransaction = useCallback((transaction: Omit<FinancialTransaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTransaction: FinancialTransaction = {
      id: uuidv4(),
      ...transaction,
      dueDate: transaction.dueDate ? new Date(transaction.dueDate) : null,
      paidDate: transaction.paidDate ? new Date(transaction.paidDate) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTransactions(prev => [...prev, newTransaction]);
  }, []);

  const updateTransaction = useCallback((id: string, transaction: Partial<FinancialTransaction>) => {
    setTransactions(prev =>
      prev.map(t => t.id === id ? { ...t, ...transaction, updatedAt: new Date() } : t)
    );
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const markAsPaid = useCallback((id: string) => {
    setTransactions(prev =>
      prev.map(t => t.id === id ? { ...t, status: 'pago', paidDate: new Date(), updatedAt: new Date() } : t)
    );
  }, []);

  // Funções de funcionários
  const addEmployee = useCallback((employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEmployee: Employee = {
      id: uuidv4(),
      ...employee,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setEmployees(prev => [...prev, newEmployee]);
  }, []);

  const updateEmployee = useCallback((id: string, employee: Partial<Employee>) => {
    setEmployees(prev =>
      prev.map(e => e.id === id ? { ...e, ...employee, updatedAt: new Date() } : e)
    );
  }, []);

  const deleteEmployee = useCallback((id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
  }, []);

  // Funções de contas fixas
  const addFixedExpense = useCallback((expense: Omit<FixedExpense, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newExpense: FixedExpense = {
      id: uuidv4(),
      ...expense,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setFixedExpenses(prev => [...prev, newExpense]);
  }, []);

  const updateFixedExpense = useCallback((id: string, expense: Partial<FixedExpense>) => {
    setFixedExpenses(prev =>
      prev.map(e => e.id === id ? { ...e, ...expense, updatedAt: new Date() } : e)
    );
  }, []);

  const deleteFixedExpense = useCallback((id: string) => {
    setFixedExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  // Funções de alertas
  const addAlert = useCallback((alert: Omit<FinancialAlert, 'id' | 'createdAt'>) => {
    const newAlert: FinancialAlert = {
      id: uuidv4(),
      ...alert,
      createdAt: new Date(),
    };
    setAlerts(prev => [...prev, newAlert]);
  }, []);

  const markAlertAsRead = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  }, []);

  const deleteAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  // Funções de métricas
  const getTotalRevenue = useCallback(() => {
    return transactions
      .filter(t => t.type === 'receita' && t.status === 'pago')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const getTotalExpenses = useCallback(() => {
    return transactions
      .filter(t => t.type === 'despesa' && t.status === 'pago')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const getBalance = useCallback(() => {
    return getTotalRevenue() - getTotalExpenses();
  }, [getTotalRevenue, getTotalExpenses]);

  const getPendingPayments = useCallback(() => {
    return transactions
      .filter(t => t.type === 'despesa' && t.status === 'pendente')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const getOverduePayments = useCallback(() => {
    const today = new Date();
    return transactions
      .filter(t => t.type === 'despesa' && t.status === 'pendente' && t.dueDate && t.dueDate < today)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const getUpcomingPayments = useCallback(() => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return transactions
      .filter(t => t.type === 'despesa' && t.status === 'pendente' && t.dueDate && t.dueDate <= nextWeek)
      .sort((a, b) => (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0));
  }, [transactions]);

  return (
    <FinancialContext.Provider value={{
      transactions,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      markAsPaid,
      employees,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      fixedExpenses,
      addFixedExpense,
      updateFixedExpense,
      deleteFixedExpense,
      alerts,
      addAlert,
      markAlertAsRead,
      deleteAlert,
      getTotalRevenue,
      getTotalExpenses,
      getBalance,
      getPendingPayments,
      getOverduePayments,
      getUpcomingPayments,
    }}>
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancial() {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
}
