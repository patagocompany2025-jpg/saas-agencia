#!/bin/bash

echo ""
echo "========================================"
echo " Sistema de Auto-Documentação Inteligente"
echo "========================================"
echo ""

# Verificar se Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "ERRO: Python3 não encontrado!"
    echo "Instale Python 3.8+ com: sudo apt install python3.8"
    exit 1
fi

# Verificar se é um repositório Git
if ! command -v git &> /dev/null; then
    echo "ERRO: Git não encontrado!"
    echo "Instale Git com: sudo apt install git"
    exit 1
fi

# Verificar se requirements.txt existe
if [ ! -f "requirements.txt" ]; then
    echo "ERRO: requirements.txt não encontrado!"
    echo "Execute primeiro: python3 setup_auto_doc.py"
    exit 1
fi

# Instalar dependências se necessário
echo "Verificando dependências..."
pip3 install -r requirements.txt --quiet

# Iniciar sistema
echo ""
echo "Iniciando Sistema de Auto-Documentação..."
echo "Pressione Ctrl+C para parar"
echo ""

python3 auto_doc_integrated.py --watch
