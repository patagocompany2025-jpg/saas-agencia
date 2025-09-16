# 🤖 Sistema de Auto-Documentação Inteligente

Sistema automático que monitora mudanças no seu projeto e atualiza a documentação de forma inteligente, sem apagar nada que já existe.

## ✨ Funcionalidades

### 🔍 Monitoramento Automático
- **Detecção de mudanças** em tempo real usando Git
- **Análise inteligente** de APIs, banco de dados e dependências
- **Interface interativa** com prompts amigáveis
- **Preservação total** da documentação existente

### 🔌 Detecção de APIs
- **Express.js** - Detecta rotas GET, POST, PUT, DELETE
- **FastAPI** - Detecta decorators e endpoints
- **Flask** - Detecta rotas e métodos HTTP
- **Parâmetros** - Extrai parâmetros de requisição
- **Documentação** - Gera descrições automáticas

### 🗄️ Monitoramento de Banco de Dados
- **SQL** - CREATE, ALTER, DROP TABLE
- **Supabase** - Queries e operações
- **Prisma** - Modelos e schemas
- **Sequelize** - Definições de modelos
- **Colunas** - Extrai estrutura de tabelas

### 📦 Controle de Dependências
- **package.json** - Dependências NPM
- **requirements.txt** - Dependências Python
- **yarn.lock** - Lock files
- **Categorização** - Produção, desenvolvimento, peer

## 🚀 Instalação e Configuração

### 1. Pré-requisitos
```bash
# Python 3.8+
python --version

# Git (repositório inicializado)
git --version
```

### 2. Instalação Rápida
```bash
# Clonar ou baixar os arquivos do sistema
# Instalar dependências
pip install -r requirements.txt

# Configurar sistema
python setup_auto_doc.py
```

### 3. Configuração Manual
```bash
# Instalar dependências Python
pip install watchdog GitPython pdoc pyyaml colorama rich click python-dotenv

# Executar configuração
python setup_auto_doc.py
```

## 🎯 Como Usar

### Monitoramento Contínuo
```bash
# Iniciar monitoramento em tempo real
python auto_doc_integrated.py --watch

# Ou usar script de inicialização
./start_auto_doc.sh  # Linux/Mac
start_auto_doc.bat   # Windows
```

### Análise Única
```bash
# Analisar projeto uma vez
python auto_doc_integrated.py --analyze
```

### Configuração
```bash
# Configurar sistema
python auto_doc_integrated.py --setup
```

## 📅 Como Usar o Sistema Diariamente

### 🚀 **Início do Dia - Verificar Status**

```bash
# 1. Verificar status atual do projeto
python auto_doc_integrated.py --analyze

# 2. Iniciar monitoramento contínuo
python auto_doc_integrated.py --watch
```

### 📊 **Durante o Desenvolvimento**

O sistema monitora automaticamente e mostra:

```
🚨 Detectei mudanças:
- Novo endpoint: GET /api/products
- Alteração no modelo: User (adicionada coluna 'email')
- Dependência adicionada: express@^4.18.0
- Arquivo modificado: src/server.js

Deseja atualizar a documentação? (s/n/m)
```

### 🔄 **Fluxo Diário Recomendado**

#### **Manhã (Início do trabalho)**
```bash
# 1. Iniciar sistema de monitoramento
python auto_doc_integrated.py --watch

# 2. Verificar mudanças da noite anterior
python auto_doc_integrated.py --analyze
```

#### **Durante o desenvolvimento**
- O sistema detecta mudanças automaticamente
- Pergunta se deseja atualizar documentação
- Escolha `s` para atualizar, `n` para pular, `m` para ver detalhes

#### **Final do dia**
```bash
# 1. Parar monitoramento (Ctrl+C)
# 2. Fazer commit das mudanças
git add .
git commit -m "Atualizações do dia - documentação automática"

# 3. Verificar relatório final
cat docs/CHANGELOG.md
```

### 📋 **Comandos Diários Essenciais**

```bash
# Ver status atual
python auto_doc_integrated.py --analyze

# Monitorar em tempo real
python auto_doc_integrated.py --watch

# Configurar sistema
python auto_doc_integrated.py --setup

# Testar sistema
python test_auto_doc.py
```

### 📁 **Arquivos Gerados Diariamente**

- `docs/CHANGELOG.md` - Log de todas as mudanças
- `docs/apis.md` - APIs detectadas e documentadas
- `docs/banco-dados.md` - Mudanças no banco de dados
- `logs/auto_doc.log` - Log detalhado do sistema

### 🎯 **Dicas para Uso Eficiente**

1. **Sempre use `--watch`** durante o desenvolvimento
2. **Escolha `s` (sim)** para atualizar documentação importante
3. **Use `m` (mostrar)** para ver detalhes antes de decidir
4. **Faça commits regulares** para manter histórico
5. **Verifique logs** se algo não funcionar como esperado

### ⚡ **Atalhos Rápidos**

```bash
# Scripts de inicialização rápida
./start_auto_doc.sh     # Linux/Mac
start_auto_doc.bat      # Windows

# Análise rápida
python auto_doc_integrated.py --analyze

# Monitoramento silencioso (auto-aprovar)
python auto_doc_integrated.py --watch --auto-approve
```

## 📋 Comandos Interativos

Quando o sistema detecta mudanças, você pode escolher:

- **`s`** - Sim, atualizar documentação
- **`n`** - Não, pular atualização
- **`m`** - Mostrar detalhes das mudanças
- **`r`** - Revisar mudanças específicas
- **`q`** - Sair do sistema

## 📁 Arquivos Criados

