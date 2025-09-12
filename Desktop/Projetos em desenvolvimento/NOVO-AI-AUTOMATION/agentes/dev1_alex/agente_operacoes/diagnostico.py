#!/usr/bin/env python3
"""
Script de diagnóstico para o Agente de Operações.

Este script verifica se tudo está configurado corretamente.
"""

import sys
import os
import subprocess
import socket
from pathlib import Path

def print_header(title):
    """Imprime cabeçalho formatado."""
    print(f"\n{'='*60}")
    print(f"🔍 {title}")
    print(f"{'='*60}")

def print_status(item, status, details=""):
    """Imprime status de verificação."""
    icon = "✅" if status else "❌"
    print(f"{icon} {item}")
    if details:
        print(f"   {details}")

def check_python_version():
    """Verifica versão do Python."""
    print_header("VERIFICAÇÃO DO PYTHON")
    
    version = sys.version_info
    is_valid = version.major == 3 and version.minor >= 9
    
    print_status(
        "Versão do Python",
        is_valid,
        f"Atual: {version.major}.{version.minor}.{version.micro} (Requerido: 3.9+)"
    )
    
    return is_valid

def check_dependencies():
    """Verifica dependências instaladas."""
    print_header("VERIFICAÇÃO DE DEPENDÊNCIAS")
    
    required_packages = [
        'fastapi',
        'uvicorn',
        'sqlalchemy',
        'pydantic',
        'redis',
        'celery'
    ]
    
    all_installed = True
    
    for package in required_packages:
        try:
            __import__(package)
            print_status(f"Pacote {package}", True)
        except ImportError:
            print_status(f"Pacote {package}", False, "Não instalado")
            all_installed = False
    
    return all_installed

def check_file_structure():
    """Verifica estrutura de arquivos."""
    print_header("VERIFICAÇÃO DA ESTRUTURA DE ARQUIVOS")
    
    required_files = [
        'src/__init__.py',
        'src/main.py',
        'src/core/config.py',
        'src/core/database.py',
        'src/models/__init__.py',
        'src/api/routes/__init__.py',
        'requirements.txt',
        'env.example'
    ]
    
    all_files_exist = True
    
    for file_path in required_files:
        exists = Path(file_path).exists()
        print_status(f"Arquivo {file_path}", exists)
        if not exists:
            all_files_exist = False
    
    return all_files_exist

def check_imports():
    """Verifica se os imports funcionam."""
    print_header("VERIFICAÇÃO DE IMPORTS")
    
    try:
        # Adicionar src ao path
        sys.path.insert(0, str(Path('src')))
        
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

def check_port_availability():
    """Verifica se a porta 8000 está disponível."""
    print_header("VERIFICAÇÃO DA PORTA 8000")
    
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('localhost', 8000))
        sock.close()
        
        is_available = result != 0
        print_status(
            "Porta 8000",
            is_available,
            "Disponível" if is_available else "Ocupada"
        )
        
        return is_available
        
    except Exception as e:
        print_status("Porta 8000", False, f"Erro: {str(e)}")
        return False

def check_env_file():
    """Verifica arquivo de configuração."""
    print_header("VERIFICAÇÃO DO ARQUIVO .env")
    
    env_exists = Path('.env').exists()
    print_status("Arquivo .env", env_exists)
    
    if not env_exists:
        print("   💡 Execute: cp env.example .env")
        return False
    
    # Verificar variáveis essenciais
    try:
        with open('.env', 'r') as f:
            content = f.read()
            
        essential_vars = [
            'DATABASE_URL',
            'REDIS_URL',
            'SECRET_KEY'
        ]
        
        all_vars_present = True
        for var in essential_vars:
            if var not in content or f"{var}=" not in content:
                print_status(f"Variável {var}", False, "Não configurada")
                all_vars_present = False
            else:
                print_status(f"Variável {var}", True)
        
        return all_vars_present
        
    except Exception as e:
        print_status("Leitura .env", False, f"Erro: {str(e)}")
        return False

def test_server_startup():
    """Testa inicialização do servidor."""
    print_header("TESTE DE INICIALIZAÇÃO DO SERVIDOR")
    
    try:
        # Adicionar src ao path
        sys.path.insert(0, str(Path('src')))
        
        from src.main import create_app
        app = create_app()
        print_status("Criação da app", True)
        
        # Testar se consegue criar as rotas
        routes = [route.path for route in app.routes]
        print_status("Rotas criadas", len(routes) > 0, f"Total: {len(routes)}")
        
        return True
        
    except Exception as e:
        print_status("Inicialização", False, f"Erro: {str(e)}")
        return False

def main():
    """Função principal de diagnóstico."""
    print("🔍 DIAGNÓSTICO DO AGENTE DE OPERAÇÕES")
    print("=" * 60)
    
    # Verificações
    checks = [
        ("Python", check_python_version),
        ("Dependências", check_dependencies),
        ("Estrutura", check_file_structure),
        ("Imports", check_imports),
        ("Porta 8000", check_port_availability),
        ("Configuração", check_env_file),
        ("Servidor", test_server_startup)
    ]
    
    results = []
    
    for name, check_func in checks:
        try:
            result = check_func()
            results.append((name, result))
        except Exception as e:
            print(f"❌ Erro ao verificar {name}: {e}")
            results.append((name, False))
    
    # Resumo
    print_header("RESUMO DO DIAGNÓSTICO")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASSOU" if result else "❌ FALHOU"
        print(f"{status} {name}")
    
    print(f"\n📊 Resultado: {passed}/{total} verificações passaram")
    
    if passed == total:
        print("\n🎉 TUDO OK! O Agente de Operações deve funcionar corretamente.")
        print("   Execute: python start_agente.py")
    else:
        print("\n⚠️  PROBLEMAS ENCONTRADOS!")
        print("   Consulte o arquivo TROUBLESHOOTING.md para soluções.")
        
        # Sugestões específicas
        if not any(result for name, result in results if "Dependências" in name):
            print("\n💡 SUGESTÃO: Instale as dependências:")
            print("   pip install -r requirements.txt")
        
        if not any(result for name, result in results if "Configuração" in name):
            print("\n💡 SUGESTÃO: Configure o arquivo .env:")
            print("   cp env.example .env")
            print("   # Edite o arquivo .env com suas configurações")

if __name__ == "__main__":
    main()
