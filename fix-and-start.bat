@echo off
echo ========================================
echo    CORRIGINDO E INICIANDO SERVIDOR
echo ========================================
echo.

echo 1. Parando processos Node.js...
taskkill /F /IM node.exe 2>nul

echo 2. Limpando cache...
if exist .next rmdir /s /q .next
npm cache clean --force

echo 3. Removendo lockfiles conflitantes...
if exist "C:\Users\Alex\pnpm-lock.yaml" del "C:\Users\Alex\pnpm-lock.yaml"

echo 4. Instalando dependencias...
call npm install

echo 5. Iniciando servidor sem Turbopack...
echo.
echo ========================================
echo    SERVIDOR INICIANDO...
echo    Acesse: http://localhost:3000
echo ========================================
echo.

call npx next dev
pause
