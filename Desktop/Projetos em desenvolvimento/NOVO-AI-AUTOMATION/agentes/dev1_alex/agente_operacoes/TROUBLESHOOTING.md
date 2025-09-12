# 🔧 Guia de Solução de Problemas - Agente de Operações

## ❌ Problema: Não consigo acessar as APIs

### Diagnóstico Rápido

1. **Verificar se o servidor está rodando**
2. **Verificar se as dependências estão instaladas**
3. **Verificar se as configurações estão corretas**
4. **Verificar se as portas estão disponíveis**

## 🚀 Soluções Passo a Passo

### 1. Verificar Dependências

```bash
# Verificar se Python está instalado
python --version
# Deve retornar Python 3.9 ou superior

# Verificar se pip está funcionando
pip --version
```

### 2. Instalar Dependências

```bash
# Navegar para o diretório do agente
cd agentes/dev1_alex/agente_operacoes

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

### 3. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de configuração
cp env.example .env

# Editar o arquivo .env com suas configurações
# Pelo menos configure:
# - DATABASE_URL
# - REDIS_URL
# - SECRET_KEY
```

### 4. Testar Inicialização

```bash
# Testar se o Python consegue importar os módulos
python -c "from src.main import create_app; print('✅ Imports OK')"

# Se der erro, verificar se está no diretório correto
pwd
# Deve estar em: .../agente_operacoes/
```

### 5. Iniciar o Servidor

```bash
# Opção 1: Usar o script de inicialização
python start_agente.py

# Opção 2: Usar uvicorn diretamente
uvicorn src.main:create_app --host 0.0.0.0 --port 8000 --reload

# Opção 3: Usar o script de inicialização do sistema
# Windows:
start_agente.bat
# Linux/macOS:
./start_agente.sh
```

## 🔍 Verificações Específicas

### Verificar se a Porta 8000 está Livre

```bash
# Windows
netstat -an | findstr :8000

# Linux/macOS
lsof -i :8000

# Se estiver ocupada, matar o processo ou usar outra porta
```

### Verificar Logs de Erro

```bash
# Executar com logs detalhados
python start_agente.py 2>&1 | tee logs.txt

# Verificar se há erros específicos
grep -i error logs.txt
```

### Testar Conectividade

```bash
# Testar se o servidor responde
curl http://localhost:8000/health

# Ou usar o navegador
# http://localhost:8000/health
```

## 🛠️ Soluções para Problemas Comuns

### Problema 1: "ModuleNotFoundError"

```bash
# Solução: Verificar se está no diretório correto
cd agentes/dev1_alex/agente_operacoes

# Verificar se o arquivo src/__init__.py existe
ls -la src/

# Reinstalar dependências
pip install -r requirements.txt --force-reinstall
```

### Problema 2: "Port already in use"

```bash
# Solução 1: Matar processo na porta 8000
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F

# Linux/macOS
lsof -ti:8000 | xargs kill -9

# Solução 2: Usar outra porta
uvicorn src.main:create_app --host 0.0.0.0 --port 8001 --reload
```

### Problema 3: "Database connection error"

```bash
# Verificar se o PostgreSQL está rodando
# Windows: Verificar serviços
# Linux/macOS: sudo systemctl status postgresql

# Usar SQLite para teste (temporário)
# Editar .env:
# DATABASE_URL=sqlite:///./agente_operacoes.db
```

### Problema 4: "Redis connection error"

```bash
# Verificar se o Redis está rodando
# Windows: Verificar se o Redis está instalado e rodando
# Linux/macOS: sudo systemctl status redis

# Usar configuração local para teste
# Editar .env:
# REDIS_URL=redis://localhost:6379/0
```

## 🧪 Teste de Funcionamento

### 1. Teste Básico

```bash
# Iniciar servidor
python start_agente.py

# Em outro terminal, testar health check
curl http://localhost:8000/health

# Resposta esperada:
# {"status":"healthy","version":"1.0.0","service":"agente-operacoes"}
```

### 2. Teste da API

```bash
# Testar criação de pedido
curl -X POST "http://localhost:8000/api/v1/pedidos/" \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": "123",
    "cliente_nome": "João Silva",
    "itens": [
      {
        "produto_id": "1",
        "produto_codigo": "PROD001",
        "produto_nome": "Produto Teste",
        "quantidade": 1,
        "preco_unitario": 100.00
      }
    ]
  }'
```

### 3. Teste do Swagger UI

```bash
# Abrir no navegador
# http://localhost:8000/docs

# Deve mostrar a documentação interativa da API
```

## 📋 Checklist de Verificação

- [ ] Python 3.9+ instalado
- [ ] Ambiente virtual criado e ativado
- [ ] Dependências instaladas
- [ ] Arquivo .env configurado
- [ ] Porta 8000 livre
- [ ] Servidor iniciado sem erros
- [ ] Health check respondendo
- [ ] Swagger UI acessível

## 🆘 Se Nada Funcionar

### 1. Reset Completo

```bash
# Remover ambiente virtual
rm -rf venv

# Remover cache Python
rm -rf __pycache__
rm -rf src/__pycache__

# Recriar tudo
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate no Windows
pip install -r requirements.txt
python start_agente.py
```

### 2. Usar Docker (Alternativa)

```bash
# Criar Dockerfile
cat > Dockerfile << EOF
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "start_agente.py"]
EOF

# Construir e executar
docker build -t agente-operacoes .
docker run -p 8000:8000 agente-operacoes
```

### 3. Logs Detalhados

```bash
# Executar com debug
PYTHONPATH=. python -c "
import logging
logging.basicConfig(level=logging.DEBUG)
from src.main import create_app
app = create_app()
print('✅ App criado com sucesso')
"
```

## 📞 Suporte

Se ainda tiver problemas:

1. **Verificar logs** completos
2. **Testar** com configuração mínima
3. **Verificar** se todas as dependências estão corretas
4. **Usar** o modo de debug

---

**Desenvolvido para o projeto NOVO-AI-AUTOMATION**  
*Guia de Solução de Problemas - Agente de Operações*  
*Data: 12/09/2025*
