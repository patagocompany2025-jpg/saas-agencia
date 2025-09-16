#!/bin/bash
# Script para iniciar o Sistema de Acompanhamento do Progresso - Dev1
# Linux/macOS Shell Script

echo ""
echo "========================================"
echo " Sistema de Acompanhamento - Dev1"
echo "========================================"
echo ""

# Verificar se Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python não encontrado!"
    echo "💡 Instale Python 3.8+ e tente novamente"
    exit 1
fi

# Verificar se o arquivo PDF existe
if [ ! -f "Plano Completo NO IA.pdf" ]; then
    echo "⚠️  Arquivo PDF não encontrado!"
    echo "💡 Coloque o arquivo 'Plano Completo NO IA.pdf' na raiz do projeto"
    echo ""
    read -p "Pressione Enter para continuar..."
    exit 1
fi

# Verificar se as dependências estão instaladas
echo "🔍 Verificando dependências..."
if ! python3 -c "import PyPDF2, rapidfuzz, git, watchdog, rich" 2>/dev/null; then
    echo "📦 Instalando dependências..."
    pip3 install -r tools/requirements.txt
    if [ $? -ne 0 ]; then
        echo "❌ Erro ao instalar dependências!"
        exit 1
    fi
fi

# Executar o sistema
echo "🚀 Iniciando sistema..."
echo ""
python3 tools/plan_tracker.py "$@"

echo ""
echo "✅ Sistema finalizado"
