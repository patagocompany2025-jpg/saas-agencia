# Guia Completo para Dev1 (Alex) - Módulo Analytics

## 🚀 Configuração Inicial do Ambiente

### 1. Clone e Setup do Repositório
```bash
# Clone o repositório
git clone https://github.com/novoisraelia/novoisrael-ai-automation.git
cd novoisrael-ai-automation

# Mude para seu branch dedicado
git checkout dev1/alex

# Crie ambiente virtual Python
python -m venv .venv

# Ative o ambiente (Windows)
.\.venv\Scripts\activate

# Instale dependências
pip install -r requirements.txt
pip install -r requirements_robust.txt  # Dependências extras para analytics
```

### 2. Configuração do VS Code
1. Abra o VS Code
2. Instale as extensões recomendadas:
   - Python
   - Pylance
   - Black Formatter
   - Git Lens
   - Python Test Explorer
   - Python Docstring Generator

## 📁 Sua Estrutura de Trabalho

```
agentes/dev1_alex/
├── analytics/              # Módulo principal de analytics
│   ├── src/
│   │   ├── metrics/       # Métricas e KPIs
│   │   ├── reports/       # Geração de relatórios
│   │   └── integrations/  # Integrações com APIs
│   └── tests/             # Testes unitários
├── campaign_creator/       # Criação de campanhas
├── google_ads/            # Integração Google Ads
└── testing_optimization/   # Testes A/B e otimização
```

## 🔄 Fluxo de Trabalho Diário

### 1. Início do Dia
```bash
# Atualize seu branch
git checkout dev1/alex
git pull origin dev1/alex

# Crie branch para nova feature
git checkout -b dev1/alex/feature-nome
# Exemplo: git checkout -b dev1/alex/metricas-vendas
```

### 2. Durante o Desenvolvimento
```bash
# Verifique status
git status

# Adicione arquivos
git add .

# Faça commit
git commit -m "feat(analytics): descrição clara da mudança"

# Envie para GitHub
git push origin dev1/alex/feature-nome
```

## 🛠️ Comandos VS Code Úteis

Use `Ctrl+Shift+P` e digite:
- `Tasks: Run Task` -> `DEV1: Start Analytics Agent`
- `Tasks: Run Task` -> `DEV1: Start Mega Vendedor`
- `Tasks: Run Task` -> `DEV1: Run Tests`

## 📝 Padrões de Commit

```bash
feat(analytics): nova funcionalidade
fix(analytics): correção de bug
docs(analytics): atualização de documentação
test(analytics): novos testes
refactor(analytics): refatoração de código
perf(analytics): melhorias de performance
```

## 🔍 Debug e Testes

### Debug no VS Code
1. Pressione F5
2. Selecione "Dev1: Analytics Debug"
3. Use breakpoints para debug

### Executar Testes
```bash
# Todos os testes
pytest tests/

# Teste específico
pytest tests/test_analytics.py -v

# Com cobertura
pytest --cov=src tests/
```

## ⚙️ Configurações

### Arquivo .env
Crie na raiz do seu módulo:
```env
# Configurações Dev1
OPENAI_API_KEY=sua_chave
ANTHROPIC_API_KEY=sua_chave
GOOGLE_ADS_CLIENT_ID=seu_id
GOOGLE_ADS_CLIENT_SECRET=sua_chave
CONTA_AZUL_TOKEN=seu_token
```

## 📊 Módulos Principais

### 1. Analytics
- Métricas de vendas
- KPIs de performance
- Relatórios automáticos
- Dashboards em tempo real

### 2. Campaign Creator
- Criação de campanhas
- A/B testing
- Otimização de ROI
- Análise de performance

### 3. Google Ads
- Integração com API
- Automação de campanhas
- Otimização de keywords
- Relatórios de performance

## 🔒 Boas Práticas

1. **Código**
   - Use type hints
   - Documente funções
   - Siga PEP 8
   - Mantenha funções pequenas

2. **Git**
   - Commits frequentes
   - Mensagens claras
   - Pull requests concisos
   - Resolva conflitos localmente

3. **Testes**
   - Escreva testes unitários
   - Mantenha cobertura > 80%
   - Use fixtures
   - Mock chamadas externas

## 🚨 Resolução de Problemas

### Conflitos Git
```bash
# Atualizar com develop
git checkout dev1/alex
git pull origin develop
git push origin dev1/alex

# Resolver conflitos
git merge develop
# Resolva os conflitos
git add .
git commit -m "merge: resolve conflicts with develop"
```

### Ambiente Virtual
```bash
# Recriar ambiente
deactivate
rm -rf .venv
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

## 📋 Checklist Diário

- [ ] Pull do branch dev1/alex
- [ ] Criar branch para nova feature
- [ ] Rodar testes antes de commit
- [ ] Verificar lint/formatação
- [ ] Push para GitHub
- [ ] Criar PR quando pronto

## 🔗 Links Úteis

- Documentação: `/docs`
- API Reference: `/docs/api`
- Guias: `/docs/guides`
- Exemplos: `/examples`

## 📞 Suporte

- Issues técnicas: Criar issue no GitHub
- Discussões: Usar pull requests
- Emergências: Contatar líder técnico

## 🎯 Objetivos do Módulo Analytics

1. **Métricas Principais**
   - Taxa de conversão
   - ROI por campanha
   - Lifetime Value
   - Custo de aquisição

2. **Relatórios Automáticos**
   - Diários
   - Semanais
   - Mensais
   - Por campanha

3. **Integrações**
   - Google Analytics
   - Meta Business
   - Conta Azul
   - Loja Integrada

## ⚡ Dicas de Produtividade

1. **VS Code**
   - Use snippets
   - Configure atalhos
   - Utilize multi-cursor
   - Live Share para pair programming

2. **Git**
   - Alias úteis
   - Stash para mudanças temporárias
   - Rebase para histórico limpo
   - Cherry-pick quando necessário

3. **Python**
   - Use virtual environments
   - Mantenha requirements.txt atualizado
   - Utilize ferramentas de profiling
   - Debug com iPython/pdb

## 🎉 Conclusão

Este guia serve como referência para seu trabalho no módulo Analytics. Mantenha-o atualizado e consulte sempre que necessário. Para dúvidas específicas, consulte a documentação ou abra uma issue no GitHub.

---
Última atualização: Agosto 2024