### Sistema Principal
- `auto_doc_system.py` - Sistema básico de monitoramento
- `auto_doc_integrated.py` - Sistema completo integrado
- `advanced_detectors.py` - Detectores avançados
- `interactive_prompts.py` - Interface interativa
- `setup_auto_doc.py` - Script de configuração
- `test_auto_doc.py` - Testes do sistema

### Configuração
- `requirements.txt` - Dependências Python
- `auto_doc_config.py` - Configurações do sistema
- `start_auto_doc.sh` - Script Linux/Mac
- `start_auto_doc.bat` - Script Windows

### Documentação Atualizada
- `docs/CHANGELOG.md` - Log de mudanças automático
- `docs/apis.md` - APIs detectadas e documentadas
- `docs/banco-dados.md` - Mudanças no banco de dados

## 🔧 Configuração Avançada

### Arquivo de Configuração
```python
# auto_doc_config.py
PROJECT_ROOT = "."
DOCS_DIR = "docs"
WATCH_PATTERNS = [
    "*.js", "*.ts", "*.json", "*.md", "*.sql", "*.py"
]
IGNORE_PATTERNS = [
    "*.log", "*.tmp", "*.pyc", "__pycache__", 
    ".git", "node_modules", ".env", "tokens.json"
]
AUTO_UPDATE = false
NOTIFY_CHANGES = true
```

### Padrões de Detecção

#### APIs (Express.js)
```javascript
// Detecta automaticamente:
app.get('/api/users', (req, res) => { ... });
app.post('/api/users', (req, res) => { ... });
router.put('/api/users/:id', (req, res) => { ... });
```

#### Banco de Dados (SQL)
```sql
-- Detecta automaticamente:
CREATE TABLE users (id SERIAL PRIMARY KEY);
ALTER TABLE users ADD COLUMN email VARCHAR(100);
DROP TABLE old_table;
```

#### Dependências (package.json)
```json
{
  "dependencies": {
    "express": "^4.18.0"  // Detecta automaticamente
  }
}
```

## 🧪 Testes

### Executar Testes
```bash
# Testar sistema completo
python test_auto_doc.py

# Testar componentes específicos
python -c "from advanced_detectors import APIDetector; print('OK')"
```

### Testes Incluídos
- ✅ Detecção de APIs
- ✅ Detecção de banco de dados
- ✅ Detecção de dependências
- ✅ Sistema integrado
- ✅ Interface interativa

## 📊 Exemplo de Uso

### 1. Iniciar Sistema
```bash
python auto_doc_integrated.py --watch
```

### 2. Fazer Mudanças no Código
```javascript
// Adicionar nova rota
app.get('/api/products', (req, res) => {
    res.json({ products: [] });
});
```

### 3. Sistema Detecta e Pergunta
```
🚨 Detectei mudanças:
- Novo endpoint: GET /api/products
- Arquivo: src/server.js

Deseja atualizar a documentação? (s/n/m)
```

### 4. Documentação Atualizada
```markdown
## APIs Detectadas

### GET /api/products
- Arquivo: src/server.js
- Parâmetros: Nenhum
- Descrição: Endpoint para listar produtos
```

## 🔒 Segurança e Preservação

### ✅ O que o Sistema FAZ
- Monitora mudanças em tempo real
- Detecta APIs, banco de dados e dependências
- Pergunta antes de atualizar
- Adiciona informações sem apagar
- Preserva documentação existente

### ❌ O que o Sistema NÃO FAZ
- Nunca apaga arquivos existentes
- Nunca sobrescreve documentação
- Nunca modifica código fonte
- Nunca faz mudanças sem permissão

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. "Não é um repositório Git"
```bash
# Inicializar Git
git init
git add .
git commit -m "Initial commit"
```

#### 2. "Python 3.8+ necessário"
```bash
# Verificar versão
python --version

# Instalar Python 3.8+
# Windows: https://python.org/downloads
# Linux: sudo apt install python3.8
# Mac: brew install python@3.8
```

#### 3. "Dependências não instaladas"
```bash
# Instalar dependências
pip install -r requirements.txt

# Ou instalar manualmente
pip install watchdog GitPython pdoc pyyaml colorama rich click python-dotenv
```

#### 4. "Permissão negada"
```bash
# Linux/Mac - Dar permissão de execução
chmod +x start_auto_doc.sh
chmod +x auto_doc_system.py
```

### Logs e Debug
```bash
# Executar com debug
DEBUG=1 python auto_doc_integrated.py --watch

# Ver logs detalhados
tail -f logs/auto_doc.log
```

## 📈 Monitoramento e Métricas

### Métricas Disponíveis
- **Mudanças detectadas** por minuto
- **APIs descobertas** automaticamente
- **Tabelas de banco** monitoradas
- **Dependências** rastreadas
- **Arquivos** analisados

### Logs Gerados
- `logs/auto_doc.log` - Log principal
- `logs/api_detection.log` - Detecção de APIs
- `logs/database_detection.log` - Detecção de banco
- `logs/dependency_detection.log` - Detecção de dependências

## 🤝 Contribuição

### Como Contribuir
1. Fork o projeto
2. Crie uma branch para sua feature
3. Implemente melhorias
4. Execute testes
5. Abra um Pull Request

### Áreas de Melhoria
- Suporte a mais frameworks
- Detecção de mais tipos de arquivo
- Interface web
- Integração com CI/CD
- Relatórios avançados

## 📄 Licença

MIT License - veja arquivo LICENSE para detalhes.

## 🆘 Suporte

### Documentação
- Consulte este README
- Verifique logs de erro
- Execute testes de validação

### Problemas
- Abra uma issue no GitHub
- Descreva o problema detalhadamente
- Inclua logs de erro se houver

---

**Desenvolvido com ❤️ para manter sua documentação sempre atualizada!**
