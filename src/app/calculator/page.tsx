'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Plus
} from 'lucide-react';

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
          { name: 'Hotel 5 Estrelas Bariloche', basePrice: 800, multiplier: 1.0, category: 'luxury' },
          { name: 'Lodge de Montanha Premium', basePrice: 1200, multiplier: 1.5, category: 'luxury' },
          { name: 'Villa Privada com Concierge', basePrice: 2000, multiplier: 2.5, category: 'luxury' },
          { name: 'Resort All-Inclusive Luxo', basePrice: 1500, multiplier: 1.8, category: 'luxury' },
          { name: 'Casa de Campo Exclusiva', basePrice: 3000, multiplier: 3.0, category: 'luxury' }
        ]
      },
      midrange: {
        name: 'Média Renda',
        color: 'text-blue-400',
        options: [
          { name: 'Hotel 4 Estrelas Centro', basePrice: 200, multiplier: 1.0, category: 'midrange' },
          { name: 'Pousada Charming', basePrice: 150, multiplier: 0.8, category: 'midrange' },
          { name: 'Casa de Temporada Familiar', basePrice: 300, multiplier: 1.2, category: 'midrange' },
          { name: 'Hostel Premium Privado', basePrice: 100, multiplier: 0.6, category: 'midrange' },
          { name: 'Cabaña com Vista ao Lago', basePrice: 250, multiplier: 1.0, category: 'midrange' }
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
          { name: 'Transfer Privado Aeroporto', basePrice: 150, multiplier: 1.0, category: 'luxury' },
          { name: 'Carro de Luxo com Motorista', basePrice: 300, multiplier: 1.5, category: 'luxury' },
          { name: 'Helicóptero Privado', basePrice: 2000, multiplier: 3.0, category: 'luxury' },
          { name: 'Jato Privado Regional', basePrice: 5000, multiplier: 5.0, category: 'luxury' },
          { name: 'Iate Privado Lago Nahuel Huapi', basePrice: 1500, multiplier: 2.0, category: 'luxury' }
        ]
      },
      midrange: {
        name: 'Econômico',
        color: 'text-blue-400',
        options: [
          { name: 'Transfer Compartilhado', basePrice: 30, multiplier: 1.0, category: 'midrange' },
          { name: 'Aluguel de Carro Padrão', basePrice: 80, multiplier: 1.0, category: 'midrange' },
          { name: 'Transfer Executivo', basePrice: 60, multiplier: 1.2, category: 'midrange' },
          { name: 'Van Privada para Grupos', basePrice: 120, multiplier: 1.5, category: 'midrange' },
          { name: 'Barco Turístico Lago', basePrice: 50, multiplier: 1.0, category: 'midrange' }
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
          { name: 'Trekking Privado com Guia', basePrice: 400, multiplier: 1.0, category: 'luxury' },
          { name: 'Degustação de Vinhos Premium', basePrice: 300, multiplier: 1.2, category: 'luxury' },
          { name: 'Safari Fotográfico Privado', basePrice: 500, multiplier: 1.5, category: 'luxury' },
          { name: 'Spa de Luxo na Montanha', basePrice: 600, multiplier: 1.8, category: 'luxury' },
          { name: 'Jantar Privado no Glaciar', basePrice: 1200, multiplier: 2.5, category: 'luxury' },
          { name: 'Voo Panorâmico Privado', basePrice: 800, multiplier: 2.0, category: 'luxury' },
          { name: 'Pesca Esportiva Exclusiva', basePrice: 700, multiplier: 1.8, category: 'luxury' },
          { name: 'Cavalgada Privada na Patagônia', basePrice: 450, multiplier: 1.3, category: 'luxury' }
        ]
      },
      midrange: {
        name: 'Acessíveis',
        color: 'text-blue-400',
        options: [
          { name: 'Trekking em Grupo', basePrice: 80, multiplier: 1.0, category: 'midrange' },
          { name: 'Degustação de Vinhos Local', basePrice: 60, multiplier: 1.0, category: 'midrange' },
          { name: 'Tour Fotográfico Guiado', basePrice: 100, multiplier: 1.2, category: 'midrange' },
          { name: 'Spa Básico', basePrice: 120, multiplier: 1.0, category: 'midrange' },
          { name: 'Jantar Típico Local', basePrice: 80, multiplier: 1.0, category: 'midrange' },
          { name: 'Voo Panorâmico Compartilhado', basePrice: 200, multiplier: 1.5, category: 'midrange' },
          { name: 'Pesca Tradicional', basePrice: 150, multiplier: 1.2, category: 'midrange' },
          { name: 'Cavalgada em Grupo', basePrice: 100, multiplier: 1.0, category: 'midrange' },
          { name: 'Tour de Cervejarias', basePrice: 70, multiplier: 1.0, category: 'midrange' },
          { name: 'Caminhada Ecológica', basePrice: 50, multiplier: 0.8, category: 'midrange' }
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
          { name: 'Concierge 24/7 Básico', basePrice: 200, multiplier: 1.0, category: 'luxury' },
          { name: 'Concierge Premium Personalizado', basePrice: 500, multiplier: 2.0, category: 'luxury' },
          { name: 'Concierge VIP com Assistente', basePrice: 1000, multiplier: 3.0, category: 'luxury' },
          { name: 'Concierge Ultra Luxo', basePrice: 2000, multiplier: 4.0, category: 'luxury' }
        ]
      },
      midrange: {
        name: 'Consultoria',
        color: 'text-blue-400',
        options: [
          { name: 'Consultoria Básica (2h)', basePrice: 100, multiplier: 1.0, category: 'midrange' },
          { name: 'Planejamento Completo (4h)', basePrice: 180, multiplier: 1.2, category: 'midrange' },
          { name: 'Assistência por WhatsApp', basePrice: 50, multiplier: 1.0, category: 'midrange' },
          { name: 'Consultoria Familiar', basePrice: 150, multiplier: 1.5, category: 'midrange' },
          { name: 'Consultoria para Grupos', basePrice: 200, multiplier: 2.0, category: 'midrange' },
          { name: 'Suporte Durante a Viagem', basePrice: 80, multiplier: 1.0, category: 'midrange' }
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
          { name: 'Jantar em Restaurante Michelin', basePrice: 300, multiplier: 1.5, category: 'luxury' },
          { name: 'Degustação Privada com Sommelier', basePrice: 400, multiplier: 2.0, category: 'luxury' },
          { name: 'Chef Privado na Villa', basePrice: 800, multiplier: 2.5, category: 'luxury' },
          { name: 'Experiência Culinária na Montanha', basePrice: 600, multiplier: 2.2, category: 'luxury' }
        ]
      },
      midrange: {
        name: 'Tradicional',
        color: 'text-blue-400',
        options: [
          { name: 'Jantar em Restaurante Local', basePrice: 60, multiplier: 1.0, category: 'midrange' },
          { name: 'Degustação de Vinhos Regional', basePrice: 80, multiplier: 1.2, category: 'midrange' },
          { name: 'Cooking Class Local', basePrice: 120, multiplier: 1.5, category: 'midrange' },
          { name: 'Jantar Típico Patagônico', basePrice: 100, multiplier: 1.3, category: 'midrange' },
          { name: 'Piquenique no Lago', basePrice: 70, multiplier: 1.0, category: 'midrange' },
          { name: 'Café da Manhã na Montanha', basePrice: 40, multiplier: 1.0, category: 'midrange' }
        ]
      }
    }
  }
};

