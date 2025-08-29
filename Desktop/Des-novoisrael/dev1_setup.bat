@echo off
echo === Setup Ambiente Dev1 (Alex) ===
echo.

REM Criar e ativar ambiente virtual
python -m venv .venv
call .venv\Scripts\activate

REM Instalar dependências
pip install -r requirements.txt
pip install -r requirements_robust.txt

REM Configurar Git
git checkout dev1/alex
git pull origin dev1/alex

REM Criar arquivo .env se não existir
if not exist .env (
    echo OPENAI_API_KEY=seu_token > .env
    echo ANTHROPIC_API_KEY=seu_token >> .env
    echo GOOGLE_ADS_CLIENT_ID=seu_id >> .env
    echo GOOGLE_ADS_CLIENT_SECRET=sua_chave >> .env
    echo CONTA_AZUL_TOKEN=seu_token >> .env
)

REM Instalar extensões VS Code
code --install-extension ms-python.python
code --install-extension ms-python.vscode-pylance
code --install-extension ms-python.black-formatter
code --install-extension eamodio.gitlens
code --install-extension littlefoxteam.vscode-python-test-adapter

echo.
echo === Ambiente configurado com sucesso! ===
echo.
echo Próximos passos:
echo 1. Configure suas credenciais no arquivo .env
echo 2. Execute 'code .' para abrir o VS Code
echo 3. Comece a desenvolver!
echo.
pause
