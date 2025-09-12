# 🚀 SOLUÇÃO RÁPIDA - Não consigo acessar as APIs

## ⚡ Solução em 3 Passos

### 1. Execute o Diagnóstico
```bash
cd agentes/dev1_alex/agente_operacoes
python diagnostico.py
```

### 2. Execute a Correção Automática
```bash
python start_agente_fix.py
```

### 3. Teste se Funcionou
```bash
python test_server.py
```

## 🔧 Se Ainda Não Funcionar

### Opção A: Configuração Mínima
```bash
# Usar configuração mínima para teste
cp env.minimal .env
python start_agente_fix.py
```

### Opção B: Instalação Manual
```bash
# 1. Criar ambiente virtual
python -m venv venv

# 2. Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# 3. Instalar dependências
pip install -r requirements.txt

# 4. Configurar ambiente
cp env.minimal .env

# 5. Iniciar servidor
python start_agente.py
```

### Opção C: Usar Porta Diferente
```bash
# Se a porta 8000 estiver ocupada
uvicorn src.main:create_app --host 0.0.0.0 --port 8001 --reload
```

## 🌐 URLs para Testar

- **Health Check**: http://localhost:8000/health
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## ❓ Problemas Comuns

### "ModuleNotFoundError"
```bash
# Solução: Verificar se está no diretório correto
pwd
# Deve estar em: .../agente_operacoes/
```

### "Port already in use"
```bash
# Windows: Matar processo na porta 8000
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F

# Linux/macOS: Matar processo na porta 8000
lsof -ti:8000 | xargs kill -9
```

### "Database connection error"
```bash
# Usar SQLite para teste (mais simples)
# Editar .env:
# DATABASE_URL=sqlite:///./agente_operacoes.db
```

## 📞 Ainda com Problemas?

1. **Execute**: `python diagnostico.py`
2. **Consulte**: `TROUBLESHOOTING.md`
3. **Verifique**: Se está no diretório correto
4. **Teste**: Com configuração mínima

---

**Desenvolvido para o projeto NOVO-AI-AUTOMATION**  
*Solução Rápida - Agente de Operações*  
*Data: 12/09/2025*
