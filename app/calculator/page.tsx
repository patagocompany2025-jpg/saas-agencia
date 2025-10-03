'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useHybridAuth } from '@/lib/contexts/HybridAuthContext';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Calculator,
  DollarSign,
  MapPin,
  Users,
  Calendar,
  Star,
  Crown,
  Plane,
  Hotel,
  Car,
  Camera,
  Wine,
  Mountain,
  Waves,
  Zap,
  Heart,
  Target,
  TrendingUp,
  Globe,
  Bitcoin,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Facebook,
  Instagram,
  Music,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

// Interface para informações da empresa
interface CompanyInfo {
  companyName?: string;
  address?: string;
  addressNumber?: string;
  zipCode?: string;
  latitude?: string;
  longitude?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
  };
  contactPhone?: string;
  contactPerson?: string;
}

// Interface para opções de serviço
interface ServiceOption {
  name: string;
  basePrice: number;
  multiplier: number;
  category: string;
  currency?: string;
  companyInfo?: CompanyInfo;
}

// Tipos de moedas suportadas
const CURRENCIES = {
  USD: { name: 'Dólar Americano', symbol: '$', rate: 1 },
  EUR: { name: 'Euro', symbol: '€', rate: 0.85 },
  GBP: { name: 'Libra Esterlina', symbol: '£', rate: 0.73 },
  ARS: { name: 'Peso Argentino', symbol: '$', rate: 1000 },
  BRL: { name: 'Real Brasileiro', symbol: 'R$', rate: 5.2 },
  BTC: { name: 'Bitcoin', symbol: '₿', rate: 0.000023 },
  CAD: { name: 'Dólar Canadense', symbol: 'C$', rate: 1.35 },
  AUD: { name: 'Dólar Australiano', symbol: 'A$', rate: 1.52 },
  CHF: { name: 'Franco Suíço', symbol: 'CHF', rate: 0.88 },
  JPY: { name: 'Iene Japonês', symbol: '¥', rate: 150 }
};

// Serviços na Patagônia - Luxo e Média Renda
const PATAGONIA_SERVICES = {
  accommodation: {
    name: 'Hospedagem',
    icon: Hotel,
    categories: {
      luxury: {
        name: 'Luxo',
        color: 'text-yellow-400',
        options: [
          { name: 'Hotel 5 Estrelas Bariloche', basePrice: 800, multiplier: 1.0, category: 'luxury', currency: 'USD', companyInfo: {} },
          { name: 'Lodge de Montanha Premium', basePrice: 1200, multiplier: 1.5, category: 'luxury', currency: 'USD', companyInfo: {} },
          { name: 'Villa Privada com Concierge', basePrice: 2000, multiplier: 2.5, category: 'luxury', currency: 'USD', companyInfo: {} },
          { name: 'Resort All-Inclusive Luxo', basePrice: 1500, multiplier: 1.8, category: 'luxury', currency: 'USD', companyInfo: {} },
          { name: 'Casa de Campo Exclusiva', basePrice: 3000, multiplier: 3.0, category: 'luxury', currency: 'USD', companyInfo: {} }
        ]
      },
      midrange: {
        name: 'Média Renda',
        color: 'text-blue-400',
        options: [
          { name: 'Hotel 4 Estrelas Centro', basePrice: 200, multiplier: 1.0, category: 'midrange', currency: 'USD', companyInfo: {} },
          { name: 'Pousada Charming', basePrice: 150, multiplier: 0.8, category: 'midrange', currency: 'USD', companyInfo: {} },
          { name: 'Casa de Temporada Familiar', basePrice: 300, multiplier: 1.2, category: 'midrange', currency: 'USD', companyInfo: {} },
          { name: 'Hostel Premium Privado', basePrice: 100, multiplier: 0.6, category: 'midrange', currency: 'USD', companyInfo: {} },
          { name: 'Cabaña com Vista ao Lago', basePrice: 250, multiplier: 1.0, category: 'midrange', currency: 'USD', companyInfo: {} }
        ]
      }
    }
  },
  transportation: {
    name: 'Transporte',
    icon: Car,
    categories: {
      luxury: {
        name: 'Premium',
        color: 'text-yellow-400',
        options: [
          { name: 'Transfer Privado Aeroporto', basePrice: 150, multiplier: 1.0, category: 'luxury', currency: 'USD', companyInfo: {} },
          { name: 'Carro de Luxo com Motorista', basePrice: 300, multiplier: 1.5, category: 'luxury', currency: 'USD', companyInfo: {} },
          { name: 'Helicóptero Privado', basePrice: 2000, multiplier: 3.0, category: 'luxury', currency: 'USD', companyInfo: {} },
          { name: 'Jato Privado Regional', basePrice: 5000, multiplier: 5.0, category: 'luxury', currency: 'USD', companyInfo: {} },
          { name: 'Iate Privado Lago Nahuel Huapi', basePrice: 1500, multiplier: 2.0, category: 'luxury', currency: 'USD', companyInfo: {} }
        ]
      },
      midrange: {
        name: 'Econômico',
        color: 'text-blue-400',
        options: [
          { name: 'Transfer Compartilhado', basePrice: 30, multiplier: 1.0, category: 'midrange', currency: 'USD', companyInfo: {} },
          { name: 'Aluguel de Carro Padrão', basePrice: 80, multiplier: 1.0, category: 'midrange', currency: 'USD', companyInfo: {} },
          { name: 'Transfer Executivo', basePrice: 60, multiplier: 1.2, category: 'midrange', currency: 'USD', companyInfo: {} },
          { name: 'Van Privada para Grupos', basePrice: 120, multiplier: 1.5, category: 'midrange', currency: 'USD', companyInfo: {} },
          { name: 'Barco Turístico Lago', basePrice: 50, multiplier: 1.0, category: 'midrange', currency: 'USD', companyInfo: {} }
        ]
      }
    }
  },
  experiences: {
    name: 'Experiências',
    icon: Star,
    categories: {
      luxury: {
        name: 'Exclusivas',
        color: 'text-yellow-400',
        options: [
          { name: 'Trekking Privado com Guia', basePrice: 400, multiplier: 1.0, category: 'luxury', currency: 'USD', companyInfo: {} },
          { name: 'Degustação de Vinhos Premium', basePrice: 300, multiplier: 1.2, category: 'luxury', currency: 'USD', companyInfo: {} },
          { name: 'Safari Fotográfico Privado', basePrice: 500, multiplier: 1.5, category: 'luxury', currency: 'USD', companyInfo: {} },
          { name: 'Spa de Luxo na Montanha', basePrice: 600, multiplier: 1.8, category: 'luxury', currency: 'USD', companyInfo: {} },
          { name: 'Jantar Privado no Glaciar', basePrice: 1200, multiplier: 2.5, category: 'luxury', currency: 'USD', companyInfo: {} },
          { name: 'Voo Panorâmico Privado', basePrice: 800, multiplier: 2.0, category: 'luxury', currency: 'USD', companyInfo: {} },
          { name: 'Pesca Esportiva Exclusiva', basePrice: 700, multiplier: 1.8, category: 'luxury', currency: 'USD', companyInfo: {} },
          { name: 'Cavalgada Privada na Patagônia', basePrice: 450, multiplier: 1.3, category: 'luxury', currency: 'USD', companyInfo: {} }
        ]
      },
      midrange: {
        name: 'Média',
        color: 'text-blue-400',
        options: [
          { name: 'Trekking em Grupo', basePrice: 80, multiplier: 1.0, category: 'midrange', currency: 'USD', companyInfo: {} },
          { name: 'Degustação de Vinhos Local', basePrice: 60, multiplier: 1.0, category: 'midrange', currency: 'USD', companyInfo: {} },
          { name: 'Tour Fotográfico Guiado', basePrice: 100, multiplier: 1.2, category: 'midrange', currency: 'USD', companyInfo: {} },
          { name: 'Spa Básico', basePrice: 120, multiplier: 1.0, category: 'midrange', currency: 'USD', companyInfo: {} },
          { name: 'Jantar Típico Local', basePrice: 80, multiplier: 1.0, category: 'midrange', currency: 'USD', companyInfo: {} },
          { name: 'Voo Panorâmico Compartilhado', basePrice: 200, multiplier: 1.5, category: 'midrange', currency: 'USD', companyInfo: {} },
          { name: 'Pesca Tradicional', basePrice: 150, multiplier: 1.2, category: 'midrange', currency: 'USD', companyInfo: {} },
          { name: 'Cavalgada em Grupo', basePrice: 100, multiplier: 1.0, category: 'midrange', currency: 'USD', companyInfo: {} },
          { name: 'Tour de Cervejarias', basePrice: 70, multiplier: 1.0, category: 'midrange', currency: 'USD', companyInfo: {} },
          { name: 'Caminhada Ecológica', basePrice: 50, multiplier: 0.8, category: 'midrange', currency: 'USD', companyInfo: {} }
        ]
      }
    }
  },
  concierge: {
    name: 'Concierge & Consultoria',
    icon: Crown,
    categories: {
      luxury: {
        name: 'VIP',
        color: 'text-yellow-400',
        options: [
          { name: 'Concierge 24/7 Básico', basePrice: 200, multiplier: 1.0, category: 'luxury', currency: 'USD', companyInfo: {} },
          { name: 'Concierge Premium Personalizado', basePrice: 500, multiplier: 2.0, category: 'luxury', currency: 'USD', companyInfo: {} },
          { name: 'Concierge VIP com Assistente', basePrice: 1000, multiplier: 3.0, category: 'luxury', currency: 'USD', companyInfo: {} },
          { name: 'Concierge Ultra Luxo', basePrice: 2000, multiplier: 4.0, category: 'luxury', currency: 'USD', companyInfo: {} }
        ]
      },
      midrange: {
        name: 'Consultoria',
        color: 'text-blue-400',
        options: [
          { name: 'Consultoria Básica (2h)', basePrice: 100, multiplier: 1.0, category: 'midrange', currency: 'USD', companyInfo: {} },
          { name: 'Planejamento Completo (4h)', basePrice: 180, multiplier: 1.2, category: 'midrange', currency: 'USD', companyInfo: {} },
          { name: 'Assistência por WhatsApp', basePrice: 50, multiplier: 1.0, category: 'midrange', currency: 'USD', companyInfo: {} },
          { name: 'Consultoria Familiar', basePrice: 150, multiplier: 1.5, category: 'midrange', currency: 'USD', companyInfo: {} },
          { name: 'Consultoria para Grupos', basePrice: 200, multiplier: 2.0, category: 'midrange', currency: 'USD', companyInfo: {} },
          { name: 'Suporte Durante a Viagem', basePrice: 80, multiplier: 1.0, category: 'midrange', currency: 'USD', companyInfo: {} }
        ]
      }
    }
  },
  dining: {
    name: 'Gastronomia',
    icon: Wine,
    categories: {
      luxury: {
        name: 'Gourmet',
        color: 'text-yellow-400',
        options: [
          { name: 'Jantar em Restaurante Michelin', basePrice: 300, multiplier: 1.5, category: 'luxury', currency: 'USD', companyInfo: {} },
          { name: 'Degustação Privada com Sommelier', basePrice: 400, multiplier: 2.0, category: 'luxury', currency: 'USD', companyInfo: {} },
          { name: 'Chef Privado na Villa', basePrice: 800, multiplier: 2.5, category: 'luxury', currency: 'USD', companyInfo: {} },
          { name: 'Experiência Culinária na Montanha', basePrice: 600, multiplier: 2.2, category: 'luxury', currency: 'USD', companyInfo: {} }
        ]
      },
      midrange: {
        name: 'Tradicional',
        color: 'text-blue-400',
        options: [
          { name: 'Jantar em Restaurante Local', basePrice: 60, multiplier: 1.0, category: 'midrange', currency: 'USD', companyInfo: {} },
          { name: 'Degustação de Vinhos Regional', basePrice: 80, multiplier: 1.2, category: 'midrange', currency: 'USD', companyInfo: {} },
          { name: 'Cooking Class Local', basePrice: 120, multiplier: 1.5, category: 'midrange', currency: 'USD', companyInfo: {} },
          { name: 'Jantar Típico Patagônico', basePrice: 100, multiplier: 1.3, category: 'midrange', currency: 'USD', companyInfo: {} },
          { name: 'Piquenique no Lago', basePrice: 70, multiplier: 1.0, category: 'midrange', currency: 'USD', companyInfo: {} },
          { name: 'Café da Manhã na Montanha', basePrice: 40, multiplier: 1.0, category: 'midrange', currency: 'USD', companyInfo: {} }
        ]
      }
    }
  }
};

