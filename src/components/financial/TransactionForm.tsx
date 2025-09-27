'use client';

import React, { useState, useEffect } from 'react';
import { useFinancial } from '@/lib/contexts/FinancialContext';
import { FinancialTransaction } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, X, DollarSign, Calendar, CreditCard, Tag } from 'lucide-react';

interface TransactionFormProps {
  transaction?: FinancialTransaction;
  onSave: () => void;
  onCancel: () => void;
}

const typeOptions = [
  { value: 'receita', label: 'Receita' },
  { value: 'despesa', label: 'Despesa' },
];

const categoryOptions = [
  { value: 'vendas', label: 'Vendas' },
  { value: 'pro_labore', label: 'Pró-labore' },
  { value: 'salarios', label: 'Salários' },
  { value: 'lucros', label: 'Lucros' },
  { value: 'contas_fixas', label: 'Contas Fixas' },
  { value: 'sistemas', label: 'Sistemas' },
  { value: 'outros', label: 'Outros' },
];

const statusOptions = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'pago', label: 'Pago' },
  { value: 'vencido', label: 'Vencido' },
  { value: 'cancelado', label: 'Cancelado' },
];

const paymentMethodOptions = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'PIX' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'cartao', label: 'Cartão' },
  { value: 'boleto', label: 'Boleto' },
];

const recurringIntervalOptions = [
  { value: 'mensal', label: 'Mensal' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'semestral', label: 'Semestral' },
  { value: 'anual', label: 'Anual' },
];

export function TransactionForm({ transaction, onSave, onCancel }: TransactionFormProps) {
  const { addTransaction, updateTransaction, employees } = useFinancial();
  
  // Debug: Log do componente
  console.log('=== TRANSACTION FORM RENDERIZADO ===');
  console.log('Transaction:', transaction);
  console.log('Employees:', employees);
  const [formData, setFormData] = useState({
    type: 'despesa' as 'receita' | 'despesa',
    category: 'outros' as FinancialTransaction['category'],
    description: '',
    amount: 0,
    dueDate: '',
    status: 'pendente' as FinancialTransaction['status'],
    paymentMethod: 'pix' as FinancialTransaction['paymentMethod'],
    notes: '',
    recurring: false,
    recurringInterval: 'mensal' as FinancialTransaction['recurringInterval'],
    assignedTo: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        category: transaction.category,
        description: transaction.description,
        amount: transaction.amount,
        dueDate: transaction.dueDate ? transaction.dueDate.toISOString().split('T')[0] : '',
        status: transaction.status,
        paymentMethod: transaction.paymentMethod || 'pix',
        notes: transaction.notes || '',
        recurring: transaction.recurring || false,
        recurringInterval: transaction.recurringInterval || 'mensal',
        assignedTo: transaction.assignedTo || '',
      });
    }
  }, [transaction]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }
    if (formData.amount <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }
    if (formData.status === 'pago' && !formData.paymentMethod) {
      newErrors.paymentMethod = 'Método de pagamento é obrigatório para transações pagas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('=== SUBMIT DO FORMULÁRIO ===');
      console.log('FormData:', formData);
      
      if (validateForm()) {
        const transactionData = {
          type: formData.type,
          category: formData.category,
          description: formData.description,
          amount: formData.amount,
          dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
          status: formData.status,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
          recurring: formData.recurring,
          recurringInterval: formData.recurringInterval,
          assignedTo: formData.assignedTo || undefined,
          paidDate: formData.status === 'pago' ? new Date() : null,
        };

        console.log('TransactionData:', transactionData);

        if (transaction) {
          console.log('Atualizando transação:', transaction.id);
          updateTransaction(transaction.id, transactionData);
        } else {
          console.log('Adicionando nova transação');
          addTransaction(transactionData);
        }
        
        onSave();
      } else {
        console.log('Formulário inválido:', errors);
      }
    } catch (error) {
      console.error('Erro no submit do formulário:', error);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl">
        <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <ArrowLeft className="h-5 w-5 mr-3 cursor-pointer text-white/70 hover:text-white" onClick={onCancel} />
            {transaction ? 'Editar Transação' : 'Nova Transação'}
          </h2>
          <button onClick={onCancel} className="p-2 rounded-full text-white/70 hover:bg-white/10 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo e Categoria */}
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Tag className="h-4 w-4 mr-2 text-white/60" /> Tipo e Categoria
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-white/80">Tipo *</Label>
                <select
                  id="type"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value as 'receita' | 'despesa')}
                >
                  {typeOptions.map(option => (
                    <option key={option.value} value={option.value} className="bg-gray-800">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-white/80">Categoria *</Label>
                <select
                  id="category"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value as FinancialTransaction['category'])}
                >
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value} className="bg-gray-800">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Descrição e Valor */}
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-white/60" /> Descrição e Valor
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description" className="text-white/80">Descrição *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Ex: Venda Pacote Patagônia - Cliente ABC"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                />
                {errors.description && (
                  <p className="text-sm text-red-400 mt-1">{errors.description}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-white/80">Valor (R$) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                  />
                  {errors.amount && (
                    <p className="text-sm text-red-400 mt-1">{errors.amount}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-white/80">Status</Label>
                  <select
                    id="status"
                    className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as FinancialTransaction['status'])}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value} className="bg-gray-800">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Datas e Pagamento */}
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-white/60" /> Datas e Pagamento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-white/80">Data de Vencimento</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod" className="text-white/80">Método de Pagamento</Label>
                <select
                  id="paymentMethod"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                >
                  {paymentMethodOptions.map(option => (
                    <option key={option.value} value={option.value} className="bg-gray-800">
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.paymentMethod && (
                  <p className="text-sm text-red-400 mt-1">{errors.paymentMethod}</p>
                )}
              </div>
            </div>
          </div>

          {/* Recorrência e Notas */}
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <CreditCard className="h-4 w-4 mr-2 text-white/60" /> Recorrência e Notas
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  id="recurring"
                  type="checkbox"
                  checked={formData.recurring}
                  onChange={(e) => handleInputChange('recurring', e.target.checked)}
                  className="accent-indigo-500 rounded bg-white/10 border-white/10 focus:ring-0"
                />
                <Label htmlFor="recurring" className="text-white/80">Transação Recorrente</Label>
              </div>
              
              {formData.recurring && (
                <div className="space-y-2">
                  <Label htmlFor="recurringInterval" className="text-white/80">Intervalo de Recorrência</Label>
                  <select
                    id="recurringInterval"
                    className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.recurringInterval}
                    onChange={(e) => handleInputChange('recurringInterval', e.target.value)}
                  >
                    {recurringIntervalOptions.map(option => (
                      <option key={option.value} value={option.value} className="bg-gray-800">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-white/80">Notas Adicionais</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Observações sobre a transação..."
                  className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {transaction ? 'Atualizar' : 'Criar'} Transação
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
