'use client';

import React, { useState, useEffect } from 'react';
import { dataSync } from '@/lib/sync';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestSyncPage() {
  const [testData, setTestData] = useState('');
  const [savedData, setSavedData] = useState('');
  const [lastSync, setLastSync] = useState('');

  useEffect(() => {
    loadTestData();
  }, []);

  const loadTestData = async () => {
    const data = await dataSync.loadData('testSync');
    if (data) {
      setSavedData(data);
      setLastSync(new Date(data.timestamp).toLocaleString());
    }
  };

  const saveTestData = async () => {
    const testObject = {
      message: testData,
      timestamp: Date.now(),
      device: navigator.userAgent
    };

    const success = await dataSync.saveData('testSync', testObject);
    if (success) {
      alert('✅ Dados salvos e sincronizados!');
      setTestData('');
      loadTestData();
    } else {
      alert('❌ Erro ao salvar dados');
    }
  };

  const clearData = async () => {
    await dataSync.clearLocalData();
    setSavedData('');
    setLastSync('');
    alert('🧹 Dados locais limpos!');
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-white/5 backdrop-blur-2xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-2xl">
              🧪 Teste de Sincronização
            </CardTitle>
            <p className="text-white/70">
              Teste se suas alterações estão sendo sincronizadas entre dispositivos
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Input para testar */}
            <div className="space-y-4">
              <label className="text-white/80 block">
                Digite uma mensagem para testar:
              </label>
              <Input
                value={testData}
                onChange={(e) => setTestData(e.target.value)}
                placeholder="Ex: Teste do notebook - 15:30"
                className="bg-white/10 border-white/20 text-white"
              />
              <Button
                onClick={saveTestData}
                disabled={!testData.trim()}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                💾 Salvar e Sincronizar
              </Button>
            </div>

            {/* Dados salvos */}
            {savedData && (
              <div className="space-y-4">
                <h3 className="text-white font-semibold">📋 Dados Sincronizados:</h3>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-white">
                    <strong>Mensagem:</strong> {savedData.message}
                  </p>
                  <p className="text-white/70 text-sm">
                    <strong>Salvo em:</strong> {lastSync}
                  </p>
                  <p className="text-white/70 text-sm">
                    <strong>Dispositivo:</strong> {savedData.device?.substring(0, 50)}...
                  </p>
                </div>
              </div>
            )}

            {/* Botões de controle */}
            <div className="flex gap-4">
              <Button
                onClick={loadTestData}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                🔄 Recarregar Dados
              </Button>
              <Button
                onClick={clearData}
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                🧹 Limpar Dados
              </Button>
            </div>

            {/* Instruções */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h4 className="text-blue-300 font-semibold mb-2">📝 Como testar:</h4>
              <ol className="text-blue-200/80 text-sm space-y-1 list-decimal list-inside">
                <li>Digite uma mensagem única (ex: "Teste do notebook - 15:30")</li>
                <li>Clique em "Salvar e Sincronizar"</li>
                <li>Aguarde o status verde no canto inferior direito</li>
                <li>Abra o mesmo link em outro computador</li>
                <li>Vá para /test-sync e veja se a mensagem aparece</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
