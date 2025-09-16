@echo off
echo.
echo ========================================
echo  Sistema de Auto-Documentacao Inteligente
echo ========================================
echo.

REM Verificar se Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Python nao encontrado!
    echo Instale Python 3.8+ em https://python.org/downloads
    pause
    exit /b 1
)

REM Verificar se é um repositório Git
git --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Git nao encontrado!
    echo Instale Git em https://git-scm.com/downloads
    pause
    exit /b 1
)

REM Verificar se requirements.txt existe
if not exist requirements.txt (
    echo ERRO: requirements.txt nao encontrado!
    echo Execute primeiro: python setup_auto_doc.py
    pause
    exit /b 1
)

REM Instalar dependências se necessário
echo Verificando dependencias...
pip install -r requirements.txt --quiet

REM Iniciar sistema
echo.
echo Iniciando Sistema de Auto-Documentacao...
echo Pressione Ctrl+C para parar
echo.

python auto_doc_integrated.py --watch

pause
