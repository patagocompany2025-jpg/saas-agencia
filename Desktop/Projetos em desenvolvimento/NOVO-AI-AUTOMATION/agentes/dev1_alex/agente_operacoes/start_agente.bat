@echo off
REM Script de inicialização do Agente de Operações para Windows

echo 🚀 Iniciando Agente de Operações - Operations Master
echo ============================================================

REM Verificar se Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python não encontrado. Instale Python 3.9+ e tente novamente.
    pause
    exit /b 1
)

REM Verificar se o arquivo .env existe
if not exist .env (
    echo ⚠️  Arquivo .env não encontrado. Copiando de env.example...
    copy env.example .env
    echo ✅ Arquivo .env criado. Configure as variáveis de ambiente antes de continuar.
    pause
    exit /b 0
)

REM Instalar dependências se necessário
if not exist venv (
    echo 📦 Criando ambiente virtual...
    python -m venv venv
)

echo 🔧 Ativando ambiente virtual...
call venv\Scripts\activate.bat

echo 📥 Instalando dependências...
pip install -r requirements.txt

echo 🚀 Iniciando Agente de Operações...
python start_agente.py

pause
