'use client';

import React, { useState, useEffect } from 'react';
import { useFinancial } from '@/lib/contexts/FinancialContext';
import { Employee } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, X, Users, DollarSign, Building, CreditCard } from 'lucide-react';

interface EmployeeFormProps {
  employee?: Employee;
  onSave: () => void;
  onCancel: () => void;
}

const roleOptions = [
  { value: 'socio', label: 'Sócio' },
  { value: 'vendedor', label: 'Vendedor' },
  { value: 'administrativo', label: 'Administrativo' },
];

export function EmployeeForm({ employee, onSave, onCancel }: EmployeeFormProps) {
  const { addEmployee, updateEmployee } = useFinancial();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    position: '',
    role: 'vendedor' as Employee['role'],
    salary: 0,
    proLabore: 0,
    profitShare: 0,
    paymentDay: 5,
    bankAccount: {
      bank: '',
      agency: '',
      account: '',
      pix: '',
    },
    isActive: true,
    hireDate: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        position: employee.position,
        role: employee.role,
        salary: employee.salary,
        proLabore: employee.proLabore || 0,
        profitShare: employee.profitShare || 0,
        paymentDay: employee.paymentDay,
        bankAccount: {
          ...employee.bankAccount,
          pix: employee.bankAccount.pix || '',
        },
        isActive: employee.isActive,
        hireDate: employee.hireDate.toISOString().split('T')[0],
      });
    }
  }, [employee]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    }
    if (!formData.position.trim()) {
      newErrors.position = 'Cargo é obrigatório';
    }
    if (formData.role === 'socio' && formData.proLabore <= 0) {
      newErrors.proLabore = 'Pró-labore é obrigatório para sócios';
    }
    if (formData.role !== 'socio' && formData.salary <= 0) {
      newErrors.salary = 'Salário é obrigatório para funcionários';
    }
    if (!formData.bankAccount.bank.trim()) {
      newErrors.bank = 'Banco é obrigatório';
    }
    if (!formData.bankAccount.agency.trim()) {
      newErrors.agency = 'Agência é obrigatória';
    }
    if (!formData.bankAccount.account.trim()) {
      newErrors.account = 'Conta é obrigatória';
    }
    if (formData.paymentDay < 1 || formData.paymentDay > 31) {
      newErrors.paymentDay = 'Dia de pagamento deve ser entre 1 e 31';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const employeeData = {
        ...formData,
        salary: formData.role === 'socio' ? 0 : formData.salary,
        proLabore: formData.role === 'socio' ? formData.proLabore : undefined,
        profitShare: formData.role === 'socio' ? formData.profitShare : undefined,
        hireDate: new Date(formData.hireDate),
      };

      if (employee) {
        updateEmployee(employee.id, employeeData);
      } else {
        addEmployee(employeeData);
      }
      
      onSave();
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, unknown>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
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
            {employee ? 'Editar Funcionário' : 'Novo Funcionário'}
          </h2>
          <button onClick={onCancel} className="p-2 rounded-full text-white/70 hover:bg-white/10 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Users className="h-4 w-4 mr-2 text-white/60" /> Informações Básicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/80">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nome completo do funcionário"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                />
                {errors.name && (
                  <p className="text-sm text-red-400 mt-1">{errors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@empresa.com"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                />
                {errors.email && (
                  <p className="text-sm text-red-400 mt-1">{errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="position" className="text-white/80">Cargo/Função *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  placeholder="Ex: Vendedor, Gerente, etc."
                  className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                />
                {errors.position && (
                  <p className="text-sm text-red-400 mt-1">{errors.position}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-white/80">Tipo *</Label>
                <select
                  id="role"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value as Employee['role'])}
                >
                  {roleOptions.map(option => (
                    <option key={option.value} value={option.value} className="bg-gray-800">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Remuneração */}
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-white/60" /> Remuneração
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {formData.role === 'socio' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="proLabore" className="text-white/80">Pró-labore (R$) *</Label>
                    <Input
                      id="proLabore"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.proLabore}
                      onChange={(e) => handleInputChange('proLabore', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                    />
                    {errors.proLabore && (
                      <p className="text-sm text-red-400 mt-1">{errors.proLabore}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profitShare" className="text-white/80">Participação nos Lucros (%)</Label>
                    <Input
                      id="profitShare"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.profitShare}
                      onChange={(e) => handleInputChange('profitShare', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="salary" className="text-white/80">Salário (R$) *</Label>
                  <Input
                    id="salary"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.salary}
                    onChange={(e) => handleInputChange('salary', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                  />
                  {errors.salary && (
                    <p className="text-sm text-red-400 mt-1">{errors.salary}</p>
                  )}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="paymentDay" className="text-white/80">Dia de Pagamento *</Label>
                <Input
                  id="paymentDay"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.paymentDay}
                  onChange={(e) => handleInputChange('paymentDay', parseInt(e.target.value) || 1)}
                  placeholder="5"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                />
                {errors.paymentDay && (
                  <p className="text-sm text-red-400 mt-1">{errors.paymentDay}</p>
                )}
              </div>
            </div>
          </div>

          {/* Dados Bancários */}
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Building className="h-4 w-4 mr-2 text-white/60" /> Dados Bancários
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank" className="text-white/80">Banco *</Label>
                <Input
                  id="bank"
                  value={formData.bankAccount.bank}
                  onChange={(e) => handleInputChange('bankAccount.bank', e.target.value)}
                  placeholder="Ex: Banco do Brasil"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                />
                {errors.bank && (
                  <p className="text-sm text-red-400 mt-1">{errors.bank}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="agency" className="text-white/80">Agência *</Label>
                <Input
                  id="agency"
                  value={formData.bankAccount.agency}
                  onChange={(e) => handleInputChange('bankAccount.agency', e.target.value)}
                  placeholder="Ex: 1234"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                />
                {errors.agency && (
                  <p className="text-sm text-red-400 mt-1">{errors.agency}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="account" className="text-white/80">Conta *</Label>
                <Input
                  id="account"
                  value={formData.bankAccount.account}
                  onChange={(e) => handleInputChange('bankAccount.account', e.target.value)}
                  placeholder="Ex: 56789-0"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                />
                {errors.account && (
                  <p className="text-sm text-red-400 mt-1">{errors.account}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="pix" className="text-white/80">PIX (Opcional)</Label>
                <Input
                  id="pix"
                  value={formData.bankAccount.pix}
                  onChange={(e) => handleInputChange('bankAccount.pix', e.target.value)}
                  placeholder="Chave PIX"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <CreditCard className="h-4 w-4 mr-2 text-white/60" /> Status
            </h3>
            <div className="flex items-center space-x-2">
              <input
                id="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="accent-indigo-500 rounded bg-white/10 border-white/10 focus:ring-0"
              />
              <Label htmlFor="isActive" className="text-white/80">Funcionário Ativo</Label>
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
              {employee ? 'Atualizar' : 'Criar'} Funcionário
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
