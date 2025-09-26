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
  
  // Funções auxiliares
  generateMonthlyTransactions: () => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export function FinancialProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [alerts, setAlerts] = useState<FinancialAlert[]>([]);

  // Carregar dados do localStorage
  useEffect(() => {
    console.log('=== INICIANDO CARREGAMENTO DO LOCALSTORAGE ===');
    console.log('Carregando dados do localStorage...');
    
    // Verificar se localStorage está disponível
    if (typeof window === 'undefined') {
      console.log('localStorage não disponível (SSR)');
      return;
    }
    
    const savedTransactions = localStorage.getItem('financialTransactions');
    const savedEmployees = localStorage.getItem('financialEmployees');
    const savedFixedExpenses = localStorage.getItem('financialFixedExpenses');
    const savedAlerts = localStorage.getItem('financialAlerts');

    console.log('Dados salvos encontrados:', {
      transactions: savedTransactions ? JSON.parse(savedTransactions).length : 0,
      employees: savedEmployees ? JSON.parse(savedEmployees).length : 0,
      fixedExpenses: savedFixedExpenses ? JSON.parse(savedFixedExpenses).length : 0,
      alerts: savedAlerts ? JSON.parse(savedAlerts).length : 0
    });

    if (savedTransactions) {
      try {
        const parsedTransactions = JSON.parse(savedTransactions).map((t: any) => ({
          ...t,
          dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
          paidDate: t.paidDate ? new Date(t.paidDate) : undefined,
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
        }));
        console.log('Transações carregadas:', parsedTransactions.length);
        setTransactions(parsedTransactions);
      } catch (error) {
        console.error('Erro ao carregar transações:', error);
        setTransactions([]);
      }
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
      try {
        const parsedEmployees = JSON.parse(savedEmployees).map((e: any) => ({
          ...e,
          createdAt: new Date(e.createdAt),
          updatedAt: new Date(e.updatedAt),
        }));
        console.log('Funcionários carregados:', parsedEmployees.length);
        setEmployees(parsedEmployees);
      } catch (error) {
        console.error('Erro ao carregar funcionários:', error);
        setEmployees([]);
      }
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
      try {
        const parsedFixedExpenses = JSON.parse(savedFixedExpenses).map((e: any) => ({
          ...e,
          createdAt: new Date(e.createdAt),
          updatedAt: new Date(e.updatedAt),
        }));
        console.log('Contas fixas carregadas:', parsedFixedExpenses.length);
        setFixedExpenses(parsedFixedExpenses);
      } catch (error) {
        console.error('Erro ao carregar contas fixas:', error);
        setFixedExpenses([]);
      }
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
    console.log('=== SALVANDO TRANSAÇÕES ===');
    console.log('Salvando transações no localStorage:', transactions.length);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('financialTransactions', JSON.stringify(transactions));
        console.log('Transações salvas com sucesso');
      } catch (error) {
        console.error('Erro ao salvar transações:', error);
      }
    }
  }, [transactions]);

  useEffect(() => {
    console.log('=== SALVANDO FUNCIONÁRIOS ===');
    console.log('Salvando funcionários no localStorage:', employees.length);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('financialEmployees', JSON.stringify(employees));
        console.log('Funcionários salvos com sucesso');
      } catch (error) {
        console.error('Erro ao salvar funcionários:', error);
      }
    }
  }, [employees]);

  useEffect(() => {
    console.log('=== SALVANDO CONTAS FIXAS ===');
    console.log('Salvando contas fixas no localStorage:', fixedExpenses.length);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('financialFixedExpenses', JSON.stringify(fixedExpenses));
        console.log('Contas fixas salvas com sucesso');
      } catch (error) {
        console.error('Erro ao salvar contas fixas:', error);
      }
    }
  }, [fixedExpenses]);

  useEffect(() => {
    console.log('=== SALVANDO ALERTAS ===');
    console.log('Salvando alertas no localStorage:', alerts.length);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('financialAlerts', JSON.stringify(alerts));
        console.log('Alertas salvos com sucesso');
      } catch (error) {
        console.error('Erro ao salvar alertas:', error);
      }
    }
  }, [alerts]);

  // Funções de transações
  const addTransaction = useCallback((transaction: Omit<FinancialTransaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('=== ADICIONANDO TRANSAÇÃO ===');
    console.log('Dados da transação:', transaction);
    
    const newTransaction: FinancialTransaction = {
      id: uuidv4(),
      ...transaction,
      dueDate: transaction.dueDate ? new Date(transaction.dueDate) : null,
      paidDate: transaction.paidDate ? new Date(transaction.paidDate) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    console.log('Nova transação criada:', newTransaction);
    setTransactions(prev => {
      const updated = [...prev, newTransaction];
      console.log('Lista de transações atualizada:', updated.length);
      return updated;
    });
    console.log('Transação adicionada com sucesso');
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
    console.log('=== ADICIONANDO FUNCIONÁRIO ===');
    console.log('Dados do funcionário:', employee);
    
    const newEmployee: Employee = {
      id: uuidv4(),
      ...employee,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    console.log('Novo funcionário criado:', newEmployee);
    setEmployees(prev => {
      const updated = [...prev, newEmployee];
      console.log('Lista de funcionários atualizada:', updated.length);
      return updated;
    });

    // Criar transação automática para salário do funcionário
    if (employee.salary && employee.salary > 0) {
      const today = new Date();
      const dueDate = new Date(today.getFullYear(), today.getMonth(), employee.paymentDay || 30);
      
      // Se o dia de pagamento já passou este mês, agendar para o próximo mês
      if (dueDate < today) {
        dueDate.setMonth(dueDate.getMonth() + 1);
      }

      const transaction = {
        type: 'despesa' as const,
        category: 'salarios' as const,
        description: `Salário - ${employee.name}`,
        amount: employee.salary,
        status: 'pendente' as const,
        dueDate: dueDate
      };
      console.log('Criando transação para funcionário:', transaction);
      addTransaction(transaction);
    }
  }, [addTransaction]);

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
    console.log('=== ADICIONANDO CONTA FIXA ===');
    console.log('Dados da conta fixa:', expense);
    
    const newExpense: FixedExpense = {
      id: uuidv4(),
      ...expense,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    console.log('Nova conta fixa criada:', newExpense);
    setFixedExpenses(prev => {
      const updated = [...prev, newExpense];
      console.log('Lista de contas fixas atualizada:', updated.length);
      return updated;
    });

    // Criar transação automática para conta fixa
    if (expense.amount && expense.amount > 0) {
      const today = new Date();
      const dueDate = new Date(today.getFullYear(), today.getMonth(), expense.dueDay || 30);
      
      // Se o dia de vencimento já passou este mês, agendar para o próximo mês
      if (dueDate < today) {
        dueDate.setMonth(dueDate.getMonth() + 1);
      }

      const transaction = {
        type: 'despesa' as const,
        category: 'contas_fixas' as const,
        description: expense.name,
        amount: expense.amount,
        status: 'pendente' as const,
        dueDate: dueDate
      };
      console.log('Criando transação para conta fixa:', transaction);
      addTransaction(transaction);
    }
  }, [addTransaction]);

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
    const expenses = transactions.filter(t => t.type === 'despesa');
    const total = expenses.reduce((sum, t) => sum + t.amount, 0);
    console.log('Despesas encontradas:', expenses.length, 'Total:', total, 'Transações:', expenses);
    return total;
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

  // Função para gerar transações mensais automaticamente
  const generateMonthlyTransactions = useCallback(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Gerar transações para funcionários
    employees.forEach(employee => {
      if (employee.salary && employee.salary > 0) {
        const dueDate = new Date(currentYear, currentMonth, employee.paymentDay || 30);
        
        // Verificar se já existe transação para este funcionário neste mês
        const existingTransaction = transactions.find(t => 
          t.description?.includes(`Salário - ${employee.name}`) &&
          t.dueDate && 
          t.dueDate.getMonth() === currentMonth &&
          t.dueDate.getFullYear() === currentYear
        );

        if (!existingTransaction) {
          addTransaction({
            type: 'despesa' as const,
            category: 'salarios' as const,
            description: `Salário - ${employee.name}`,
            amount: employee.salary,
            status: 'pendente' as const,
            dueDate: dueDate
          });
        }
      }
    });

    // Gerar transações para contas fixas
    fixedExpenses.forEach(expense => {
      if (expense.amount && expense.amount > 0) {
        const dueDate = new Date(currentYear, currentMonth, expense.dueDay || 30);
        
        // Verificar se já existe transação para esta conta fixa neste mês
        const existingTransaction = transactions.find(t => 
          t.description === expense.name &&
          t.dueDate && 
          t.dueDate.getMonth() === currentMonth &&
          t.dueDate.getFullYear() === currentYear
        );

        if (!existingTransaction) {
          addTransaction({
            type: 'despesa' as const,
            category: 'contas_fixas' as const,
            description: expense.name,
            amount: expense.amount,
            status: 'pendente' as const,
            dueDate: dueDate
          });
        }
      }
    });
  }, [employees, fixedExpenses, transactions, addTransaction]);

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
      generateMonthlyTransactions,
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
