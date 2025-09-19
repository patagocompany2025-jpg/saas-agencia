'use client';

import React from 'react';
import { useFinancial } from '@/lib/contexts/FinancialContext';
import { AlertCircle, Clock, DollarSign, X } from 'lucide-react';

export function FinancialAlerts() {
  const { alerts, markAlertAsRead, deleteAlert } = useFinancial();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'payment_due':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'low_balance':
        return <DollarSign className="h-4 w-4 text-red-400" />;
      case 'recurring_payment':
        return <Clock className="h-4 w-4 text-blue-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getAlertColor = (priority: string) => {
    switch (priority) {
      case 'alta':
        return 'border-red-500/50 bg-red-500/10';
      case 'media':
        return 'border-yellow-500/50 bg-yellow-500/10';
      case 'baixa':
        return 'border-blue-500/50 bg-blue-500/10';
      default:
        return 'border-gray-500/50 bg-gray-500/10';
    }
  };

  const unreadAlerts = alerts.filter(alert => !alert.isRead);

  return (
    <div className="bg-white/5 backdrop-blur-2xl rounded-xl p-6 border border-white/10 shadow-xl">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-yellow-400" />
        Alertas Financeiros
        {unreadAlerts.length > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {unreadAlerts.length}
          </span>
        )}
      </h3>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {alerts.length === 0 ? (
          <p className="text-white/60 text-center py-4">Nenhum alerta no momento</p>
        ) : (
          alerts.slice(0, 5).map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border ${getAlertColor(alert.priority)} ${
                !alert.isRead ? 'opacity-100' : 'opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <h4 className="text-white font-medium text-sm">{alert.title}</h4>
                    <p className="text-white/60 text-xs mt-1">{alert.description}</p>
                    {alert.amount && (
                      <p className="text-white/80 text-xs mt-1 font-semibold">
                        Valor: R$ {alert.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    )}
                    {alert.dueDate && (
                      <p className="text-white/60 text-xs mt-1">
                        Vencimento: {alert.dueDate.toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!alert.isRead && (
                    <button
                      onClick={() => markAlertAsRead(alert.id)}
                      className="p-1 hover:bg-white/20 rounded transition-colors"
                      title="Marcar como lida"
                    >
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    </button>
                  )}
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="p-1 hover:bg-red-500/20 rounded transition-colors"
                    title="Remover alerta"
                  >
                    <X className="h-3 w-3 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
