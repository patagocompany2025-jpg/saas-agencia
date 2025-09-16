#!/usr/bin/env python3
"""
Script de configuração do Sistema de Auto-Documentação
"""

import os
import sys
import subprocess
from pathlib import Path
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Confirm

console = Console()

def check_python_version():
    """Verifica se a versão do Python é compatível"""
    if sys.version_info < (3, 8):
        console.print("[red]❌ Python 3.8+ é necessário![/red]")
        console.print(f"Versão atual: {sys.version}")
        return False
    return True

def install_dependencies():
    """Instala as dependências necessárias"""
    console.print("[blue]📦 Instalando dependências...[/blue]")
    
    try:
        subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ], check=True)
        console.print("[green]✅ Dependências instaladas com sucesso![/green]")
        return True
    except subprocess.CalledProcessError as e:
        console.print(f"[red]❌ Erro ao instalar dependências: {e}[/red]")
        return False

def create_config_file():
    """Cria arquivo de configuração"""
    config_content = """# Configuração do Sistema de Auto-Documentação
PROJECT_ROOT = "."
DOCS_DIR = "docs"
WATCH_PATTERNS = [
    "*.js", "*.ts", "*.json", "*.md", "*.sql", "*.py"
]
IGNORE_PATTERNS = [
    "*.log", "*.tmp", "*.pyc", "__pycache__", 
    ".git", "node_modules", ".env", "tokens.json",
    "*.swp", "*.swo", ".DS_Store", "coverage"
]
AUTO_UPDATE = false
NOTIFY_CHANGES = true
"""
    
    config_path = Path("auto_doc_config.py")
    if not config_path.exists():
        with open(config_path, 'w', encoding='utf-8') as f:
            f.write(config_content)
        console.print("[green]✅ Arquivo de configuração criado![/green]")
    else:
        console.print("[yellow]⚠️ Arquivo de configuração já existe.[/yellow]")

def create_startup_scripts():
    """Cria scripts de inicialização"""
    
    # Script Windows
    windows_script = """@echo off
echo Iniciando Sistema de Auto-Documentacao...
python auto_doc_system.py --watch
pause
"""
    
    with open("start_auto_doc.bat", 'w', encoding='utf-8') as f:
        f.write(windows_script)
    
    # Script Linux/Mac
    linux_script = """#!/bin/bash
echo "Iniciando Sistema de Auto-Documentacao..."
python3 auto_doc_system.py --watch
"""
    
    with open("start_auto_doc.sh", 'w', encoding='utf-8') as f:
        f.write(linux_script)
    
    # Tornar executável no Linux/Mac
    try:
        os.chmod("start_auto_doc.sh", 0o755)
    except:
        pass
    
    console.print("[green]✅ Scripts de inicialização criados![/green]")

def create_git_hooks():
    """Cria hooks do Git para documentação automática"""
    hooks_dir = Path(".git/hooks")
    
    if not hooks_dir.exists():
        console.print("[yellow]⚠️ Diretório .git/hooks não encontrado. Execute em um repositório Git.[/yellow]")
        return
    
    # Pre-commit hook
    pre_commit_hook = """#!/bin/bash
echo "Executando análise de documentação..."
python3 auto_doc_system.py --analyze-only
"""
    
    pre_commit_path = hooks_dir / "pre-commit"
    with open(pre_commit_path, 'w', encoding='utf-8') as f:
        f.write(pre_commit_hook)
    
    try:
        os.chmod(pre_commit_path, 0o755)
        console.print("[green]✅ Git hook criado![/green]")
    except:
        console.print("[yellow]⚠️ Não foi possível tornar o hook executável.[/yellow]")

def create_docs_structure():
    """Cria estrutura básica de documentação se não existir"""
    docs_dir = Path("docs")
    docs_dir.mkdir(exist_ok=True)
    
    # CHANGELOG.md se não existir
    changelog_path = docs_dir / "CHANGELOG.md"
    if not changelog_path.exists():
        changelog_content = """# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não Lançado]

### Adicionado
- Sistema de auto-documentação inteligente
- Monitoramento automático de mudanças
- Atualização automática de documentação

"""
        with open(changelog_path, 'w', encoding='utf-8') as f:
            f.write(changelog_content)
        console.print("[green]✅ CHANGELOG.md criado![/green]")

def main():
    """Função principal de configuração"""
    console.print(Panel.fit(
        "[bold blue]🔧 Configuração do Sistema de Auto-Documentação[/bold blue]\n"
        "Este script irá configurar o sistema de monitoramento automático.",
        title="Setup Auto-Doc"
    ))
    
    # Verificar Python
    if not check_python_version():
        return
    
    # Instalar dependências
    if not install_dependencies():
        return
    
    # Criar arquivos de configuração
    create_config_file()
    create_startup_scripts()
    create_git_hooks()
    create_docs_structure()
    
    console.print(Panel.fit(
        "[bold green]✅ Configuração concluída com sucesso![/bold green]\n\n"
        "[bold]Como usar:[/bold]\n"
        "• [cyan]python auto_doc_system.py --watch[/cyan] - Monitoramento contínuo\n"
        "• [cyan]python auto_doc_system.py[/cyan] - Análise única\n"
        "• [cyan]./start_auto_doc.sh[/cyan] - Script de inicialização (Linux/Mac)\n"
        "• [cyan]start_auto_doc.bat[/cyan] - Script de inicialização (Windows)\n\n"
        "[bold]Arquivos criados:[/bold]\n"
        "• auto_doc_system.py - Sistema principal\n"
        "• requirements.txt - Dependências Python\n"
        "• auto_doc_config.py - Configurações\n"
        "• docs/CHANGELOG.md - Log de mudanças\n"
        "• Scripts de inicialização",
        title="Configuração Completa"
    ))

if __name__ == '__main__':
    main()
