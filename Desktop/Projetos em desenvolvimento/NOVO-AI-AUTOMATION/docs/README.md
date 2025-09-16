# 📚 Documentação Técnica - NOVO AI AUTOMATION

Bem-vindo à documentação técnica completa do sistema **NOVO AI AUTOMATION**. Esta documentação foi criada através de análise reversa do código existente e fornece uma visão abrangente de como o sistema funciona.

## 🗂️ Índice da Documentação

### 📋 Documentação Principal
- **[README.md](../README.md)** - Visão geral do projeto, instalação e uso
- **[README-OAUTH.md](../README-OAUTH.md)** - Documentação específica do OAuth2

### 🏗️ Arquitetura e Estrutura
- **[arquitetura.md](./arquitetura.md)** - Diagramas de arquitetura e fluxos de dados
- **[estrutura-projeto.md](./estrutura-projeto.md)** - Estrutura detalhada de pastas e arquivos

### 🗄️ Banco de Dados
- **[banco-dados.md](./banco-dados.md)** - Schema completo, relacionamentos e queries

### 🔌 APIs e Integrações
- **[apis.md](./apis.md)** - Documentação completa de todas as APIs

### 📊 Logs e Testes
- **[logs-testes.md](./logs-testes.md)** - Configuração de logs e sistema de testes

## 🚀 Início Rápido

### Para Desenvolvedores
1. Leia o [README principal](../README.md) para visão geral
2. Consulte [estrutura-projeto.md](./estrutura-projeto.md) para entender a organização
3. Revise [arquitetura.md](./arquitetura.md) para compreender o sistema

### Para Administradores
1. Configure o ambiente seguindo [README.md](../README.md)
2. Configure logs e testes com [logs-testes.md](./logs-testes.md)
3. Monitore APIs usando [apis.md](./apis.md)

### Para DBA/DevOps
1. Configure banco de dados com [banco-dados.md](./banco-dados.md)
2. Monitore logs e métricas com [logs-testes.md](./logs-testes.md)
3. Configure CI/CD com as informações de testes

## 🎯 Componentes Principais

### 🤖 Mega Vendedor AI
Sistema de IA para vendas via WhatsApp que:
- Processa mensagens em tempo real
- Detecta perfil do cliente (Pastor, Jovem, Mãe, Neutro)
- Gera respostas personalizadas com IA
- Integra com catálogo de produtos

### 🔐 Sistema OAuth2
Autenticação segura com Conta Azul:
- Fluxo de autorização completo
- Renovação automática de tokens
- Suporte a ambientes DEV/PROD

### 🗄️ Banco de Dados
PostgreSQL via Supabase com:
- Gestão de clientes e leads
- Catálogo de produtos sincronizado
- Histórico de conversas
- Transações e vendas

### 🔗 Integrações Externas
- **OpenAI GPT-4** - IA generativa
- **Conta Azul API** - Produtos e vendas
- **WhatsApp Web** - Comunicação
- **Supabase** - Banco de dados

## 📈 Métricas e Monitoramento

### Logs Disponíveis
- **WhatsApp** - Mensagens e processamento
- **OAuth** - Autenticação e tokens
- **IA** - Chamadas OpenAI e custos
- **Erro** - Falhas e exceções
- **Acesso** - Requisições HTTP

### Testes Implementados
- **Unitários** - Serviços e utilitários
- **Integração** - Fluxos completos
- **E2E** - Cenários de usuário
- **Performance** - Tempo de resposta

## 🔧 Configuração por Ambiente

### Desenvolvimento
```bash
npm run dev:env
npm run dev
```

### Produção
```bash
npm run prod:env
npm run build
npm start
```

### Testes
```bash
npm test
npm run test:coverage
```

## 🚨 Troubleshooting

### Problemas Comuns
1. **OAuth "invalid_client"** - Verifique credenciais
2. **WhatsApp não conecta** - Escaneie QR code
3. **IA não responde** - Verifique API key OpenAI
4. **Erro de banco** - Verifique conexão Supabase

### Logs de Debug
```bash
# Logs detalhados
LOG_LEVEL=debug npm start

# Logs específicos
tail -f logs/whatsapp.log
tail -f logs/oauth.log
```

## 📞 Suporte

### Documentação
- Consulte a seção específica na documentação
- Verifique logs de erro
- Execute scripts de diagnóstico

### Desenvolvimento
- Abra uma issue no GitHub
- Consulte código fonte comentado
- Use ferramentas de debug

## 🔄 Atualizações

Esta documentação é mantida através de análise reversa do código. Para atualizá-la:

1. Execute análise do código atualizado
2. Atualize diagramas se necessário
3. Revise APIs e endpoints
4. Atualize configurações de teste

---

**Última atualização**: 12/09/2025  
**Versão da documentação**: 1.0.0  
**Status**: ✅ Completa
