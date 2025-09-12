#!/bin/bash
# Script de inicialização do Agente de Operações para Linux/macOS

echo "🚀 Iniciando Agente de Operações - Operations Master"
echo "============================================================"

# Verificar se Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 não encontrado. Instale Python 3.9+ e tente novamente."
    exit 1
fi

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo "⚠️  Arquivo .env não encontrado. Copiando de env.example..."
    cp env.example .env
    echo "✅ Arquivo .env criado. Configure as variáveis de ambiente antes de continuar."
    exit 0
fi

# Criar ambiente virtual se não existir
if [ ! -d "venv" ]; then
    echo "📦 Criando ambiente virtual..."
    python3 -m venv venv
fi

# Ativar ambiente virtual
echo "🔧 Ativando ambiente virtual..."
source venv/bin/activate

# Instalar dependências
echo "📥 Instalando dependências..."
pip install -r requirements.txt

# Iniciar Agente de Operações
echo "🚀 Iniciando Agente de Operações..."
python3 start_agente.py
