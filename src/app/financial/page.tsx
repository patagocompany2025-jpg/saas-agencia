'use client';

import React, { useState, useEffect } from 'react';
import { useStackAuth } from '@/lib/contexts/StackAuthContext-approval';
import { useFinancial } from '@/lib/contexts/FinancialContext';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Plus, 
  Users, 
  CreditCard, 
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { FinancialTransaction, Employee, FixedExpense } from '@/lib/types';
import { 
  TransactionForm, 
  EmployeeForm, 
  FixedExpenseForm, 
  TransactionList, 
  EmployeeList, 
  FixedExpenseList, 
  FinancialAlerts 
} from '@/components/financial';

export default function FinancialPage() {
  const { user, isLoading } = useStackAuth();
  const { 
    getTotalRevenue, 
    getTotalExpenses, 
    getBalance, 
    getPendingPayments, 
    getOverduePayments,
    getUpcomingPayments,
    alerts,
    generateMonthlyTransactions,
    transactions,
    employees,
    fixedExpenses
  } = useFinancial();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'employees' | 'fixed-expenses'>('overview');

  // Debug: Log da mudança de aba
  useEffect(() => {
    console.log('=== ABA ATIVA MUDOU ===');
    console.log('Aba ativa:', activeTab);
  }, [activeTab]);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showFixedExpenseForm, setShowFixedExpenseForm] = useState(false);

  // Monitorar mudanças nos dados
  useEffect(() => {
    console.log('=== DADOS FINANCEIROS ATUALIZADOS ===');
    console.log('Transações:', transactions.length);
    console.log('Transações detalhadas:', transactions);
    console.log('Funcionários:', employees.length);
    console.log('Contas Fixas:', fixedExpenses.length);
    console.log('Alertas:', alerts.length);
  }, [transactions, employees, fixedExpenses, alerts]);
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | undefined>();
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>();
  const [editingFixedExpense, setEditingFixedExpense] = useState<FixedExpense | undefined>();

  // Verificar se o usuário tem acesso ao módulo financeiro
  if (user?.role !== 'socio') {
    return (
      <ModernLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Acesso Restrito</h1>
            <p className="text-white/70 text-lg mb-6">
              Apenas sócios têm acesso ao módulo financeiro.
            </p>
            <Button 
              onClick={() => window.history.back()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Voltar
            </Button>
          </div>
        </div>
      </ModernLayout>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-white/60">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Acesso Negado
          </h1>
          <p className="text-white/60">
            Você precisa fazer login para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const unreadAlerts = alerts.filter(alert => !alert.isRead).length;

  return (
    <ModernLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Financeiro</h1>
            <p className="text-white/60">Controle completo de receitas, despesas e pagamentos</p>
          </div>
          <div className="flex items-center gap-4">
            {unreadAlerts > 0 && (
              <div className="relative">
                <Bell className="h-6 w-6 text-yellow-400" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadAlerts}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/5 backdrop-blur-2xl rounded-lg p-1 border border-white/10">
          {[
            { id: 'overview', label: 'Visão Geral', icon: DollarSign },
            { id: 'transactions', label: 'Transações', icon: CreditCard },
            { id: 'employees', label: 'Funcionários', icon: Users },
            { id: 'fixed-expenses', label: 'Contas Fixas', icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  console.log('=== CLIQUE NA ABA ===');
                  console.log('Aba clicada:', tab.id);
                  console.log('Aba anterior:', activeTab);
                  setActiveTab(tab.id as 'overview' | 'transactions' | 'fixed-expenses' | 'employees');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Visão Geral */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 backdrop-blur-2xl rounded-xl p-6 border border-white/10 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-500/20 rounded-lg">
                      <DollarSign className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Saldo Atual</h3>
                      <p className="text-sm text-white/60">Positivo</p>
                    </div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">{formatCurrency(getBalance())}</div>
              </div>

              <div className="bg-white/5 backdrop-blur-2xl rounded-xl p-6 border border-white/10 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Total Receitas</h3>
                      <p className="text-sm text-white/60">Este mês</p>
                    </div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">{formatCurrency(getTotalRevenue())}</div>
              </div>

              <div className="bg-white/5 backdrop-blur-2xl rounded-xl p-6 border border-white/10 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-500/20 rounded-lg">
                      <TrendingDown className="h-6 w-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Total Despesas</h3>
                      <p className="text-sm text-white/60">Este mês</p>
                    </div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">{formatCurrency(getTotalExpenses())}</div>
              </div>

              <div className="bg-white/5 backdrop-blur-2xl rounded-xl p-6 border border-white/10 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-yellow-500/20 rounded-lg">
                      <AlertCircle className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">A Pagar</h3>
                      <p className="text-sm text-white/60">Pendente</p>
                    </div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">{formatCurrency(getPendingPayments())}</div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-center gap-4">
              <Button 
                onClick={generateMonthlyTransactions}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
              >
                <Plus className="h-4 w-4 mr-2" />
                Gerar Transações Mensais
              </Button>
            </div>

            {/* Alertas e Próximos Pagamentos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FinancialAlerts />
              
              <div className="bg-white/5 backdrop-blur-2xl rounded-xl p-6 border border-white/10 shadow-xl">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-400" />
                  Próximos Pagamentos
                </h3>
                <div className="space-y-3">
                  {getUpcomingPayments().slice(0, 5).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{payment.description}</p>
                        <p className="text-white/60 text-sm">
                          {payment.dueDate?.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">{formatCurrency(payment.amount)}</p>
                        <span className="text-xs text-yellow-400">Pendente</span>
                      </div>
                    </div>
                  ))}
                  {getUpcomingPayments().length === 0 && (
                    <p className="text-white/60 text-center py-4">Nenhum pagamento próximo</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transações */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Transações</h2>
              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('=== CLIQUE NO BOTÃO NOVA TRANSAÇÃO ===');
                  console.log('Evento:', e);
                  console.log('Estado atual showTransactionForm:', showTransactionForm);
                  setShowTransactionForm(true);
                  console.log('Estado após setShowTransactionForm(true)');
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                type="button"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Transação
              </Button>
            </div>
            <TransactionList 
              onEdit={(transaction: FinancialTransaction) => {
                console.log('=== EDITANDO TRANSAÇÃO ===', transaction);
                setEditingTransaction(transaction);
                setShowTransactionForm(true);
              }}
            />
          </div>
        )}

        {/* Funcionários */}
        {activeTab === 'employees' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Funcionários</h2>
              <Button 
                onClick={() => setShowEmployeeForm(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Funcionário
              </Button>
            </div>
            <EmployeeList 
              onEdit={(employee: Employee) => {
                setEditingEmployee(employee);
                setShowEmployeeForm(true);
              }}
            />
          </div>
        )}

        {/* Contas Fixas */}
        {activeTab === 'fixed-expenses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Contas Fixas</h2>
              <Button 
                onClick={() => setShowFixedExpenseForm(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Conta Fixa
              </Button>
            </div>
            <FixedExpenseList 
              onEdit={(expense) => {
                setEditingFixedExpense(expense);
                setShowFixedExpenseForm(true);
              }}
            />
          </div>
        )}

        {/* Modais */}
        {showTransactionForm && (
          <TransactionForm
            transaction={editingTransaction}
            onSave={() => {
              console.log('=== SALVANDO TRANSAÇÃO ===');
              setShowTransactionForm(false);
              setEditingTransaction(undefined);
            }}
            onCancel={() => {
              console.log('=== CANCELANDO TRANSAÇÃO ===');
              setShowTransactionForm(false);
              setEditingTransaction(undefined);
            }}
          />
        )}

        {showEmployeeForm && (
          <EmployeeForm
            employee={editingEmployee}
            onSave={() => {
              setShowEmployeeForm(false);
              setEditingEmployee(undefined);
            }}
            onCancel={() => {
              setShowEmployeeForm(false);
              setEditingEmployee(undefined);
            }}
          />
        )}

        {showFixedExpenseForm && (
          <FixedExpenseForm
            expense={editingFixedExpense}
            onSave={() => {
              setShowFixedExpenseForm(false);
              setEditingFixedExpense(undefined);
            }}
            onCancel={() => {
              setShowFixedExpenseForm(false);
              setEditingFixedExpense(undefined);
            }}
          />
        )}
      </div>
    </ModernLayout>
  );
}
