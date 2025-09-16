@echo off
REM Script para iniciar o Sistema de Acompanhamento do Progresso - Dev1
REM Windows Batch Script

echo.
echo ========================================
echo  Sistema de Acompanhamento - Dev1
echo ========================================
echo.

REM Verificar se Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python não encontrado!
    echo 💡 Instale Python 3.8+ e tente novamente
    pause
    exit /b 1
)

REM Verificar se o arquivo PDF existe
if not exist "Plano Completo NO IA.pdf" (
    echo ⚠️  Arquivo PDF não encontrado!
    echo 💡 Coloque o arquivo 'Plano Completo NO IA.pdf' na raiz do projeto
    echo.
    pause
    exit /b 1
)

REM Verificar se as dependências estão instaladas
echo 🔍 Verificando dependências...
python -c "import PyPDF2, rapidfuzz, git, watchdog, rich" >nul 2>&1
if errorlevel 1 (
    echo 📦 Instalando dependências...
    pip install -r tools/requirements.txt
    if errorlevel 1 (
        echo ❌ Erro ao instalar dependências!
        pause
        exit /b 1
    )
)

REM Executar o sistema
echo 🚀 Iniciando sistema...
echo.
python tools/plan_tracker.py %*

echo.
echo ✅ Sistema finalizado
pause
