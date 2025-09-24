'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, X, Save, UserPlus } from 'lucide-react';
import { User as UserType } from '@/lib/types';

interface UserFormProps {
  user?: UserType | null;
  onSave: (userData: Omit<UserType, 'id' | 'createdAt'>) => Promise<boolean>;
  onCancel: () => void;
  isOpen: boolean;
}

export function UserForm({ user, onSave, onCancel, isOpen }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'vendedor' as 'socio' | 'vendedor',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'vendedor',
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.role) {
      newErrors.role = 'Tipo de usuário é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const success = await onSave(formData);
      if (success) {
        onCancel();
      } else {
        setErrors({ email: 'Email já existe' });
      }
    } catch (error) {
      setErrors({ general: 'Erro ao salvar usuário' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md bg-card/95 backdrop-blur-2xl border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              {user ? (
                <>
                  <User className="h-5 w-5 text-indigo-400" />
                  Editar Usuário
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5 text-green-400" />
                  Novo Usuário
                </>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {errors.general}
              </div>
            )}

            <div>
              <Label className="text-foreground/80">Nome Completo</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-background/10 border-border text-foreground"
                placeholder="Digite o nome completo"
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label className="text-foreground/80">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="bg-background/10 border-border text-foreground"
                placeholder="Digite o email"
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label className="text-foreground/80">Tipo de Usuário</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'socio' | 'vendedor') => 
                  setFormData(prev => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger className="bg-background/10 border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="socio" className="text-foreground">
                    <div className="flex flex-col">
                      <span className="font-medium">Sócio</span>
                      <span className="text-sm text-muted-foreground">Acesso completo ao sistema</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="vendedor" className="text-foreground">
                    <div className="flex flex-col">
                      <span className="font-medium">Vendedor</span>
                      <span className="text-sm text-muted-foreground">Acesso limitado (sem financeiro)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-red-400 text-sm mt-1">{errors.role}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 bg-background/10 border-border text-foreground hover:bg-accent"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Salvando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {user ? 'Salvar' : 'Criar'}
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
