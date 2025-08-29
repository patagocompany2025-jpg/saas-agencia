# 🔧 Troubleshooting - Mega Vendedor AI

## 📱 Problema: Mensagens não estão sendo respondidas

### ✅ **Verificações Iniciais:**

1. **Conexão WhatsApp:**
   ```bash
   curl http://localhost:3001/status
   ```
   - Deve retornar: `"whatsapp": "connected"`

2. **Logs do Sistema:**
   - Verifique se aparecem logs como:
   ```
   📥 Evento messages.upsert recebido
   📨 Processando mensagem de [número]
   ```

3. **Health Check:**
   ```bash
   curl http://localhost:3001/health
   ```

### 🔍 **Possíveis Causas e Soluções:**

#### **1. Conexão WhatsApp Desconectada**
**Sintomas:** Status mostra "disconnected"
**Solução:**
```bash
# Reiniciar o sistema
npm run dev
```

#### **2. Mensagens não sendo capturadas**
**Sintomas:** Não aparecem logs de "Evento messages.upsert"
**Solução:**
- Verificar se o número está conectado corretamente
- Escanear QR code novamente se necessário
- Verificar se não há múltiplas sessões ativas

#### **3. Erro no processamento GPT**
**Sintomas:** Logs mostram erro no GPT
**Solução:**
```bash
# Verificar API Key
echo $OPENAI_API_KEY

# Testar processamento
npm run test:message
```

#### **4. Mensagens de mídia**
**Sintomas:** Logs mostram "Mídia recebida (não processando)"
**Solução:** O sistema só processa mensagens de texto. Envie texto simples.

### 🧪 **Testes de Diagnóstico:**

#### **Teste 1: Verificar Sistema**
```bash
npm run test:api
```

#### **Teste 2: Testar Processamento**
```bash
npm run test:message
```

#### **Teste 3: Simular Mensagem**
```bash
curl -X POST http://localhost:3001/simulate-message \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "5511999999999@s.whatsapp.net",
    "message": "Preciso de 50 bíblias para igreja"
  }'
```

### 📊 **Logs Importantes:**

#### **Logs Normais:**
```
📥 Evento messages.upsert recebido
📨 Processando mensagem de 5511999999999@s.whatsapp.net
🔍 Analisando mensagem: "Preciso de 50 bíblias para igreja"
👨‍💼 Perfil PASTOR detectado
🤖 Processando com GPT
✅ Resposta enviada com sucesso
```

#### **Logs de Erro:**
```
❌ Erro no handler de mensagens
❌ Conexão WhatsApp não está ativa
❌ Erro no processamento GPT
```

### 🚀 **Soluções Rápidas:**

#### **Reiniciar Sistema:**
```bash
# Parar processo atual (Ctrl+C)
# Reiniciar
npm run dev
```

#### **Limpar Sessão WhatsApp:**
```bash
# Remover pasta auth
rm -rf auth/mega_vendedor
# Reiniciar
npm run dev
```

#### **Verificar Porta:**
```bash
# Verificar se porta 3001 está livre
netstat -an | findstr 3001
```

### 📱 **Teste Manual:**

1. **Envie uma mensagem simples:**
   ```
   "Olá"
   ```

2. **Monitore os logs no console**

3. **Verifique se aparece:**
   ```
   📥 Evento messages.upsert recebido
   📨 Processando mensagem de [seu número]
   ```

### 🆘 **Se Nada Funcionar:**

1. **Verificar logs completos**
2. **Testar com mensagem simples**
3. **Verificar conexão de internet**
4. **Verificar API Key do OpenAI**
5. **Reiniciar sistema completamente**

### 📞 **Suporte:**

Se o problema persistir, verifique:
- Logs completos do console
- Status da API: `http://localhost:3001/health`
- Status do WhatsApp: `http://localhost:3001/status`
- Teste de processamento: `npm run test:message`