interface ServiceOptionWithDelete {
  deleted?: boolean;
  [key: string]: unknown;
}

export default function CalculatorPage() {
  const { user, isLoading } = useHybridAuth();
  // Armazenar apenas os dados editáveis, mantendo PATAGONIA_SERVICES intacto
  const [serviceOverrides, setServiceOverrides] = useState<{[key: string]: Partial<ServiceOption>}>({});
  const [editingPrices, setEditingPrices] = useState<{[key: string]: string}>({});
  const [editingServiceKey, setEditingServiceKey] = useState<string | null>(null);
  const [expandedServices, setExpandedServices] = useState<{[key: string]: boolean}>({});
  const [newServices, setNewServices] = useState<{[key: string]: ServiceOption[]}>({});
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [addServiceContext, setAddServiceContext] = useState<{category: string, priceRange: string} | null>(null);
  const [newServiceForm, setNewServiceForm] = useState({
    name: '',
    price: 0
  });
  const [categoryOverrides, setCategoryOverrides] = useState<{[key: string]: string}>({});
  const [priceRangeOverrides, setPriceRangeOverrides] = useState<{[key: string]: string}>({});
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [editCategoryContext, setEditCategoryContext] = useState<{key: string, currentName: string, type: 'category' | 'priceRange'} | null>(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [addCategoryContext, setAddCategoryContext] = useState<{type: 'category' | 'priceRange', parentCategory?: string} | null>(null);
  const [newCategoryForm, setNewCategoryForm] = useState({ name: '' });
  const [newCategories, setNewCategories] = useState<{[key: string]: {name: string, icon: React.ReactNode, categories: Record<string, unknown>}}>({});
  const [newPriceRanges, setNewPriceRanges] = useState<{[key: string]: {name: string, color: string}}>({});
  
  const [formData, setFormData] = useState({
    duration: 7,
    guests: 2,
    season: 'high',
    currency: 'USD',
    services: [] as string[],
    customServices: [] as { name: string; price: number }[],
    markup: 35,
    consultationHours: 0,
    priceRange: 'all' as 'all' | 'luxury' | 'midrange'
  });
  const [exchangeRates, setExchangeRates] = useState(CURRENCIES);

  // Helper para obter serviço com overrides aplicados
  const getServiceOption = (serviceType: string, category: string, optionIndex: number): ServiceOption => {
    const original = (PATAGONIA_SERVICES as Record<string, { categories: Record<string, { options: ServiceOption[] }> }>)[serviceType].categories[category].options[optionIndex];
    const key = `${serviceType}-${category}-${optionIndex}`;
    const override = serviceOverrides[key];
    return override ? { ...original, ...override } : original;
  };

  // Helpers para obter nomes de categoria e faixa de preço com overrides
  const getCategoryName = (categoryKey: string): string => {
    const override = categoryOverrides[categoryKey];
    if (override === '__DELETED__') return '';
    return override || (PATAGONIA_SERVICES as Record<string, { name: string }>)[categoryKey]?.name || categoryKey;
  };

  const getPriceRangeName = (categoryKey: string, priceRangeKey: string): string => {
    const key = `${categoryKey}-${priceRangeKey}`;
    const override = priceRangeOverrides[key];
    if (override === '__DELETED__') return '';
    return override || (PATAGONIA_SERVICES as Record<string, any>)[categoryKey]?.categories[priceRangeKey]?.name || priceRangeKey;
  };

  const isCategoryDeleted = (categoryKey: string): boolean => {
    return categoryOverrides[categoryKey] === '__DELETED__';
  };

  const isPriceRangeDeleted = (categoryKey: string, priceRangeKey: string): boolean => {
    const key = `${categoryKey}-${priceRangeKey}`;
    return priceRangeOverrides[key] === '__DELETED__';
  };

  // Funções para editar serviços - usando overrides
  const updateServicePrice = (serviceType: string, category: string, optionIndex: number, newPrice: number) => {
    if (isNaN(newPrice) || newPrice < 0) {
      console.warn('Preço inválido:', newPrice);
      return;
    }
    const key = `${serviceType}-${category}-${optionIndex}`;
    setServiceOverrides(prev => ({
      ...prev,
      [key]: { ...prev[key], basePrice: newPrice }
    }));
  };

  const updateServiceName = (serviceType: string, category: string, optionIndex: number, newName: string) => {
    const key = `${serviceType}-${category}-${optionIndex}`;
    setServiceOverrides(prev => ({
      ...prev,
      [key]: { ...prev[key], name: newName }
    }));
  };

  const updateServiceCurrency = (serviceType: string, category: string, optionIndex: number, newCurrency: string) => {
    const key = `${serviceType}-${category}-${optionIndex}`;
    setServiceOverrides(prev => ({
      ...prev,
      [key]: { ...prev[key], currency: newCurrency }
    }));
  };

  const deleteService = (serviceType: string, category: string, optionIndex: number) => {
    // Marcar como deletado no override
    const key = `${serviceType}-${category}-${optionIndex}`;
    setServiceOverrides(prev => ({
      ...prev,
      [key]: { ...prev[key], deleted: true } as ServiceOptionWithDelete
    }));
    setEditingServiceKey(null);
  };

  const updateCompanyInfo = (serviceType: string, category: string, optionIndex: number, field: keyof CompanyInfo, value: string) => {
    const key = `${serviceType}-${category}-${optionIndex}`;
    setServiceOverrides(prev => {
      const current = prev[key] || {};
      const companyInfo = { ...current.companyInfo, [field]: value };
      return {
        ...prev,
        [key]: { ...current, companyInfo }
      };
    });
  };

  const updateSocialMedia = (serviceType: string, category: string, optionIndex: number, platform: 'facebook' | 'instagram' | 'tiktok', value: string) => {
    const key = `${serviceType}-${category}-${optionIndex}`;
    setServiceOverrides(prev => {
      const current = prev[key] || {};
      const socialMedia = { ...current.companyInfo?.socialMedia, [platform]: value };
      const companyInfo = { ...current.companyInfo, socialMedia };
      return {
        ...prev,
        [key]: { ...current, companyInfo }
      };
    });
  };

  const addNewService = () => {
    if (!newServiceForm.name || newServiceForm.price <= 0 || !addServiceContext) {
      alert('Por favor, preencha o nome e um preço válido');
      return;
    }

    const key = `${addServiceContext.category}-${addServiceContext.priceRange}`;
    const newService: ServiceOption = {
      name: newServiceForm.name,
      basePrice: newServiceForm.price,
      multiplier: 1.0,
      category: addServiceContext.priceRange,
      companyInfo: {}
    };

    setNewServices(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), newService]
    }));

    // Resetar formulário e fechar modal
    setNewServiceForm({
      name: '',
      price: 0
    });
    setShowAddServiceModal(false);
    setAddServiceContext(null);
  };

  // Atualizar cotações (simulado - em produção, usar API real)
  useEffect(() => {
    const updateRates = () => {
      setExchangeRates(prev => ({
        ...prev,
        EUR: { ...prev.EUR, rate: 0.85 + (Math.random() - 0.5) * 0.1 },
        GBP: { ...prev.GBP, rate: 0.73 + (Math.random() - 0.5) * 0.1 },
        ARS: { ...prev.ARS, rate: 1000 + (Math.random() - 0.5) * 100 },
        BRL: { ...prev.BRL, rate: 5.2 + (Math.random() - 0.5) * 0.5 },
        BTC: { ...prev.BTC, rate: 0.000023 + (Math.random() - 0.5) * 0.000005 }
      }));
    };
    
    updateRates();
    const interval = setInterval(updateRates, 30000); // Atualiza a cada 30s
    return () => clearInterval(interval);
  }, []);

  // Calcular preço usando useMemo (não causa re-render infinito)
  const totalPrice = useMemo(() => {
    try {
      let basePrice = 0;

      // Calcular preço base dos serviços selecionados
      Object.entries(PATAGONIA_SERVICES).forEach(([category, service]) => {
        Object.entries(service.categories).forEach(([catType, categoryData]) => {
          categoryData.options.forEach((_, optionIndex) => {
            const option = getServiceOption(category, catType, optionIndex);
            if ((option as ServiceOptionWithDelete).deleted) return; // Pular deletados

            if (formData.services.includes(`${category}-${catType}-${option.name}`)) {
              const price = Number(option.basePrice);
              if (!isNaN(price) && price >= 0) {
                basePrice += price * formData.duration;
              }
            }
          });
        });
      });

      // Adicionar novos serviços da Patagônia
      Object.entries(newServices).forEach(([key, services]) => {
        services.forEach(service => {
          const serviceKey = `new-${key.split('-')[0]}-${key.split('-')[1]}-${service.name}`;
          if (formData.services.includes(serviceKey)) {
            const price = Number(service.basePrice);
            if (!isNaN(price) && price >= 0) {
              basePrice += price * formData.duration;
            }
          }
        });
      });

      // Adicionar serviços customizados
      formData.customServices.forEach(service => {
        const price = Number(service.price);
        if (!isNaN(price) && price >= 0) {
          basePrice += price * formData.duration;
        }
      });

      // Aplicar multiplicadores por temporada
      const seasonMultipliers = {
        low: 0.7,
        medium: 1.0,
        high: 1.4,
        peak: 1.8
      };
      basePrice *= seasonMultipliers[formData.season as keyof typeof seasonMultipliers];

      // Aplicar multiplicador por número de hóspedes
      if (formData.guests > 2) {
        basePrice *= 1 + (formData.guests - 2) * 0.3;
      }

      // Adicionar custos de consultoria
      const consultationPrice = formData.consultationHours * 150; // $150/hora
      basePrice += consultationPrice;

      // Aplicar markup
      const finalPrice = basePrice * (1 + formData.markup / 100);

      // Verificar se é um número válido
      if (!isNaN(finalPrice) && isFinite(finalPrice)) {
        return finalPrice;
      }
      return 0;
    } catch (error) {
      console.error('Erro ao calcular preço:', error);
      return 0;
    }
  }, [formData, serviceOverrides, newServices]);

  const formatPrice = (price: number, currency: string) => {
    const currencyData = exchangeRates[currency as keyof typeof exchangeRates];
    const convertedPrice = price * currencyData.rate;
    
    if (currency === 'BTC') {
      return `${currencyData.symbol}${convertedPrice.toFixed(8)}`;
    }
    
    return `${currencyData.symbol}${convertedPrice.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const handleServiceToggle = (category: string, catType: string, serviceName: string) => {
    const serviceKey = `${category}-${catType}-${serviceName}`;
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceKey)
        ? prev.services.filter(s => s !== serviceKey)
        : [...prev.services, serviceKey]
    }));
  };

  const toggleServiceExpansion = (category: string, catType: string, optionIndex: number) => {
    const key = `${category}-${catType}-${optionIndex}`;
    setExpandedServices(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const addCustomService = () => {
    const name = prompt('Nome do serviço:');
    const price = parseFloat(prompt('Preço base (USD):') || '0');
    if (name && price > 0) {
      setFormData(prev => ({
        ...prev,
        customServices: [...prev.customServices, { name, price }]
      }));
    }
  };

  const generateHTMLOnline = () => {
    // Coletar serviços selecionados
    const selectedServices: string[] = [];

    Object.entries(PATAGONIA_SERVICES).forEach(([category, service]) => {
      Object.entries(service.categories).forEach(([catType, categoryData]) => {
        categoryData.options.forEach((_, optionIndex) => {
          const option = getServiceOption(category, catType, optionIndex);
          if ((option as ServiceOptionWithDelete).deleted) return;

          if (formData.services.includes(`${category}-${catType}-${option.name}`)) {
            selectedServices.push(`<li>${option.name} - ${formatPrice(option.basePrice, formData.currency)}/dia</li>`);
          }
        });
      });
    });

    formData.customServices.forEach(service => {
      selectedServices.push(`<li>${service.name} - ${formatPrice(service.price, formData.currency)}/dia</li>`);
    });

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Proposta Comercial - Patagônia</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            color: #333;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 50px 40px;
            text-align: center;
        }
        .header h1 {
            font-size: 36px;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .header p {
            font-size: 18px;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .section {
            margin-bottom: 35px;
            padding-bottom: 25px;
            border-bottom: 2px solid #f0f0f0;
        }
        .section:last-child {
            border-bottom: none;
        }
        .section-title {
            font-size: 22px;
            color: #667eea;
            margin-bottom: 20px;
            font-weight: 600;
            display: flex;
            align-items: center;
        }
        .section-title:before {
            content: '';
            width: 4px;
            height: 24px;
            background: #667eea;
            margin-right: 12px;
            border-radius: 2px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .info-item {
            background: #f8f9fa;
            padding: 15px 20px;
            border-radius: 10px;
            border-left: 4px solid #667eea;
        }
        .info-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
        }
        .info-value {
            font-size: 18px;
            font-weight: 600;
            color: #333;
        }
        .services-list {
            list-style: none;
            padding: 0;
        }
        .services-list li {
            padding: 12px 20px;
            background: #f8f9fa;
            margin-bottom: 10px;
            border-radius: 8px;
            border-left: 4px solid #764ba2;
            font-size: 15px;
        }
        .price-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            margin: 30px 0;
        }
        .price-box .label {
            font-size: 16px;
            opacity: 0.9;
            margin-bottom: 10px;
        }
        .price-box .value {
            font-size: 48px;
            font-weight: bold;
            margin-bottom: 20px;
        }
        .price-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        .price-detail {
            background: rgba(255,255,255,0.2);
            padding: 15px;
            border-radius: 10px;
        }
        .price-detail .label {
            font-size: 12px;
            opacity: 0.9;
        }
        .price-detail .value {
            font-size: 20px;
            font-weight: 600;
            margin-top: 5px;
        }
        .conversions {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        .conversion-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .conversion-label {
            font-size: 14px;
            color: #666;
        }
        .conversion-value {
            font-size: 16px;
            font-weight: 600;
            color: #333;
        }
        .footer {
            background: #f8f9fa;
            padding: 30px 40px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .footer strong {
            color: #667eea;
            font-size: 16px;
        }
        @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; }
        }
        @media (max-width: 768px) {
            .header h1 { font-size: 28px; }
            .content { padding: 20px; }
            .price-box .value { font-size: 36px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏔️ Proposta Comercial</h1>
            <p>Experiência Premium na Patagônia</p>
        </div>

        <div class="content">
            <div class="section">
                <div class="section-title">Informações do Cliente</div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Cliente</div>
                        <div class="info-value">${user?.displayName || user?.name || 'Cliente'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Data</div>
                        <div class="info-value">${new Date().toLocaleDateString('pt-BR')}</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Detalhes da Viagem</div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Duração</div>
                        <div class="info-value">${formData.duration} dias</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Hóspedes</div>
                        <div class="info-value">${formData.guests} pessoas</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Temporada</div>
                        <div class="info-value">${formData.season === 'low' ? 'Baixa' : formData.season === 'medium' ? 'Média' : formData.season === 'high' ? 'Alta' : 'Pico'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Categoria</div>
                        <div class="info-value">${formData.priceRange === 'all' ? 'Mista' : formData.priceRange === 'luxury' ? 'Luxo' : 'Média Renda'}</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Serviços Inclusos</div>
                ${selectedServices.length > 0 ?
                    `<ul class="services-list">${selectedServices.join('')}</ul>` :
                    '<p style="color: #999; font-style: italic;">Nenhum serviço selecionado</p>'
                }
            </div>

            ${formData.consultationHours > 0 ? `
            <div class="section">
                <div class="section-title">Consultoria Especializada</div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Horas de Consultoria</div>
                        <div class="info-value">${formData.consultationHours}h</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Custo</div>
                        <div class="info-value">${formatPrice(formData.consultationHours * 150, formData.currency)}</div>
                    </div>
                </div>
            </div>
            ` : ''}

            <div class="price-box">
                <div class="label">Valor Total do Pacote</div>
                <div class="value">${formatPrice(totalPrice, formData.currency)}</div>
                <div class="price-details">
                    <div class="price-detail">
                        <div class="label">Por Pessoa</div>
                        <div class="value">${formatPrice(totalPrice / formData.guests, formData.currency)}</div>
                    </div>
                    <div class="price-detail">
                        <div class="label">Por Dia</div>
                        <div class="value">${formatPrice(totalPrice / formData.duration, formData.currency)}</div>
                    </div>
                    <div class="price-detail">
                        <div class="label">Markup</div>
                        <div class="value">${formData.markup}%</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Conversões de Moeda</div>
                <div class="conversions">
                    ${Object.entries(exchangeRates).slice(0, 6).map(([code, curr]) => `
                        <div class="conversion-item">
                            <span class="conversion-label">${curr.name}</span>
                            <span class="conversion-value">${formatPrice(totalPrice, code)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <div class="footer">
            <strong>Patagonia Company</strong><br>
            Sistema de Gestão de Viagens Premium<br>
            Proposta gerada em ${new Date().toLocaleString('pt-BR')}
        </div>
    </div>
</body>
</html>
    `;

    // Abrir em nova aba
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');

    if (newWindow) {
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
      alert('✅ Proposta aberta em nova aba!\n\nVocê pode:\n• Copiar o link da barra de endereços\n• Compartilhar com o cliente\n• Salvar como PDF (Ctrl+P)');
    } else {
      alert('⚠️ Pop-up bloqueado! Permita pop-ups para este site e tente novamente.');
    }
  };

  const generateHTML = () => {
    // Coletar serviços selecionados com detalhes completos
    const selectedServices: {name: string, price: number, category: string}[] = [];

    Object.entries(PATAGONIA_SERVICES).forEach(([category, service]) => {
      Object.entries(service.categories).forEach(([catType, categoryData]) => {
        categoryData.options.forEach((_, optionIndex) => {
          const option = getServiceOption(category, catType, optionIndex);
          if ((option as ServiceOptionWithDelete).deleted) return;

          if (formData.services.includes(`${category}-${catType}-${option.name}`)) {
            selectedServices.push(`<li>${option.name} - ${formatPrice(option.basePrice, formData.currency)}/dia</li>`);
          }
        });
      });
    });

    formData.customServices.forEach(service => {
      selectedServices.push(`<li>${service.name} - ${formatPrice(service.price, formData.currency)}/dia</li>`);
    });

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Proposta Comercial - Patagônia</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #F8FAFC;
            padding: 0;
            color: #0F172A;
            line-height: 1.6;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
        }

        /* Urgency Banner */
        .urgency-banner {
            background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
            color: white;
            padding: 16px 40px;
            text-align: center;
            font-weight: 600;
            font-size: 14px;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 6px rgba(239, 68, 68, 0.2);
        }

        .urgency-banner .icon {
            margin-right: 8px;
        }

        /* Header with Gradient */
        .header {
            background: linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%);
            color: white;
            padding: 60px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            opacity: 0.3;
        }

        .header-content {
            position: relative;
            z-index: 1;
        }

        .header h1 {
            font-size: 42px;
            margin-bottom: 12px;
            font-weight: 800;
            letter-spacing: -1px;
        }

        .header .subtitle {
            font-size: 18px;
            opacity: 0.9;
            font-weight: 400;
            margin-bottom: 24px;
        }

        .header .logo {
            font-size: 48px;
            margin-bottom: 16px;
        }

        /* Social Proof Banner */
        .social-proof {
            background: #F1F5F9;
            padding: 24px 40px;
            text-align: center;
            border-bottom: 1px solid #E2E8F0;
        }

        .social-proof-content {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 40px;
            flex-wrap: wrap;
        }

        .social-proof-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: #475569;
        }

        .social-proof-item .icon {
            font-size: 20px;
        }

        .social-proof-item strong {
            color: #0F172A;
            font-weight: 600;
        }

        /* Content Area */
        .content {
            padding: 48px 40px;
        }

        /* Section Styling */
        .section {
            margin-bottom: 48px;
        }

        .section-header {
            display: flex;
            align-items: center;
            margin-bottom: 24px;
            padding-bottom: 12px;
            border-bottom: 2px solid #E2E8F0;
        }

        .section-icon {
            font-size: 28px;
            margin-right: 12px;
        }

        .section-title {
            font-size: 24px;
            color: #0F172A;
            font-weight: 700;
            letter-spacing: -0.5px;
        }

        /* Info Cards */
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 24px;
        }

        .info-card {
            background: #F8FAFC;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #E2E8F0;
            transition: all 0.3s ease;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .info-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0,0,0,0.1);
            border-color: #3B82F6;
        }

        .info-label {
            font-size: 11px;
            color: #64748B;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
            font-weight: 600;
        }

        .info-value {
            font-size: 20px;
            font-weight: 700;
            color: #0F172A;
        }

        /* Services List */
        .services-list {
            list-style: none;
            padding: 0;
        }

        .services-list li {
            padding: 16px 20px;
            background: white;
            margin-bottom: 12px;
            border-radius: 10px;
            border: 1px solid #E2E8F0;
            font-size: 15px;
            display: flex;
            align-items: center;
            transition: all 0.2s ease;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .services-list li:hover {
            border-color: #10B981;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
            transform: translateX(4px);
        }

        .services-list li::before {
            content: '✓';
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            background: #10B981;
            color: white;
            border-radius: 50%;
            margin-right: 12px;
            font-weight: 700;
            font-size: 14px;
            flex-shrink: 0;
        }

        /* Price Box - Hero Element */
        .price-box {
            background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
            color: white;
            padding: 48px 40px;
            border-radius: 20px;
            text-align: center;
            margin: 48px 0;
            box-shadow: 0 20px 40px rgba(59, 130, 246, 0.3);
            position: relative;
            overflow: hidden;
        }

        .price-box::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: pulse 4s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.8; }
        }

        .price-box-content {
            position: relative;
            z-index: 1;
        }

        .price-box .label {
            font-size: 14px;
            opacity: 0.95;
            margin-bottom: 16px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            font-weight: 500;
        }

        .price-box .value {
            font-size: 64px;
            font-weight: 800;
            margin-bottom: 32px;
            letter-spacing: -2px;
            text-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .price-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin-top: 32px;
        }

        .price-detail {
            background: rgba(255,255,255,0.15);
            padding: 20px;
            border-radius: 12px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        }

        .price-detail .label {
            font-size: 12px;
            opacity: 0.9;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .price-detail .value {
            font-size: 22px;
            font-weight: 700;
            margin-top: 4px;
        }

        /* Currency Conversions */
        .conversions {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
        }

        .conversion-item {
            background: #F8FAFC;
            padding: 16px 20px;
            border-radius: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 1px solid #E2E8F0;
            transition: all 0.2s ease;
        }

        .conversion-item:hover {
            background: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .conversion-label {
            font-size: 14px;
            color: #64748B;
            font-weight: 500;
        }

        .conversion-value {
            font-size: 16px;
            font-weight: 700;
            color: #0F172A;
        }

        /* Trust Badges */
        .trust-section {
            background: linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%);
            padding: 40px;
            border-radius: 16px;
            margin: 48px 0;
        }

        .trust-badges {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 24px;
            text-align: center;
        }

        .trust-badge {
            padding: 20px;
        }

        .trust-badge .icon {
            font-size: 40px;
            margin-bottom: 12px;
        }

        .trust-badge .title {
            font-size: 16px;
            font-weight: 700;
            color: #0F172A;
            margin-bottom: 6px;
        }

        .trust-badge .description {
            font-size: 13px;
            color: #64748B;
            line-height: 1.5;
        }

        /* CTA Section */
        .cta-section {
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            padding: 48px 40px;
            border-radius: 16px;
            text-align: center;
            margin: 48px 0;
            box-shadow: 0 20px 40px rgba(16, 185, 129, 0.3);
        }

        .cta-section h3 {
            font-size: 28px;
            color: white;
            margin-bottom: 16px;
            font-weight: 700;
        }

        .cta-section p {
            font-size: 16px;
            color: rgba(255,255,255,0.95);
            margin-bottom: 28px;
            line-height: 1.6;
        }

        .cta-button {
            display: inline-block;
            background: white;
            color: #059669;
            padding: 18px 40px;
            border-radius: 12px;
            font-size: 18px;
            font-weight: 700;
            text-decoration: none;
            transition: all 0.3s ease;
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
            letter-spacing: 0.5px;
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 28px rgba(0,0,0,0.2);
        }

        /* Footer */
        .footer {
            background: #0F172A;
            color: #94A3B8;
            padding: 40px;
            text-align: center;
            font-size: 14px;
            line-height: 1.8;
        }

        .footer strong {
            color: white;
            font-size: 18px;
            font-weight: 700;
            display: block;
            margin-bottom: 12px;
        }

        .footer .separator {
            margin: 0 8px;
            opacity: 0.5;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .header {
                padding: 40px 24px;
            }

            .header h1 {
                font-size: 32px;
            }

            .content {
                padding: 32px 24px;
            }

            .price-box .value {
                font-size: 48px;
            }

            .social-proof-content {
                flex-direction: column;
                gap: 16px;
            }

            .info-grid {
                grid-template-columns: 1fr;
            }
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }
            .container {
                box-shadow: none;
            }
            .urgency-banner {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Urgency Banner -->
        <div class="urgency-banner">
            <span class="icon">⏰</span>
            <strong>PROPOSTA VÁLIDA POR 48 HORAS</strong> - Reserve agora e garanta este preço especial!
        </div>

        <!-- Header -->
        <div class="header">
            <div class="header-content">
                <div class="logo">🏔️</div>
                <h1>Proposta Comercial</h1>
                <p class="subtitle">Sua Experiência Premium na Patagônia</p>
            </div>
        </div>

        <!-- Social Proof -->
        <div class="social-proof">
            <div class="social-proof-content">
                <div class="social-proof-item">
                    <span class="icon">👥</span>
                    <span><strong>500+</strong> clientes satisfeitos</span>
                </div>
                <div class="social-proof-item">
                    <span class="icon">⭐</span>
                    <span><strong>4.9/5</strong> avaliação média</span>
                </div>
                <div class="social-proof-item">
                    <span class="icon">🏆</span>
                    <span><strong>15 anos</strong> de experiência</span>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="content">
            <!-- Client Info -->
            <div class="section">
                <div class="section-header">
                    <span class="section-icon">👤</span>
                    <h2 class="section-title">Informações do Cliente</h2>
                </div>
                <div class="info-grid">
                    <div class="info-card">
                        <div class="info-label">Cliente</div>
                        <div class="info-value">${user?.displayName || user?.name || 'Cliente'}</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">Data da Proposta</div>
                        <div class="info-value">${new Date().toLocaleDateString('pt-BR')}</div>
                    </div>
                </div>
            </div>

            <!-- Trip Details -->
            <div class="section">
                <div class="section-header">
                    <span class="section-icon">✈️</span>
                    <h2 class="section-title">Detalhes da Viagem</h2>
                </div>
                <div class="info-grid">
                    <div class="info-card">
                        <div class="info-label">Duração</div>
                        <div class="info-value">${formData.duration} dias</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">Hóspedes</div>
                        <div class="info-value">${formData.guests} pessoas</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">Temporada</div>
                        <div class="info-value">${formData.season === 'low' ? 'Baixa' : formData.season === 'medium' ? 'Média' : formData.season === 'high' ? 'Alta' : 'Pico'}</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">Categoria</div>
                        <div class="info-value">${formData.priceRange === 'all' ? 'Mista' : formData.priceRange === 'luxury' ? 'Luxo' : 'Média Renda'}</div>
                    </div>
                </div>
            </div>

            <!-- Services -->
            <div class="section">
                <div class="section-header">
                    <span class="section-icon">🎯</span>
                    <h2 class="section-title">Serviços Inclusos</h2>
                </div>
                ${selectedServices.length > 0 ?
                    `<ul class="services-list">${selectedServices.join('')}</ul>` :
                    '<p style="color: #94A3B8; font-style: italic; padding: 20px; text-align: center; background: #F8FAFC; border-radius: 10px;">Nenhum serviço selecionado</p>'
                }
            </div>

            <!-- Consultation -->
            ${formData.consultationHours > 0 ? `
            <div class="section">
                <div class="section-header">
                    <span class="section-icon">💼</span>
                    <h2 class="section-title">Consultoria Especializada</h2>
                </div>
                <div class="info-grid">
                    <div class="info-card">
                        <div class="info-label">Horas de Consultoria</div>
                        <div class="info-value">${formData.consultationHours}h</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">Investimento</div>
                        <div class="info-value">${formatPrice(formData.consultationHours * 150, formData.currency)}</div>
                    </div>
                </div>
            </div>
            ` : ''}

            <!-- Price Box -->
            <div class="price-box">
                <div class="price-box-content">
                    <div class="label">Investimento Total</div>
                    <div class="value">${formatPrice(totalPrice, formData.currency)}</div>
                    <div class="price-details">
                        <div class="price-detail">
                            <div class="label">Por Pessoa</div>
                            <div class="value">${formatPrice(totalPrice / formData.guests, formData.currency)}</div>
                        </div>
                        <div class="price-detail">
                            <div class="label">Por Dia</div>
                            <div class="value">${formatPrice(totalPrice / formData.duration, formData.currency)}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Trust Badges -->
            <div class="trust-section">
                <div class="trust-badges">
                    <div class="trust-badge">
                        <div class="icon">🔒</div>
                        <div class="title">Pagamento Seguro</div>
                        <div class="description">Transações protegidas e criptografadas</div>
                    </div>
                    <div class="trust-badge">
                        <div class="icon">🎁</div>
                        <div class="title">Melhor Preço</div>
                        <div class="description">Garantimos o melhor custo-benefício</div>
                    </div>
                    <div class="trust-badge">
                        <div class="icon">📞</div>
                        <div class="title">Suporte 24/7</div>
                        <div class="description">Assistência completa durante sua viagem</div>
                    </div>
                    <div class="trust-badge">
                        <div class="icon">✨</div>
                        <div class="title">Experiência Premium</div>
                        <div class="description">Serviços selecionados com excelência</div>
                    </div>
                </div>
            </div>

            <!-- Currency Conversions -->
            <div class="section">
                <div class="section-header">
                    <span class="section-icon">💱</span>
                    <h2 class="section-title">Conversões de Moeda</h2>
                </div>
                <div class="conversions">
                    ${Object.entries(exchangeRates).slice(0, 6).map(([code, curr]) => `
                        <div class="conversion-item">
                            <span class="conversion-label">${curr.name}</span>
                            <span class="conversion-value">${formatPrice(totalPrice, code)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- CTA Section -->
            <div class="cta-section">
                <h3>Pronto para Realizar Sua Viagem dos Sonhos?</h3>
                <p>Entre em contato conosco agora e garanta esta proposta especial!<br>Nossa equipe está pronta para personalizar cada detalhe da sua experiência.</p>
                <a href="mailto:contato@patagonia.com" class="cta-button">📧 Aceitar Proposta</a>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <strong>🏔️ Patagonia Company</strong>
            Sistema Premium de Gestão de Viagens
            <br>
            <span class="separator">•</span>
            Proposta gerada em ${new Date().toLocaleString('pt-BR')}
            <span class="separator">•</span>
            <br>
            <small style="opacity: 0.7; font-size: 12px;">Esta proposta é confidencial e destinada exclusivamente ao cliente especificado</small>
        </div>
    </div>
</body>
</html>
    `;

    // Debug: verificar se o markup está no HTML
    console.log('=== DEBUG PROPOSTA HTML ===');
    console.log('Markup configurado:', formData.markup);
    console.log('HTML contém "Markup"?', htmlContent.includes('Markup'));
    console.log('HTML contém valor do markup?', htmlContent.includes(`${formData.markup}%`));

    // Criar blob e fazer download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Proposta_Patagonia_Markup${formData.markup}_${new Date().getTime()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`✅ Proposta HTML gerada com Markup de ${formData.markup}%!\n\nArquivo: Proposta_Patagonia_Markup${formData.markup}_...\n\nAbra o console (F12) para ver detalhes do debug.`);
  };

  const generatePDF = async () => {
    try {
      // Import dinâmico das bibliotecas
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;

      // Criar elemento temporário com o conteúdo
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '800px';
      tempDiv.style.background = 'white';
      tempDiv.style.padding = '40px';

      // Coletar serviços selecionados
      const selectedServices: string[] = [];
      Object.entries(PATAGONIA_SERVICES).forEach(([category, service]) => {
        Object.entries(service.categories).forEach(([catType, categoryData]) => {
          categoryData.options.forEach((_, optionIndex) => {
            const option = getServiceOption(category, catType, optionIndex);
            if ((option as ServiceOptionWithDelete).deleted) return;

            if (formData.services.includes(`${category}-${catType}-${option.name}`)) {
              selectedServices.push(`${option.name} - ${formatPrice(option.basePrice, formData.currency)}/dia`);
            }
          });
        });
      });

      formData.customServices.forEach(service => {
        selectedServices.push(`${service.name} - ${formatPrice(service.price, formData.currency)}/dia`);
      });

      tempDiv.innerHTML = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #333;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; margin: -40px -40px 30px -40px; border-radius: 10px 10px 0 0;">
            <h1 style="font-size: 32px; margin: 0 0 10px 0;">🏔️ PROPOSTA COMERCIAL</h1>
            <p style="font-size: 16px; margin: 0;">Experiência Premium na Patagônia</p>
          </div>

          <div style="margin-bottom: 25px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
            <h2 style="color: #667eea; font-size: 18px; margin: 0 0 15px 0;">Cliente</h2>
            <p style="margin: 5px 0;"><strong>Nome:</strong> ${user?.displayName || user?.name || 'Cliente'}</p>
            <p style="margin: 5px 0;"><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
          </div>

          <div style="margin-bottom: 25px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
            <h2 style="color: #667eea; font-size: 18px; margin: 0 0 15px 0;">Detalhes da Viagem</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <p style="margin: 5px 0;"><strong>Duração:</strong> ${formData.duration} dias</p>
              <p style="margin: 5px 0;"><strong>Hóspedes:</strong> ${formData.guests} pessoas</p>
              <p style="margin: 5px 0;"><strong>Temporada:</strong> ${formData.season === 'low' ? 'Baixa' : formData.season === 'medium' ? 'Média' : formData.season === 'high' ? 'Alta' : 'Pico'}</p>
              <p style="margin: 5px 0;"><strong>Categoria:</strong> ${formData.priceRange === 'all' ? 'Mista' : formData.priceRange === 'luxury' ? 'Luxo' : 'Média Renda'}</p>
            </div>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="color: #667eea; font-size: 18px; margin: 0 0 15px 0;">Serviços Inclusos</h2>
            ${selectedServices.length > 0 ?
              selectedServices.map((s, i) => `<p style="margin: 8px 0; padding: 10px; background: #f8f9fa; border-left: 4px solid #764ba2; border-radius: 5px;">${i + 1}. ${s}</p>`).join('') :
              '<p style="color: #999; font-style: italic;">Nenhum serviço selecionado</p>'
            }
          </div>

          ${formData.consultationHours > 0 ? `
          <div style="margin-bottom: 25px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
            <h2 style="color: #667eea; font-size: 18px; margin: 0 0 15px 0;">Consultoria</h2>
            <p style="margin: 5px 0;"><strong>Horas:</strong> ${formData.consultationHours}h</p>
            <p style="margin: 5px 0;"><strong>Custo:</strong> ${formatPrice(formData.consultationHours * 150, formData.currency)}</p>
          </div>
          ` : ''}

          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; margin: 30px 0;">
            <p style="font-size: 14px; margin: 0 0 10px 0;">Valor Total do Pacote</p>
            <h1 style="font-size: 42px; margin: 0 0 20px 0;">${formatPrice(totalPrice, formData.currency)}</h1>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
              <div>
                <p style="font-size: 12px; opacity: 0.9; margin: 0;">Por Pessoa</p>
                <p style="font-size: 18px; font-weight: bold; margin: 5px 0 0 0;">${formatPrice(totalPrice / formData.guests, formData.currency)}</p>
              </div>
              <div>
                <p style="font-size: 12px; opacity: 0.9; margin: 0;">Por Dia</p>
                <p style="font-size: 18px; font-weight: bold; margin: 5px 0 0 0;">${formatPrice(totalPrice / formData.duration, formData.currency)}</p>
              </div>
              <div>
                <p style="font-size: 12px; opacity: 0.9; margin: 0;">Markup</p>
                <p style="font-size: 18px; font-weight: bold; margin: 5px 0 0 0;">${formData.markup}%</p>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="color: #667eea; font-size: 18px; margin: 0 0 15px 0;">Conversões de Moeda</h2>
            ${Object.entries(exchangeRates).slice(0, 6).map(([code, curr]) =>
              `<p style="margin: 8px 0; padding: 10px; background: #f8f9fa; border-radius: 5px; display: flex; justify-content: space-between;">
                <span>${curr.name}</span>
                <strong>${formatPrice(totalPrice, code)}</strong>
              </p>`
            ).join('')}
          </div>

          <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px; margin-top: 30px;">
            <strong style="color: #667eea; font-size: 16px;">Patagonia Company</strong><br>
            <span style="font-size: 14px; color: #666;">Sistema de Gestão de Viagens Premium</span><br>
            <span style="font-size: 12px; color: #999;">Proposta gerada em ${new Date().toLocaleString('pt-BR')}</span>
          </div>
        </div>
      `;

      document.body.appendChild(tempDiv);

      // Converter para canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Criar PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Adicionar primeira página
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297; // A4 height in mm

      // Adicionar páginas adicionais se necessário
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      // Salvar PDF
      pdf.save(`Proposta_Patagonia_${new Date().getTime()}.pdf`);

      document.body.removeChild(tempDiv);
      alert('✅ PDF gerado e baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('❌ Erro ao gerar PDF. Tente novamente.');
    }
  };

  const generateProposal = () => {
    // Coletar serviços selecionados
    const selectedServices: string[] = [];

    Object.entries(PATAGONIA_SERVICES).forEach(([category, service]) => {
      Object.entries(service.categories).forEach(([catType, categoryData]) => {
        categoryData.options.forEach((_, optionIndex) => {
          const option = getServiceOption(category, catType, optionIndex);
          if ((option as ServiceOptionWithDelete).deleted) return;

          if (formData.services.includes(`${category}-${catType}-${option.name}`)) {
            selectedServices.push(`${option.name} - ${formatPrice(option.basePrice, formData.currency)}/dia`);
          }
        });
      });
    });

    formData.customServices.forEach(service => {
      selectedServices.push(`${service.name} - ${formatPrice(service.price, formData.currency)}/dia`);
    });

    // Gerar texto da proposta
    const proposalText = `
═══════════════════════════════════════════
    PROPOSTA COMERCIAL - PATAGÔNIA
═══════════════════════════════════════════

Cliente: ${user?.displayName || user?.name || 'Cliente'}
Data: ${new Date().toLocaleDateString('pt-BR')}

DETALHES DA VIAGEM:
─────────────────────────────────────────
• Duração: ${formData.duration} dias
• Número de hóspedes: ${formData.guests}
• Temporada: ${formData.season === 'low' ? 'Baixa' : formData.season === 'medium' ? 'Média' : formData.season === 'high' ? 'Alta' : 'Pico'}
• Faixa de preço: ${formData.priceRange === 'all' ? 'Mista' : formData.priceRange === 'luxury' ? 'Luxo' : 'Média Renda'}

SERVIÇOS INCLUSOS:
─────────────────────────────────────────
${selectedServices.length > 0 ? selectedServices.map((s, i) => `${i + 1}. ${s}`).join('\n') : '(Nenhum serviço selecionado)'}

${formData.consultationHours > 0 ? `\nCONSULTORIA:
─────────────────────────────────────────
• ${formData.consultationHours} horas de consultoria especializada
• Custo: ${formatPrice(formData.consultationHours * 150, formData.currency)}
` : ''}

VALORES:
─────────────────────────────────────────
• Valor Total: ${formatPrice(totalPrice, formData.currency)}
• Valor por pessoa: ${formatPrice(totalPrice / formData.guests, formData.currency)}
• Valor por dia: ${formatPrice(totalPrice / formData.duration, formData.currency)}
• Markup aplicado: ${formData.markup}%

CONVERSÕES:
─────────────────────────────────────────
${Object.entries(exchangeRates).slice(0, 6).map(([code, curr]) =>
  `• ${curr.name}: ${formatPrice(totalPrice, code)}`
).join('\n')}

═══════════════════════════════════════════
Proposta gerada em ${new Date().toLocaleString('pt-BR')}
Patagonia Company - Sistema de Gestão
═══════════════════════════════════════════
    `;

    // Copiar para clipboard e mostrar alert
    navigator.clipboard.writeText(proposalText).then(() => {
      alert('✅ Proposta copiada para a área de transferência!\n\nVocê pode colar em um email, WhatsApp ou documento.');
    }).catch(() => {
      // Se falhar ao copiar, mostrar em um prompt
      prompt('Proposta gerada! Copie o texto abaixo:', proposalText);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-300">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acesso Negado</h1>
          <p className="text-gray-300">Você precisa fazer login para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <ModernLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Crown className="h-10 w-10 text-yellow-400" />
            Calculadora de Concierge Patagônia
          </h1>
          <p className="text-white/70 text-lg">
            Precificação profissional para pacotes de luxo na Patagônia
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Configurações Básicas */}
          <Card className="bg-white/5 backdrop-blur-2xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calculator className="h-5 w-5 text-indigo-400" />
                Configurações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/80">Duração (dias)</Label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white/80">Hóspedes</Label>
                  <Input
                    type="number"
                    value={formData.guests}
                    onChange={(e) => setFormData(prev => ({ ...prev, guests: parseInt(e.target.value) || 1 }))}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-white/80">Temporada</Label>
                <select
                  value={formData.season}
                  onChange={(e) => setFormData(prev => ({ ...prev, season: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 mt-1"
                >
                  <option value="low" className="bg-gray-800">Baixa (Abr-Set)</option>
                  <option value="medium" className="bg-gray-800">Média (Out-Mar)</option>
                  <option value="high" className="bg-gray-800">Alta (Dez-Fev)</option>
                  <option value="peak" className="bg-gray-800">Pico (Jan)</option>
                </select>
              </div>

              <div>
                <Label className="text-white/80">Moeda</Label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 mt-1"
                >
                  {Object.entries(CURRENCIES).map(([code, currency]) => (
                    <option key={code} value={code} className="bg-gray-800">
                      {currency.symbol} {currency.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-white/80">Markup (%)</Label>
                <Input
                  type="number"
                  value={formData.markup}
                  onChange={(e) => setFormData(prev => ({ ...prev, markup: parseFloat(e.target.value) || 0 }))}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div>
                <Label className="text-white/80">Horas de Consultoria</Label>
                <Input
                  type="number"
                  value={formData.consultationHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, consultationHours: parseInt(e.target.value) || 0 }))}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div>
                <Label className="text-white/80">Faixa de Preço</Label>
                <select
                  value={formData.priceRange}
                  onChange={(e) => setFormData(prev => ({ ...prev, priceRange: e.target.value as 'all' | 'luxury' | 'midrange' }))}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 mt-1"
                >
                  <option value="all" className="bg-gray-800">Todas as Faixas</option>
                  <option value="luxury" className="bg-gray-800">Luxo (Premium)</option>
                  <option value="midrange" className="bg-gray-800">Média Renda</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Serviços */}
          <Card className="bg-white/5 backdrop-blur-2xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                Serviços Patagônia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 max-h-96 overflow-y-auto">
              {Object.entries(PATAGONIA_SERVICES).map(([category, service]) => {
                // Não renderizar categorias deletadas
                if (isCategoryDeleted(category)) return null;

                const IconComponent = service.icon;
                return (
                  <div key={category} className="space-y-4">
                    <h3 className="text-white font-semibold flex items-center gap-2 group">
                      <IconComponent className="h-4 w-4 text-indigo-400" />
                      {getCategoryName(category)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded">
                            <MoreHorizontal className="h-4 w-4 text-gray-400" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                          <DropdownMenuItem
                            onClick={() => {
                              setAddCategoryContext({ type: 'category' });
                              setShowAddCategoryModal(true);
                            }}
                            className="text-green-400 hover:bg-green-500/10 cursor-pointer"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Novo
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditCategoryContext({
                                key: category,
                                currentName: getCategoryName(category),
                                type: 'category'
                              });
                              setShowEditCategoryModal(true);
                            }}
                            className="text-blue-400 hover:bg-blue-500/10 cursor-pointer"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              if (confirm(`Deseja realmente excluir a categoria "${getCategoryName(category)}"?`)) {
                                setCategoryOverrides(prev => ({
                                  ...prev,
                                  [category]: '__DELETED__'
                                }));
                              }
                            }}
                            className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </h3>
                    
                    {Object.entries(service.categories).map(([catType, categoryData]) => {
                      // Não renderizar faixas de preço deletadas
                      if (isPriceRangeDeleted(category, catType)) return null;

                      // Filtrar por faixa de preço se selecionada
                      if (formData.priceRange !== 'all' && formData.priceRange !== catType) {
                        return null;
                      }

                      return (
                        <div key={catType} className="space-y-3">
                          <h4 className={`font-medium flex items-center gap-2 group ${categoryData.color}`}>
                            <div className="w-2 h-2 rounded-full bg-current"></div>
                            {getPriceRangeName(category, catType)}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded">
                                  <MoreHorizontal className="h-3 w-3 text-gray-400" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setAddCategoryContext({ type: 'priceRange', parentCategory: category });
                                    setShowAddCategoryModal(true);
                                  }}
                                  className="text-green-400 hover:bg-green-500/10 cursor-pointer"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Adicionar Novo
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditCategoryContext({
                                      key: `${category}-${catType}`,
                                      currentName: getPriceRangeName(category, catType),
                                      type: 'priceRange'
                                    });
                                    setShowEditCategoryModal(true);
                                  }}
                                  className="text-blue-400 hover:bg-blue-500/10 cursor-pointer"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    const priceRangeKey = `${category}-${catType}`;
                                    if (confirm(`Deseja realmente excluir a faixa de preço "${getPriceRangeName(category, catType)}"?`)) {
                                      setPriceRangeOverrides(prev => ({
                                        ...prev,
                                        [priceRangeKey]: '__DELETED__'
                                      }));
                                    }
                                  }}
                                  className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </h4>
                          <div className="space-y-2 ml-4">
                            {categoryData.options.map((_, optionIndex) => {
                              const option = getServiceOption(category, catType, optionIndex);
                              if ((option as ServiceOptionWithDelete).deleted) return null; // Pular deletados

                              const serviceKey = `${category}-${catType}-${option.name}`;
                              const isSelected = formData.services.includes(serviceKey);
                              return (
                                <div key={option.name} className="flex items-center space-x-3 hover:bg-white/5 p-2 rounded-lg transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleServiceToggle(category, catType, option.name)}
                                    className="w-4 h-4 text-indigo-600 bg-white/10 border-white/20 rounded focus:ring-indigo-500"
                                  />
                                  <div className="flex-1">
                                    {editingServiceKey === `${category}-${catType}-${optionIndex}` ? (
                                      <div className="space-y-2">
                                        <Input
                                          value={option.name}
                                          onChange={(e) => updateServiceName(category, catType, optionIndex, e.target.value)}
                                          className="bg-white/10 border-white/20 text-white text-sm"
                                          placeholder="Nome do serviço"
                                        />
                                        <div className="flex items-center gap-2">
                                          <div className="flex items-center bg-white/10 border border-white/20 rounded-md">
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                const currentPrice = Number(option.basePrice) || 0;
                                                const newPrice = Math.max(0, currentPrice - 10);
                                                updateServicePrice(category, catType, optionIndex, newPrice);
                                              }}
                                              className="px-2 py-1 text-white hover:bg-white/10"
                                            >
                                              −
                                            </button>
                                            <input
                                              type="text"
                                              value={editingPrices[`${category}-${catType}-${optionIndex}`] ?? String(option.basePrice || 0)}
                                              onChange={(e) => {
                                                const key = `${category}-${catType}-${optionIndex}`;
                                                setEditingPrices(prev => ({ ...prev, [key]: e.target.value }));
                                              }}
                                              onBlur={(e) => {
                                                const value = Number(e.target.value);
                                                if (!isNaN(value) && value >= 0) {
                                                  updateServicePrice(category, catType, optionIndex, value);
                                                } else {
                                                  updateServicePrice(category, catType, optionIndex, 0);
                                                }
                                                const key = `${category}-${catType}-${optionIndex}`;
                                                setEditingPrices(prev => {
                                                  const newPrices = { ...prev };
                                                  delete newPrices[key];
                                                  return newPrices;
                                                });
                                              }}
                                              className="w-16 bg-transparent text-white text-center text-xs border-none focus:outline-none"
                                            />
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                const currentPrice = Number(option.basePrice) || 0;
                                                const newPrice = currentPrice + 10;
                                                updateServicePrice(category, catType, optionIndex, newPrice);
                                              }}
                                              className="px-2 py-1 text-white hover:bg-white/10"
                                            >
                                              +
                                            </button>
                                          </div>
                                          <span className="text-white/60 text-xs">USD/dia</span>
                                        </div>
                                        <select
                                          value={option.currency || 'USD'}
                                          onChange={(e) => updateServiceCurrency(category, catType, optionIndex, e.target.value)}
                                          className="w-full bg-white/10 border border-white/20 text-white rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                          {Object.entries(CURRENCIES).map(([code, curr]) => (
                                            <option key={code} value={code} className="bg-gray-800">
                                              {curr.symbol} {curr.name}
                                            </option>
                                          ))}
                                        </select>

                                        {/* Company Information Section */}
                                        <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                                          <h5 className="text-white/80 text-xs font-semibold mb-2">Informações da Empresa</h5>

                                          <Input
                                            value={option.companyInfo?.companyName || ''}
                                            onChange={(e) => updateCompanyInfo(category, catType, optionIndex, 'companyName', e.target.value)}
                                            className="bg-white/10 border-white/20 text-white text-xs"
                                            placeholder="Nome da Empresa"
                                          />

                                          <div className="grid grid-cols-2 gap-2">
                                            <Input
                                              value={option.companyInfo?.address || ''}
                                              onChange={(e) => updateCompanyInfo(category, catType, optionIndex, 'address', e.target.value)}
                                              className="bg-white/10 border-white/20 text-white text-xs"
                                              placeholder="Endereço"
                                            />
                                            <Input
                                              value={option.companyInfo?.addressNumber || ''}
                                              onChange={(e) => updateCompanyInfo(category, catType, optionIndex, 'addressNumber', e.target.value)}
                                              className="bg-white/10 border-white/20 text-white text-xs"
                                              placeholder="Número"
                                            />
                                          </div>

                                          <div className="grid grid-cols-3 gap-2">
                                            <Input
                                              value={option.companyInfo?.zipCode || ''}
                                              onChange={(e) => updateCompanyInfo(category, catType, optionIndex, 'zipCode', e.target.value)}
                                              className="bg-white/10 border-white/20 text-white text-xs"
                                              placeholder="CEP"
                                            />
                                            <Input
                                              value={option.companyInfo?.latitude || ''}
                                              onChange={(e) => updateCompanyInfo(category, catType, optionIndex, 'latitude', e.target.value)}
                                              className="bg-white/10 border-white/20 text-white text-xs"
                                              placeholder="Latitude"
                                            />
                                            <Input
                                              value={option.companyInfo?.longitude || ''}
                                              onChange={(e) => updateCompanyInfo(category, catType, optionIndex, 'longitude', e.target.value)}
                                              className="bg-white/10 border-white/20 text-white text-xs"
                                              placeholder="Longitude"
                                            />
                                          </div>

                                          <Input
                                            value={option.companyInfo?.website || ''}
                                            onChange={(e) => updateCompanyInfo(category, catType, optionIndex, 'website', e.target.value)}
                                            className="bg-white/10 border-white/20 text-white text-xs"
                                            placeholder="Website"
                                          />

                                          <div className="space-y-2">
                                            <p className="text-white/60 text-xs">Redes Sociais</p>
                                            <div className="flex items-center gap-2">
                                              <Facebook className="h-4 w-4 text-blue-400" />
                                              <Input
                                                value={option.companyInfo?.socialMedia?.facebook || ''}
                                                onChange={(e) => updateSocialMedia(category, catType, optionIndex, 'facebook', e.target.value)}
                                                className="bg-white/10 border-white/20 text-white text-xs flex-1"
                                                placeholder="Facebook URL"
                                              />
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Instagram className="h-4 w-4 text-pink-400" />
                                              <Input
                                                value={option.companyInfo?.socialMedia?.instagram || ''}
                                                onChange={(e) => updateSocialMedia(category, catType, optionIndex, 'instagram', e.target.value)}
                                                className="bg-white/10 border-white/20 text-white text-xs flex-1"
                                                placeholder="Instagram URL"
                                              />
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Music className="h-4 w-4 text-purple-400" />
                                              <Input
                                                value={option.companyInfo?.socialMedia?.tiktok || ''}
                                                onChange={(e) => updateSocialMedia(category, catType, optionIndex, 'tiktok', e.target.value)}
                                                className="bg-white/10 border-white/20 text-white text-xs flex-1"
                                                placeholder="TikTok URL"
                                              />
                                            </div>
                                          </div>

                                          <div className="grid grid-cols-2 gap-2">
                                            <Input
                                              value={option.companyInfo?.contactPhone || ''}
                                              onChange={(e) => updateCompanyInfo(category, catType, optionIndex, 'contactPhone', e.target.value)}
                                              className="bg-white/10 border-white/20 text-white text-xs"
                                              placeholder="Telefone de Contato"
                                            />
                                            <Input
                                              value={option.companyInfo?.contactPerson || ''}
                                              onChange={(e) => updateCompanyInfo(category, catType, optionIndex, 'contactPerson', e.target.value)}
                                              className="bg-white/10 border-white/20 text-white text-xs"
                                              placeholder="Nome do Contato"
                                            />
                                          </div>
                                        </div>

                                        {/* Botão Salvar */}
                                        <Button
                                          onClick={() => setEditingServiceKey(null)}
                                          className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white text-xs py-1"
                                        >
                                          Salvar
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between w-full">
                                          <div
                                            className="flex items-center gap-2 cursor-pointer flex-1"
                                            onClick={() => toggleServiceExpansion(category, catType, optionIndex)}
                                          >
                                            {expandedServices[`${category}-${catType}-${optionIndex}`] ? (
                                              <ChevronDown className="h-4 w-4 text-white/60" />
                                            ) : (
                                              <ChevronRight className="h-4 w-4 text-white/60" />
                                            )}
                                            <div>
                                              <span className="text-white text-sm">{option.name}</span>
                                              <div className="text-white/60 text-xs">
                                                {formatPrice(option.basePrice, 'USD')}/dia
                                              </div>
                                            </div>
                                          </div>
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 text-white/70 hover:text-white hover:bg-white/10"
                                              >
                                                <MoreHorizontal className="h-4 w-4" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                                              <DropdownMenuItem
                                                onClick={() => {
                                                  setAddServiceContext({ category, priceRange: catType });
                                                  setShowAddServiceModal(true);
                                                }}
                                                className="text-green-400 hover:bg-green-500/10 cursor-pointer"
                                              >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Adicionar Novo Serviço
                                              </DropdownMenuItem>
                                              <DropdownMenuItem
                                                onClick={() => {
                                                  const key = `${category}-${catType}-${optionIndex}`;
                                                  setEditingServiceKey(key);
                                                }}
                                                className="text-white hover:bg-gray-700 cursor-pointer"
                                              >
                                                <Edit className="h-4 w-4 mr-2" />
                                                Editar
                                              </DropdownMenuItem>
                                              <DropdownMenuItem
                                                onClick={() => {
                                                  if (confirm(`Deseja realmente excluir "${option.name}"?`)) {
                                                    deleteService(category, catType, optionIndex);
                                                  }
                                                }}
                                                className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                                              >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Excluir
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </div>

                                        {/* Área Expansível com Detalhes do Serviço */}
                                        {expandedServices[`${category}-${catType}-${optionIndex}`] && (
                                          <div className="mt-3 ml-6 p-3 bg-white/5 rounded-lg border border-white/10 space-y-2">
                                            <h5 className="text-white/90 text-xs font-semibold mb-2">Informações da Empresa</h5>

                                            {option.companyInfo?.companyName && (
                                              <div className="flex items-start gap-2">
                                                <span className="text-white/50 text-xs min-w-[80px]">Empresa:</span>
                                                <span className="text-white/80 text-xs">{option.companyInfo.companyName}</span>
                                              </div>
                                            )}

                                            {option.companyInfo?.address && (
                                              <div className="flex items-start gap-2">
                                                <span className="text-white/50 text-xs min-w-[80px]">Endereço:</span>
                                                <span className="text-white/80 text-xs">
                                                  {option.companyInfo.address}
                                                  {option.companyInfo.addressNumber && `, ${option.companyInfo.addressNumber}`}
                                                  {option.companyInfo.zipCode && ` - CEP: ${option.companyInfo.zipCode}`}
                                                </span>
                                              </div>
                                            )}

                                            {(option.companyInfo?.latitude || option.companyInfo?.longitude) && (
                                              <div className="flex items-start gap-2">
                                                <span className="text-white/50 text-xs min-w-[80px]">Coordenadas:</span>
                                                <span className="text-white/80 text-xs">
                                                  {option.companyInfo.latitude}, {option.companyInfo.longitude}
                                                </span>
                                              </div>
                                            )}

                                            {option.companyInfo?.website && (
                                              <div className="flex items-start gap-2">
                                                <span className="text-white/50 text-xs min-w-[80px]">Website:</span>
                                                <a
                                                  href={option.companyInfo.website}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-blue-400 text-xs hover:underline"
                                                >
                                                  {option.companyInfo.website}
                                                </a>
                                              </div>
                                            )}

                                            {option.companyInfo?.contactPhone && (
                                              <div className="flex items-start gap-2">
                                                <span className="text-white/50 text-xs min-w-[80px]">Telefone:</span>
                                                <span className="text-white/80 text-xs">{option.companyInfo.contactPhone}</span>
                                              </div>
                                            )}

                                            {option.companyInfo?.contactPerson && (
                                              <div className="flex items-start gap-2">
                                                <span className="text-white/50 text-xs min-w-[80px]">Contato:</span>
                                                <span className="text-white/80 text-xs">{option.companyInfo.contactPerson}</span>
                                              </div>
                                            )}

                                            {(option.companyInfo?.socialMedia?.facebook ||
                                              option.companyInfo?.socialMedia?.instagram ||
                                              option.companyInfo?.socialMedia?.tiktok) && (
                                              <div className="flex items-start gap-2">
                                                <span className="text-white/50 text-xs min-w-[80px]">Redes Sociais:</span>
                                                <div className="flex flex-col gap-1">
                                                  {option.companyInfo.socialMedia.facebook && (
                                                    <a
                                                      href={option.companyInfo.socialMedia.facebook}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="text-blue-400 text-xs hover:underline flex items-center gap-1"
                                                    >
                                                      <Facebook className="h-3 w-3" />
                                                      Facebook
                                                    </a>
                                                  )}
                                                  {option.companyInfo.socialMedia.instagram && (
                                                    <a
                                                      href={option.companyInfo.socialMedia.instagram}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="text-pink-400 text-xs hover:underline flex items-center gap-1"
                                                    >
                                                      <Instagram className="h-3 w-3" />
                                                      Instagram
                                                    </a>
                                                  )}
                                                  {option.companyInfo.socialMedia.tiktok && (
                                                    <a
                                                      href={option.companyInfo.socialMedia.tiktok}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="text-purple-400 text-xs hover:underline flex items-center gap-1"
                                                    >
                                                      <Music className="h-3 w-3" />
                                                      TikTok
                                                    </a>
                                                  )}
                                                </div>
                                              </div>
                                            )}

                                            {!option.companyInfo?.companyName &&
                                             !option.companyInfo?.address &&
                                             !option.companyInfo?.website && (
                                              <p className="text-white/40 text-xs italic">
                                                Nenhuma informação adicional disponível. Clique em &quot;Editar&quot; para adicionar.
                                              </p>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}

                            {/* Novos Serviços Adicionados pelo Usuário */}
                            {(() => {
                              const key = `${category}-${catType}`;
                              const addedServices = newServices[key] || [];
                              return addedServices.map((service, idx) => {
                                const serviceKey = `new-${category}-${catType}-${service.name}`;
                                const isSelected = formData.services.includes(serviceKey);

                                return (
                                  <div key={`new-${idx}`} className="flex items-center space-x-3 hover:bg-white/5 p-2 rounded-lg transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => handleServiceToggle(`new-${category}`, catType, service.name)}
                                      className="w-4 h-4 text-indigo-600 bg-white/10 border-white/20 rounded focus:ring-indigo-500"
                                    />
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-2 flex-1">
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-white text-sm">{service.name}</span>
                                            </div>
                                            <div className="text-white/60 text-xs">
                                              {formatPrice(service.basePrice, 'USD')}/dia
                                            </div>
                                          </div>
                                        </div>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-7 w-7 p-0 text-white/70 hover:text-white hover:bg-white/10"
                                            >
                                              <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                                            <DropdownMenuItem
                                              onClick={() => {
                                                setAddServiceContext({ category, priceRange: catType });
                                                setShowAddServiceModal(true);
                                              }}
                                              className="text-green-400 hover:bg-green-500/10 cursor-pointer"
                                            >
                                              <Plus className="h-4 w-4 mr-2" />
                                              Adicionar Novo Serviço
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                              onClick={() => {
                                                if (confirm(`Deseja realmente excluir "${service.name}"?`)) {
                                                  setNewServices(prev => {
                                                    const updated = {...prev};
                                                    updated[key] = updated[key].filter((_, i) => i !== idx);
                                                    return updated;
                                                  });
                                                }
                                              }}
                                              className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                                            >
                                              <Trash2 className="h-4 w-4 mr-2" />
                                              Excluir
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      );
                    })}

                    {/* Novas Faixas de Preço para Categorias Existentes */}
                    {Object.entries(newPriceRanges)
                      .filter(([key]) => key.startsWith(`${category}-`))
                      .map(([priceRangeKey, priceRangeData]) => (
                        <div key={priceRangeKey} className="space-y-3">
                          <h4 className={`font-medium flex items-center gap-2 group ${priceRangeData.color}`}>
                            <div className="w-2 h-2 rounded-full bg-current"></div>
                            {priceRangeData.name}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded">
                                  <MoreHorizontal className="h-3 w-3 text-gray-400" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setAddServiceContext({ category: category, priceRange: priceRangeKey });
                                    setShowAddServiceModal(true);
                                  }}
                                  className="text-green-400 hover:bg-green-500/10 cursor-pointer"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Adicionar Serviço
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    if (confirm(`Deseja realmente excluir a faixa de preço "${priceRangeData.name}"?`)) {
                                      setNewPriceRanges(prev => {
                                        const updated = {...prev};
                                        delete updated[priceRangeKey];
                                        return updated;
                                      });
                                    }
                                  }}
                                  className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </h4>

                          {/* Serviços nesta nova faixa de preço */}
                          <div className="space-y-2 ml-4">
                            {(() => {
                              const key = `${category}-${priceRangeKey}`;
                              const addedServices = newServices[key] || [];
                              return addedServices.map((service, idx) => {
                                const serviceKey = `${category}-${priceRangeKey}-new-${idx}`;
                                const isSelected = formData.services.includes(serviceKey);
                                return (
                                  <div key={`new-${idx}`} className="flex items-center space-x-3 hover:bg-white/5 p-2 rounded-lg transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => handleServiceToggle(category, priceRangeKey, service.name)}
                                      className="w-4 h-4 text-indigo-600 bg-white/10 border-white/20 rounded focus:ring-indigo-500"
                                    />
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-2 flex-1">
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-white text-sm">{service.name}</span>
                                            </div>
                                            <div className="text-white/60 text-xs">
                                              {formatPrice(service.basePrice, 'USD')}/dia
                                            </div>
                                          </div>
                                        </div>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-7 w-7 p-0 text-white/70 hover:text-white hover:bg-white/10"
                                            >
                                              <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                                            <DropdownMenuItem
                                              onClick={() => {
                                                setAddServiceContext({ category, priceRange: priceRangeKey });
                                                setShowAddServiceModal(true);
                                              }}
                                              className="text-green-400 hover:bg-green-500/10 cursor-pointer"
                                            >
                                              <Plus className="h-4 w-4 mr-2" />
                                              Adicionar Novo Serviço
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                              onClick={() => {
                                                if (confirm(`Deseja realmente excluir "${service.name}"?`)) {
                                                  setNewServices(prev => {
                                                    const updated = {...prev};
                                                    updated[key] = updated[key].filter((_, i) => i !== idx);
                                                    return updated;
                                                  });
                                                }
                                              }}
                                              className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                                            >
                                              <Trash2 className="h-4 w-4 mr-2" />
                                              Excluir
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      ))}
                  </div>
                );
              })}

              {/* Novas Categorias Adicionadas */}
              {Object.entries(newCategories).map(([categoryKey, categoryData]) => {
                const IconComponent = categoryData.icon;
                return (
                  <div key={categoryKey} className="space-y-4">
                    <h3 className="text-white font-semibold flex items-center gap-2 group">
                      <IconComponent className="h-4 w-4 text-indigo-400" />
                      {categoryData.name}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded">
                            <MoreHorizontal className="h-4 w-4 text-gray-400" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                          <DropdownMenuItem
                            onClick={() => {
                              setAddCategoryContext({ type: 'priceRange', parentCategory: categoryKey });
                              setShowAddCategoryModal(true);
                            }}
                            className="text-green-400 hover:bg-green-500/10 cursor-pointer"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Faixa de Preço
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              if (confirm(`Deseja realmente excluir a categoria "${categoryData.name}"?`)) {
                                setNewCategories(prev => {
                                  const updated = {...prev};
                                  delete updated[categoryKey];
                                  return updated;
                                });
                              }
                            }}
                            className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </h3>

                    {/* Renderizar faixas de preço para esta nova categoria */}
                    {Object.entries(newPriceRanges)
                      .filter(([key]) => key.startsWith(`${categoryKey}-`))
                      .map(([priceRangeKey, priceRangeData]) => (
                        <div key={priceRangeKey} className="space-y-3">
                          <h4 className={`font-medium flex items-center gap-2 group ${priceRangeData.color}`}>
                            <div className="w-2 h-2 rounded-full bg-current"></div>
                            {priceRangeData.name}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded">
                                  <MoreHorizontal className="h-3 w-3 text-gray-400" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setAddServiceContext({ category: categoryKey, priceRange: priceRangeKey });
                                    setShowAddServiceModal(true);
                                  }}
                                  className="text-green-400 hover:bg-green-500/10 cursor-pointer"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Adicionar Serviço
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    if (confirm(`Deseja realmente excluir a faixa de preço "${priceRangeData.name}"?`)) {
                                      setNewPriceRanges(prev => {
                                        const updated = {...prev};
                                        delete updated[priceRangeKey];
                                        return updated;
                                      });
                                    }
                                  }}
                                  className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </h4>

                          {/* Serviços nesta nova faixa de preço */}
                          <div className="space-y-2 ml-4">
                            {(() => {
                              const key = `${categoryKey}-${priceRangeKey}`;
                              const addedServices = newServices[key] || [];
                              return addedServices.map((service, idx) => {
                                const serviceKey = `${categoryKey}-${priceRangeKey}-new-${idx}`;
                                const isSelected = formData.services.includes(serviceKey);
                                return (
                                  <div key={`new-${idx}`} className="flex items-center space-x-3 hover:bg-white/5 p-2 rounded-lg transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => handleServiceToggle(categoryKey, priceRangeKey, service.name)}
                                      className="w-4 h-4 text-indigo-600 bg-white/10 border-white/20 rounded focus:ring-indigo-500"
                                    />
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-2 flex-1">
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-white text-sm">{service.name}</span>
                                            </div>
                                            <div className="text-white/60 text-xs">
                                              {formatPrice(service.basePrice, 'USD')}/dia
                                            </div>
                                          </div>
                                        </div>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-7 w-7 p-0 text-white/70 hover:text-white hover:bg-white/10"
                                            >
                                              <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                                            <DropdownMenuItem
                                              onClick={() => {
                                                setAddServiceContext({ category: categoryKey, priceRange: priceRangeKey });
                                                setShowAddServiceModal(true);
                                              }}
                                              className="text-green-400 hover:bg-green-500/10 cursor-pointer"
                                            >
                                              <Plus className="h-4 w-4 mr-2" />
                                              Adicionar Novo Serviço
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                              onClick={() => {
                                                if (confirm(`Deseja realmente excluir "${service.name}"?`)) {
                                                  setNewServices(prev => {
                                                    const updated = {...prev};
                                                    updated[key] = updated[key].filter((_, i) => i !== idx);
                                                    return updated;
                                                  });
                                                }
                                              }}
                                              className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                                            >
                                              <Trash2 className="h-4 w-4 mr-2" />
                                              Excluir
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      ))}
                  </div>
                );
              })}

            </CardContent>
          </Card>

          {/* Resultado */}
          <Card className="bg-white/5 backdrop-blur-2xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                Precificação Final
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {formatPrice(totalPrice, formData.currency)}
                </div>
                <div className="text-white/60 text-sm">
                  Total para {formData.guests} hóspede{formData.guests > 1 ? 's' : ''} por {formData.duration} dia{formData.duration > 1 ? 's' : ''}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-white/80">
                  <span>Preço por pessoa/dia:</span>
                  <span>{formatPrice(totalPrice / formData.guests / formData.duration, formData.currency)}</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Markup aplicado:</span>
                  <span>{formData.markup}%</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Serviços selecionados:</span>
                  <span>{formData.services.length + formData.customServices.length}</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Faixa de preço:</span>
                  <span className="capitalize">
                    {formData.priceRange === 'all' ? 'Mista' : 
                     formData.priceRange === 'luxury' ? 'Luxo' : 'Média Renda'}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <h4 className="text-white font-semibold mb-2">Conversões</h4>
                <div className="space-y-1 text-sm">
                  {Object.entries(exchangeRates).slice(0, 5).map(([code, currency]) => (
                    <div key={code} className="flex justify-between text-white/70">
                      <span>{currency.symbol} {code}:</span>
                      <span>{formatPrice(totalPrice, code)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={generateProposal}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Copiar Proposta (Texto)
                </Button>
                <Button
                  onClick={generateHTML}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Baixar Proposta (HTML)
                </Button>
                <Button
                  onClick={() => {
                    // Por enquanto, usar HTML + print do navegador
                    alert('⚠️ Gerando HTML para você imprimir como PDF!\n\n1. O arquivo HTML será baixado\n2. Abra o arquivo no navegador\n3. Use Ctrl+P e selecione "Salvar como PDF"');
                    generateHTML();
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Baixar Proposta (PDF)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Clean para Adicionar Novo Serviço */}
      {showAddServiceModal && addServiceContext && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAddServiceModal(false)}>
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white text-lg font-semibold mb-4">
              Adicionar Serviço em {
                (PATAGONIA_SERVICES as Record<string, any>)[addServiceContext.category]?.name ||
                newCategories[addServiceContext.category]?.name ||
                addServiceContext.category
              } - {
                (PATAGONIA_SERVICES as Record<string, any>)[addServiceContext.category]?.categories[addServiceContext.priceRange]?.name ||
                newPriceRanges[addServiceContext.priceRange]?.name ||
                addServiceContext.priceRange
              }
            </h3>

            <div className="space-y-4">
              <div>
                <Label className="text-white/80 text-sm mb-2">Nome do Serviço</Label>
                <Input
                  value={newServiceForm.name}
                  onChange={(e) => setNewServiceForm({...newServiceForm, name: e.target.value})}
                  placeholder="Ex: Hotel Boutique El Calafate"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  autoFocus
                />
              </div>

              <div>
                <Label className="text-white/80 text-sm mb-2">Preço Base (USD/dia)</Label>
                <Input
                  type="number"
                  value={newServiceForm.price}
                  onChange={(e) => setNewServiceForm({...newServiceForm, price: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => {
                  setShowAddServiceModal(false);
                  setAddServiceContext(null);
                  setNewServiceForm({ name: '', price: 0 });
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white border-0"
              >
                Cancelar
              </Button>
              <Button
                onClick={addNewService}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white border-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Adicionar Nova Categoria ou Faixa de Preço */}
      {showAddCategoryModal && addCategoryContext && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAddCategoryModal(false)}>
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white text-lg font-semibold mb-4">
              Adicionar Nova {addCategoryContext.type === 'category' ? 'Categoria' : 'Faixa de Preço'}
            </h3>

            <div className="space-y-4">
              <div>
                <Label className="text-white/80 text-sm mb-2">Nome</Label>
                <Input
                  value={newCategoryForm.name}
                  onChange={(e) => setNewCategoryForm({name: e.target.value})}
                  placeholder={addCategoryContext.type === 'category' ? 'Ex: Aventuras' : 'Ex: Premium'}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => {
                  setShowAddCategoryModal(false);
                  setAddCategoryContext(null);
                  setNewCategoryForm({ name: '' });
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white border-0"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (!newCategoryForm.name.trim()) {
                    alert('Por favor, digite um nome válido');
                    return;
                  }

                  if (addCategoryContext.type === 'category') {
                    // Adicionar nova categoria
                    const newKey = `custom_${Date.now()}`;
                    setNewCategories(prev => ({
                      ...prev,
                      [newKey]: {
                        name: newCategoryForm.name,
                        icon: Star,
                        categories: {}
                      }
                    }));
                  } else if (addCategoryContext.type === 'priceRange' && addCategoryContext.parentCategory) {
                    // Adicionar nova faixa de preço
                    const newKey = `${addCategoryContext.parentCategory}-custom_${Date.now()}`;
                    setNewPriceRanges(prev => ({
                      ...prev,
                      [newKey]: {
                        name: newCategoryForm.name,
                        color: 'text-purple-400'
                      }
                    }));
                  }

                  setShowAddCategoryModal(false);
                  setAddCategoryContext(null);
                  setNewCategoryForm({ name: '' });
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white border-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Editar Categoria ou Faixa de Preço */}
      {showEditCategoryModal && editCategoryContext && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowEditCategoryModal(false)}>
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white text-lg font-semibold mb-4">
              Editar {editCategoryContext.type === 'category' ? 'Categoria' : 'Faixa de Preço'}
            </h3>

            <div className="space-y-4">
              <div>
                <Label className="text-white/80 text-sm mb-2">Nome</Label>
                <Input
                  value={editCategoryContext.currentName}
                  onChange={(e) => setEditCategoryContext({...editCategoryContext, currentName: e.target.value})}
                  placeholder="Digite o novo nome"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => {
                  setShowEditCategoryModal(false);
                  setEditCategoryContext(null);
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white border-0"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (!editCategoryContext.currentName.trim()) {
                    alert('Por favor, digite um nome válido');
                    return;
                  }

                  if (editCategoryContext.type === 'category') {
                    setCategoryOverrides(prev => ({
                      ...prev,
                      [editCategoryContext.key]: editCategoryContext.currentName
                    }));
                  } else {
                    setPriceRangeOverrides(prev => ({
                      ...prev,
                      [editCategoryContext.key]: editCategoryContext.currentName
                    }));
                  }

                  setShowEditCategoryModal(false);
                  setEditCategoryContext(null);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-0"
              >
                <Edit className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}
    </ModernLayout>
  );
}