export default function CalculatorPage() {
  const { user, isLoading } = useAuth();
  const [isEditingServices, setIsEditingServices] = useState(false);
  const [editableServices, setEditableServices] = useState(PATAGONIA_SERVICES);
  
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
  const [totalPrice, setTotalPrice] = useState(0);

  // Funções para editar serviços
  const updateServicePrice = (serviceType: string, category: string, optionIndex: number, newPrice: number) => {
    setEditableServices(prev => {
      const newServices = JSON.parse(JSON.stringify(prev));
      if (newServices[serviceType] && newServices[serviceType].categories[category]) {
        newServices[serviceType].categories[category].options[optionIndex].basePrice = newPrice;
      }
      return newServices;
    });
  };

  const updateServiceName = (serviceType: string, category: string, optionIndex: number, newName: string) => {
    setEditableServices(prev => {
      const newServices = JSON.parse(JSON.stringify(prev));
      if (newServices[serviceType] && newServices[serviceType].categories[category]) {
        newServices[serviceType].categories[category].options[optionIndex].name = newName;
      }
      return newServices;
    });
  };

  const addNewService = (serviceType: string, category: string, name: string, price: number) => {
    setEditableServices(prev => {
      const newServices = JSON.parse(JSON.stringify(prev));
      if (newServices[serviceType] && newServices[serviceType].categories[category]) {
        newServices[serviceType].categories[category].options.push({ 
          name, 
          basePrice: price, 
          multiplier: 1.0, 
          category 
        });
      }
      return newServices;
    });
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

  const calculatePrice = () => {
    let basePrice = 0;
    
    // Calcular preço base dos serviços selecionados
    Object.entries(editableServices).forEach(([category, service]) => {
      Object.entries(service.categories).forEach(([catType, categoryData]) => {
        categoryData.options.forEach(option => {
          if (formData.services.includes(`${category}-${catType}-${option.name}`)) {
            basePrice += option.basePrice * formData.duration;
          }
        });
      });
    });

    // Adicionar serviços customizados
    formData.customServices.forEach(service => {
      basePrice += service.price * formData.duration;
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
    
    setTotalPrice(finalPrice);
  };

  useEffect(() => {
    calculatePrice();
  }, [formData]);

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
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  Serviços Patagônia
                </CardTitle>
                <Button
                  onClick={() => setIsEditingServices(!isEditingServices)}
                  className={`px-4 py-2 text-sm ${
                    isEditingServices 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {isEditingServices ? 'Salvar' : 'Editar'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 max-h-96 overflow-y-auto">
              {Object.entries(editableServices).map(([category, service]) => {
                const IconComponent = service.icon;
                return (
                  <div key={category} className="space-y-4">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <IconComponent className="h-4 w-4 text-indigo-400" />
                      {service.name}
                    </h3>
                    
                    {Object.entries(service.categories).map(([catType, categoryData]) => {
                      // Filtrar por faixa de preço se selecionada
                      if (formData.priceRange !== 'all' && formData.priceRange !== catType) {
                        return null;
                      }
                      
                      return (
                        <div key={catType} className="space-y-3">
                          <h4 className={`font-medium flex items-center gap-2 ${categoryData.color}`}>
                            <div className="w-2 h-2 rounded-full bg-current"></div>
                            {categoryData.name}
                          </h4>
                          <div className="space-y-2 ml-4">
                            {categoryData.options.map((option, optionIndex) => {
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
                                    {isEditingServices ? (
                                      <div className="space-y-2">
                                        <Input
                                          value={option.name}
                                          onChange={(e) => updateServiceName(category, catType, optionIndex, e.target.value)}
                                          className="bg-white/10 border-white/20 text-white text-sm"
                                          placeholder="Nome do serviço"
                                        />
                                        <div className="flex items-center gap-2">
                                          <Input
                                            type="number"
                                            value={option.basePrice}
                                            onChange={(e) => updateServicePrice(category, catType, optionIndex, Number(e.target.value))}
                                            className="bg-white/10 border-white/20 text-white text-xs w-24"
                                            placeholder="Preço"
                                          />
                                          <span className="text-white/60 text-xs">USD/dia</span>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <span className="text-white text-sm">{option.name}</span>
                                        <div className="text-white/60 text-xs">
                                          {formatPrice(option.basePrice, 'USD')}/dia
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              <div className="pt-4 border-t border-white/10 space-y-3">
                <Button
                  onClick={addCustomService}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Serviço Customizado
                </Button>
                
                {isEditingServices && (
                  <div className="text-center">
                    <p className="text-white/60 text-sm mb-2">Adicionar novo serviço:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <select 
                        className="bg-white/10 border border-white/20 text-white rounded px-3 py-2 text-sm"
                        onChange={(e) => {
                          const [category, catType] = e.target.value.split('-');
                          if (category && catType) {
                            const name = prompt('Nome do serviço:');
                            const price = prompt('Preço em USD:');
                            if (name && price) {
                              addNewService(category, catType, name, Number(price));
                            }
                          }
                        }}
                      >
                        <option value="">Selecionar categoria</option>
                        <option value="accommodation-luxury">Hospedagem - Luxo</option>
                        <option value="accommodation-midrange">Hospedagem - Média Renda</option>
                        <option value="transportation-luxury">Transporte - Premium</option>
                        <option value="transportation-midrange">Transporte - Econômico</option>
                        <option value="experiences-luxury">Experiências - Exclusivas</option>
                        <option value="experiences-midrange">Experiências - Acessíveis</option>
                        <option value="concierge-luxury">Concierge - VIP</option>
                        <option value="concierge-midrange">Concierge - Básico</option>
                        <option value="dining-luxury">Gastronomia - Fine Dining</option>
                        <option value="dining-midrange">Gastronomia - Local</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
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

              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                <TrendingUp className="h-4 w-4 mr-2" />
                Gerar Proposta
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ModernLayout>
  );
}
