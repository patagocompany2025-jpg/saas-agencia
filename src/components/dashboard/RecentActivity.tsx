'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  DollarSign, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'client' | 'lead' | 'payment' | 'alert';
  title: string;
  description: string;
  time: string;
  status?: 'success' | 'warning' | 'error' | 'info';
}

const recentActivities: Activity[] = [
  {
    id: '1',
    type: 'client',
    title: 'Novo cliente adicionado',
    description: 'Ana Silva foi adicionada ao CRM',
    time: '2 minutos atrás',
    status: 'success'
  },
  {
    id: '2',
    type: 'lead',
    title: 'Lead atualizado',
    description: 'Passeio Torres del Paine - Status: Negociação',
    time: '15 minutos atrás',
    status: 'warning'
  },
  {
    id: '3',
    type: 'payment',
    title: 'Pagamento recebido',
    description: 'R$ 2.500,00 - Pacote Ushuaia',
    time: '1 hora atrás',
    status: 'success'
  },
  {
    id: '4',
    type: 'alert',
    title: 'Pagamento vencido',
    description: 'R$ 1.200,00 - Hotel El Calafate',
    time: '2 horas atrás',
    status: 'error'
  },
  {
    id: '5',
    type: 'lead',
    title: 'Nova proposta enviada',
    description: 'Passeio Glaciar Perito Moreno - R$ 3.200,00',
    time: '3 horas atrás',
    status: 'info'
  }
];

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'client':
      return UserPlus;
    case 'lead':
      return FileText;
    case 'payment':
      return DollarSign;
    case 'alert':
      return AlertCircle;
    default:
      return Clock;
  }
};

const getStatusColor = (status?: Activity['status']) => {
  switch (status) {
    case 'success':
      return 'text-green-600';
    case 'warning':
      return 'text-yellow-600';
    case 'error':
      return 'text-red-600';
    case 'info':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
};

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-full bg-gray-100 ${getStatusColor(activity.status)}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.time}
                  </p>
                </div>
                {activity.status && (
                  <Badge 
                    variant={
                      activity.status === 'success' ? 'default' :
                      activity.status === 'warning' ? 'secondary' :
                      activity.status === 'error' ? 'destructive' : 'outline'
                    }
                    className="text-xs"
                  >
                    {activity.status === 'success' ? 'Sucesso' :
                     activity.status === 'warning' ? 'Atenção' :
                     activity.status === 'error' ? 'Urgente' : 'Info'}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
