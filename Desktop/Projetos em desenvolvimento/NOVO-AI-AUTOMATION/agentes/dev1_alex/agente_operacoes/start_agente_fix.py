#!/usr/bin/env python3
"""
Script de inicialização com correção automática de problemas.

Este script detecta e corrige problemas comuns automaticamente.
"""

import sys
import os
import subprocess
import shutil
from pathlib import Path

def print_header(title):
    """Imprime cabeçalho formatado."""
    print(f"\n{'='*60}")
    print(f"🔧 {title}")
    print(f"{'='*60}")

def print_status(item, status, details=""):
    """Imprime status de verificação."""
    icon = "✅" if status else "❌"
    print(f"{icon} {item}")
    if details:
        print(f"   {details}")

def check_and_fix_python():
    """Verifica e corrige Python."""
    print_header("VERIFICAÇÃO E CORREÇÃO DO PYTHON")
    
    version = sys.version_info
    if version.major == 3 and version.minor >= 9:
        print_status("Python", True, f"Versão {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print_status("Python", False, f"Versão {version.major}.{version.minor}.{version.micro} (Requerido: 3.9+)")
        print("   ❌ Python 3.9+ é obrigatório. Instale uma versão mais recente.")
        return False

def check_and_fix_venv():
    """Verifica e cria ambiente virtual."""
    print_header("VERIFICAÇÃO E CRIAÇÃO DO AMBIENTE VIRTUAL")
    
    venv_path = Path("venv")
    
    if venv_path.exists():
        print_status("Ambiente virtual", True, "Já existe")
        return True
    else:
        print_status("Ambiente virtual", False, "Não encontrado")
        print("   🔧 Criando ambiente virtual...")
        
        try:
            subprocess.run([sys.executable, "-m", "venv", "venv"], check=True)
            print_status("Ambiente virtual", True, "Criado com sucesso")
            return True
        except subprocess.CalledProcessError as e:
            print_status("Ambiente virtual", False, f"Erro: {e}")
            return False

def check_and_fix_dependencies():
    """Verifica e instala dependências."""
    print_header("VERIFICAÇÃO E INSTALAÇÃO DE DEPENDÊNCIAS")
    
    # Verificar se requirements.txt existe
    if not Path("requirements.txt").exists():
        print_status("requirements.txt", False, "Arquivo não encontrado")
        return False
    
    # Verificar se pip está funcionando
    try:
        subprocess.run([sys.executable, "-m", "pip", "--version"], check=True, capture_output=True)
        print_status("pip", True)
    except subprocess.CalledProcessError:
        print_status("pip", False, "Não está funcionando")
        return False
    
    # Instalar dependências
    print("   🔧 Instalando dependências...")
    try:
        subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ], check=True)
        print_status("Dependências", True, "Instaladas com sucesso")
        return True
    except subprocess.CalledProcessError as e:
        print_status("Dependências", False, f"Erro na instalação: {e}")
        return False

def check_and_fix_env():
    """Verifica e cria arquivo .env."""
    print_header("VERIFICAÇÃO E CRIAÇÃO DO ARQUIVO .env")
    
    env_file = Path(".env")
    env_example = Path("env.example")
    
    if env_file.exists():
        print_status("Arquivo .env", True, "Já existe")
        return True
    elif env_example.exists():
        print_status("Arquivo .env", False, "Não encontrado")
        print("   🔧 Copiando de env.example...")
        
        try:
            shutil.copy(env_example, env_file)
            print_status("Arquivo .env", True, "Criado com sucesso")
            print("   ⚠️  Configure as variáveis de ambiente no arquivo .env")
            return True
        except Exception as e:
            print_status("Arquivo .env", False, f"Erro: {e}")
            return False
    else:
        print_status("Arquivo .env", False, "env.example não encontrado")
        return False

def check_and_fix_imports():
    """Verifica e corrige imports."""
    print_header("VERIFICAÇÃO DE IMPORTS")
    
    try:
        # Adicionar src ao path
        sys.path.insert(0, str(Path("src")))
        
        # Testar imports principais
        from src.core.config import settings
        print_status("Import settings", True)
        
        from src.core.database import Base
        print_status("Import database", True)
        
        from src.models.pedido import Pedido
        print_status("Import models", True)
        
        from src.api.routes.pedidos import router
        print_status("Import routes", True)
        
        return True
        
    except Exception as e:
        print_status("Imports", False, f"Erro: {str(e)}")
        return False

def check_port():
    """Verifica se a porta 8000 está disponível."""
    print_header("VERIFICAÇÃO DA PORTA 8000")
    
    import socket
    
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('localhost', 8000))
        sock.close()
        
        if result == 0:
            print_status("Porta 8000", False, "Ocupada")
            print("   💡 Tente matar o processo que está usando a porta 8000")
            print("   💡 Ou use uma porta diferente: uvicorn src.main:create_app --port 8001")
            return False
        else:
            print_status("Porta 8000", True, "Disponível")
            return True
            
    except Exception as e:
        print_status("Porta 8000", False, f"Erro: {e}")
        return False

def start_server():
    """Inicia o servidor."""
    print_header("INICIANDO SERVIDOR")
    
    try:
        # Adicionar src ao path
        sys.path.insert(0, str(Path("src")))
        
        from src.main import main
        print("   🚀 Iniciando Agente de Operações...")
        print("   📍 Swagger UI: http://localhost:8000/docs")
        print("   📍 Health Check: http://localhost:8000/health")
        print("   ⏹️  Pressione Ctrl+C para parar")
        print("")
        
        main()
        
    except KeyboardInterrupt:
        print("\n🛑 Servidor interrompido pelo usuário")
    except Exception as e:
        print(f"\n❌ Erro ao iniciar servidor: {e}")
        print("   💡 Consulte o arquivo TROUBLESHOOTING.md para mais ajuda")

def main():
    """Função principal."""
    print("🚀 AGENTE DE OPERAÇÕES - INICIALIZAÇÃO COM CORREÇÃO AUTOMÁTICA")
    print("=" * 70)
    
    # Verificações e correções
    checks = [
        ("Python", check_and_fix_python),
        ("Ambiente Virtual", check_and_fix_venv),
        ("Dependências", check_and_fix_dependencies),
        ("Configuração", check_and_fix_env),
        ("Imports", check_and_fix_imports),
        ("Porta", check_port)
    ]
    
    all_passed = True
    
    for name, check_func in checks:
        try:
            result = check_func()
            if not result:
                all_passed = False
        except Exception as e:
            print(f"❌ Erro ao verificar {name}: {e}")
            all_passed = False
    
    if all_passed:
        print_header("TUDO PRONTO!")
        print("✅ Todas as verificações passaram")
        print("🚀 Iniciando servidor...")
        start_server()
    else:
        print_header("PROBLEMAS ENCONTRADOS")
        print("❌ Algumas verificações falharam")
        print("💡 Consulte o arquivo TROUBLESHOOTING.md para soluções")
        print("💡 Ou execute: python diagnostico.py para diagnóstico detalhado")

if __name__ == "__main__":
    main()
