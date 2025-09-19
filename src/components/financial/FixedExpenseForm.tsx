'use client';

import React, { useState, useEffect } from 'react';
import { useFinancial } from '@/lib/contexts/FinancialContext';
import { FixedExpense } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, X, Calendar, DollarSign, Tag } from 'lucide-react';

interface FixedExpenseFormProps {
  expense?: FixedExpense;
  onSave: () => void;
  onCancel: () => void;
}

const categoryOptions = [
  { value: 'aluguel', label: 'Aluguel' },
  { value: 'energia', label: 'Energia Elétrica' },
  { value: 'agua', label: 'Água' },
  { value: 'internet', label: 'Internet' },
  { value: 'telefone', label: 'Telefone' },
  { value: 'sistemas', label: 'Sistemas' },
  { value: 'outros', label: 'Outros' },
];

export function FixedExpenseForm({ expense, onSave, onCancel }: FixedExpenseFormProps) {
  const { addFixedExpense, updateFixedExpense } = useFinancial();
  const [formData, setFormData] = useState({
    name: '',
    amount: 0,
    dueDay: 5,
    category: 'outros' as FixedExpense['category'],
    isActive: true,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (expense) {
      setFormData({
        name: expense.name,
        amount: expense.amount,
        dueDay: expense.dueDay,
        category: expense.category,
        isActive: expense.isActive,
        notes: expense.notes || '',
      });
    }
  }, [expense]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    if (formData.amount <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }
    if (formData.dueDay < 1 || formData.dueDay > 31) {
      newErrors.dueDay = 'Dia de vencimento deve ser entre 1 e 31';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      if (expense) {
        updateFixedExpense(expense.id, formData);
      } else {
        addFixedExpense(formData);
      }
      
      onSave();
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl">
        <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <ArrowLeft className="h-5 w-5 mr-3 cursor-pointer text-white/70 hover:text-white" onClick={onCancel} />
            {expense ? 'Editar Conta Fixa' : 'Nova Conta Fixa'}
          </h2>
          <button onClick={onCancel} className="p-2 rounded-full text-white/70 hover:bg-white/10 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Tag className="h-4 w-4 mr-2 text-white/60" /> Informações Básicas
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/80">Nome da Conta *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Aluguel Escritório"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                />
                {errors.name && (
                  <p className="text-sm text-red-400 mt-1">{errors.name}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-white/80">Categoria *</Label>
                  <select
                    id="category"
                    className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value as FixedExpense['category'])}
                  >
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value} className="bg-gray-800">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
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
              </div>
            </div>
          </div>

          {/* Configurações de Vencimento */}
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-white/60" /> Configurações de Vencimento
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dueDay" className="text-white/80">Dia de Vencimento *</Label>
                <Input
                  id="dueDay"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.dueDay}
                  onChange={(e) => handleInputChange('dueDay', parseInt(e.target.value) || 1)}
                  placeholder="5"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                />
                {errors.dueDay && (
                  <p className="text-sm text-red-400 mt-1">{errors.dueDay}</p>
                )}
                <p className="text-xs text-white/60">
                  Dia do mês em que a conta vence (1-31)
                </p>
              </div>
            </div>
          </div>

          {/* Notas e Status */}
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-white/60" /> Notas e Status
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-white/80">Notas Adicionais</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Observações sobre a conta fixa..."
                  className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="accent-indigo-500 rounded bg-white/10 border-white/10 focus:ring-0"
                />
                <Label htmlFor="isActive" className="text-white/80">Conta Ativa</Label>
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
              {expense ? 'Atualizar' : 'Criar'} Conta Fixa
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
