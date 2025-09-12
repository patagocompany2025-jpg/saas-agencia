# 🤖 Agente de Operações - Operations Master

## 📋 Visão Geral

O **Agente de Operações** é um sistema inteligente de automação operacional e logística que gerencia todo o fluxo de pedidos, estoque e documentação fiscal de forma automatizada.

## 🎯 Responsabilidades

- **Processamento automático de pedidos** - Automação completa do fluxo de pedidos
- **Geração de NFe instantânea** - Emissão automática de notas fiscais
- **Cálculo de frete otimizado** - Otimização de custos de frete
- **Gestão de estoque em tempo real** - Controle dinâmico de estoque
- **Alertas de reposição automáticos** - Notificações inteligentes de reposição

## 🛠️ Tecnologias

- **Python 3.9+** - Linguagem principal
- **APIs ERP/Logística** - Integrações com sistemas externos
- **FastAPI** - API REST para comunicação
- **SQLAlchemy** - ORM para banco de dados
- **Celery** - Processamento assíncrono
- **Redis** - Cache e filas de mensagens

## 📁 Estrutura do Projeto

```
agente_operacoes/
├── src/
│   ├── core/                    # Lógica principal
│   ├── services/                # Serviços de negócio
│   ├── integrations/            # Integrações externas
│   ├── models/                  # Modelos de dados
│   ├── utils/                   # Utilitários
│   └── api/                     # API REST
├── tests/                       # Testes unitários
├── config/                      # Configurações
├── requirements.txt             # Dependências
└── README.md                    # Esta documentação
```

## 🚀 Instalação

```bash
# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env

# Executar migrações do banco
python -m alembic upgrade head

# Iniciar o agente
python -m src.main
```

## 📊 Funcionalidades Principais

### 1. Processamento de Pedidos
- Recebimento automático de pedidos
- Validação de dados e estoque
- Aprovação automática de pedidos elegíveis
- Integração com sistemas de pagamento

### 2. Geração de NFe
- Emissão automática de notas fiscais
- Validação de dados fiscais
- Envio para SEFAZ
- Armazenamento de documentos

### 3. Cálculo de Frete
- Integração com transportadoras
- Cálculo de custos otimizado
- Seleção automática da melhor opção
- Rastreamento de entregas

### 4. Gestão de Estoque
- Controle em tempo real
- Sincronização com ERP
- Previsão de demanda
- Alertas de baixo estoque

### 5. Alertas de Reposição
- Análise de padrões de venda
- Cálculo de estoque mínimo
- Notificações automáticas
- Sugestões de compra

## 🔧 Configuração

### Variáveis de Ambiente

```env
# Banco de Dados
DATABASE_URL=postgresql://user:pass@localhost/agente_operacoes

# Redis
REDIS_URL=redis://localhost:6379

# APIs Externas
ERP_API_URL=https://api.erp.com
LOGISTICA_API_URL=https://api.logistica.com
SEFAZ_API_URL=https://api.sefaz.com

# Configurações
DEBUG=True
LOG_LEVEL=INFO
```

## 📈 Monitoramento

- **Logs estruturados** - Logs JSON para análise
- **Métricas** - Prometheus/Grafana
- **Health checks** - Endpoints de saúde
- **Alertas** - Notificações de problemas

## 🧪 Testes

```bash
# Executar todos os testes
pytest

# Executar com cobertura
pytest --cov=src

# Executar testes específicos
pytest tests/test_pedidos.py
```

## 📚 Documentação da API

A documentação interativa está disponível em:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🔄 Integrações

### Sistemas ERP
- SAP
- Oracle ERP
- Microsoft Dynamics
- Sistemas customizados

### Transportadoras
- Correios
- Mercado Envios
- Transportadoras regionais
- APIs de rastreamento

### Fiscal
- SEFAZ
- Receita Federal
- Sistemas contábeis

## 📞 Suporte

Para dúvidas ou problemas:
- **Issues**: GitHub Issues
- **Documentação**: `/docs`
- **Logs**: `/logs`

---

**Desenvolvido para o projeto NOVO-AI-AUTOMATION**  
*Agente de Operações - Operations Master*  
*Data: 12/09/2025*
