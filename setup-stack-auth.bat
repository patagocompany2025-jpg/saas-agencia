@echo off
echo.
echo ========================================
echo    CONFIGURACAO STACK AUTH - PATAGONIA
echo ========================================
echo.

echo 1. Acesse: https://stack-auth.com
echo 2. Crie uma conta
echo 3. Crie um novo projeto
echo 4. Copie as credenciais
echo.

echo Criando arquivo .env.local...
echo.

echo # Stack Auth Configuration > .env.local
echo STACK_SECRET_SERVER_KEY=sk_SUA_CHAVE_AQUI >> .env.local
echo NEXT_PUBLIC_STACK_PROJECT_ID=prj_SEU_PROJECT_ID_AQUI >> .env.local
echo NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=pk_SUA_CHAVE_PUBLICA_AQUI >> .env.local
echo. >> .env.local
echo # Database Configuration >> .env.local
echo DATABASE_URL=postgresql://username:password@host:port/database >> .env.local
echo. >> .env.local
echo # NextAuth Configuration >> .env.local
echo NEXTAUTH_SECRET=seu_secret_aqui >> .env.local
echo NEXTAUTH_URL=http://localhost:3000 >> .env.local
echo. >> .env.local
echo # Environment >> .env.local
echo NODE_ENV=development >> .env.local

echo.
echo ✅ Arquivo .env.local criado!
echo.
echo ⚠️  IMPORTANTE: Edite o arquivo .env.local e substitua:
echo    - sk_SUA_CHAVE_AQUI pelas suas credenciais reais
echo    - prj_SEU_PROJECT_ID_AQUI pelo seu project ID
echo    - pk_SUA_CHAVE_PUBLICA_AQUI pela sua chave pública
echo.
echo 🚀 Após configurar, execute: npm run dev
echo.
pause
