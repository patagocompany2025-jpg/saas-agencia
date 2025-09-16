#!/usr/bin/env python3
"""
Sistema de Auto-Documentação Inteligente
Monitora mudanças no projeto e atualiza documentação automaticamente
"""

import os
import sys
import json
import re
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Set, Optional, Tuple
from dataclasses import dataclass

import click
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from git import Repo, InvalidGitRepositoryError
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.prompt import Confirm, Prompt
from rich.syntax import Syntax
import yaml

console = Console()

@dataclass
class Change:
    """Representa uma mudança detectada no projeto"""
    type: str  # 'file', 'api', 'database', 'dependency'
    description: str
    file_path: str
    timestamp: datetime
    details: Dict = None

class ProjectMonitor(FileSystemEventHandler):
    """Monitor de mudanças no projeto"""
    
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.changes: List[Change] = []
        self.ignored_patterns = {
            '*.log', '*.tmp', '*.pyc', '__pycache__', 
            '.git', 'node_modules', '.env', 'tokens.json',
            '*.swp', '*.swo', '.DS_Store'
        }
        
    def should_ignore(self, path: str) -> bool:
        """Verifica se o arquivo deve ser ignorado"""
        path_obj = Path(path)
        for pattern in self.ignored_patterns:
            if path_obj.match(pattern) or pattern in str(path_obj):
                return True
        return False
    
    def on_modified(self, event):
        if not event.is_directory and not self.should_ignore(event.src_path):
            self._analyze_change(event.src_path, 'modified')
    
    def on_created(self, event):
        if not event.is_directory and not self.should_ignore(event.src_path):
            self._analyze_change(event.src_path, 'created')
    
    def on_deleted(self, event):
        if not event.is_directory and not self.should_ignore(event.src_path):
            self._analyze_change(event.src_path, 'deleted')
    
    def _analyze_change(self, file_path: str, change_type: str):
        """Analisa o tipo de mudança e extrai informações relevantes"""
        try:
            relative_path = os.path.relpath(file_path, self.project_root)
            
            # Detectar mudanças em APIs
            if self._is_api_file(file_path):
                api_changes = self._detect_api_changes(file_path, change_type)
                self.changes.extend(api_changes)
            
            # Detectar mudanças em banco de dados
            elif self._is_database_file(file_path):
                db_changes = self._detect_database_changes(file_path, change_type)
                self.changes.extend(db_changes)
            
            # Detectar mudanças em dependências
            elif self._is_dependency_file(file_path):
                dep_changes = self._detect_dependency_changes(file_path, change_type)
                self.changes.extend(dep_changes)
            
            # Mudança genérica de arquivo
            else:
                change = Change(
                    type='file',
                    description=f'Arquivo {change_type}: {relative_path}',
                    file_path=relative_path,
                    timestamp=datetime.now(),
                    details={'change_type': change_type}
                )
                self.changes.append(change)
                
        except Exception as e:
            console.print(f"[red]Erro ao analisar mudança: {e}[/red]")
    
    def _is_api_file(self, file_path: str) -> bool:
        """Verifica se é um arquivo relacionado a APIs"""
        api_patterns = ['server.js', 'routes/', 'api/', 'endpoints', 'webhook']
        return any(pattern in file_path.lower() for pattern in api_patterns)
    
    def _is_database_file(self, file_path: str) -> bool:
        """Verifica se é um arquivo relacionado a banco de dados"""
        db_patterns = ['schema', 'migration', 'model', 'database', 'supabase']
        return any(pattern in file_path.lower() for pattern in db_patterns)
    
    def _is_dependency_file(self, file_path: str) -> bool:
        """Verifica se é um arquivo de dependências"""
        return file_path.endswith(('package.json', 'requirements.txt', 'yarn.lock', 'package-lock.json'))
    
    def _detect_api_changes(self, file_path: str, change_type: str) -> List[Change]:
        """Detecta mudanças em APIs"""
        changes = []
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Detectar novos endpoints
            endpoints = self._extract_endpoints(content)
            for endpoint in endpoints:
                change = Change(
                    type='api',
                    description=f'Novo endpoint: {endpoint}',
                    file_path=os.path.relpath(file_path, self.project_root),
                    timestamp=datetime.now(),
                    details={'endpoint': endpoint, 'change_type': change_type}
                )
                changes.append(change)
                
        except Exception as e:
            console.print(f"[yellow]Erro ao analisar API {file_path}: {e}[/yellow]")
        
        return changes
    
    def _extract_endpoints(self, content: str) -> List[str]:
        """Extrai endpoints de arquivos JavaScript/TypeScript"""
        endpoints = []
        
        # Padrões para Express.js
        patterns = [
            r'app\.(get|post|put|delete|patch)\([\'"]([^\'"]+)[\'"]',
            r'router\.(get|post|put|delete|patch)\([\'"]([^\'"]+)[\'"]',
            r'\.(get|post|put|delete|patch)\([\'"]([^\'"]+)[\'"]'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, content)
            for match in matches:
                if len(match) == 2:
                    method, endpoint = match
                    endpoints.append(f"{method.upper()} {endpoint}")
        
        return endpoints
    
    def _detect_database_changes(self, file_path: str, change_type: str) -> List[Change]:
        """Detecta mudanças em banco de dados"""
        changes = []
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Detectar tabelas
            tables = self._extract_tables(content)
            for table in tables:
                change = Change(
                    type='database',
                    description=f'Alteração na tabela: {table}',
                    file_path=os.path.relpath(file_path, self.project_root),
                    timestamp=datetime.now(),
                    details={'table': table, 'change_type': change_type}
                )
                changes.append(change)
                
        except Exception as e:
            console.print(f"[yellow]Erro ao analisar banco {file_path}: {e}[/yellow]")
        
        return changes
    
    def _extract_tables(self, content: str) -> List[str]:
        """Extrai nomes de tabelas do código"""
        tables = []
        
        # Padrões para tabelas
        patterns = [
            r'CREATE TABLE\s+(\w+)',
            r'ALTER TABLE\s+(\w+)',
            r'DROP TABLE\s+(\w+)',
            r'\.from\([\'"]([^\'"]+)[\'"]\)',  # Supabase
            r'\.table\([\'"]([^\'"]+)[\'"]\)'  # Outros ORMs
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            tables.extend(matches)
        
        return list(set(tables))
    
    def _detect_dependency_changes(self, file_path: str, change_type: str) -> List[Change]:
        """Detecta mudanças em dependências"""
        changes = []
        try:
            if file_path.endswith('package.json'):
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # Detectar novas dependências
                if 'dependencies' in data:
                    for dep, version in data['dependencies'].items():
                        change = Change(
                            type='dependency',
                            description=f'Dependência: {dep}@{version}',
                            file_path=os.path.relpath(file_path, self.project_root),
                            timestamp=datetime.now(),
                            details={'package': dep, 'version': version, 'change_type': change_type}
                        )
                        changes.append(change)
                        
        except Exception as e:
            console.print(f"[yellow]Erro ao analisar dependências {file_path}: {e}[/yellow]")
        
        return changes

class DocumentationUpdater:
    """Atualizador de documentação"""
    
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.docs_dir = self.project_root / 'docs'
        self.docs_dir.mkdir(exist_ok=True)
    
    def update_changelog(self, changes: List[Change]):
        """Atualiza o CHANGELOG.md"""
        changelog_path = self.docs_dir / 'CHANGELOG.md'
        
        # Ler changelog existente
        existing_content = ""
        if changelog_path.exists():
            with open(changelog_path, 'r', encoding='utf-8') as f:
                existing_content = f.read()
        
        # Gerar nova entrada
        today = datetime.now().strftime('%Y-%m-%d')
        new_entry = f"\n## [{today}] - Mudanças Detectadas\n\n"
        
        # Agrupar mudanças por tipo
        changes_by_type = {}
        for change in changes:
            if change.type not in changes_by_type:
                changes_by_type[change.type] = []
            changes_by_type[change.type].append(change)
        
        # Adicionar mudanças por categoria
        for change_type, type_changes in changes_by_type.items():
            if change_type == 'api':
                new_entry += "### 🔌 APIs\n"
                for change in type_changes:
                    new_entry += f"- {change.description}\n"
            elif change_type == 'database':
                new_entry += "### 🗄️ Banco de Dados\n"
                for change in type_changes:
                    new_entry += f"- {change.description}\n"
            elif change_type == 'dependency':
                new_entry += "### 📦 Dependências\n"
                for change in type_changes:
                    new_entry += f"- {change.description}\n"
            else:
                new_entry += "### 📁 Arquivos\n"
                for change in type_changes:
                    new_entry += f"- {change.description}\n"
        
        new_entry += "\n"
        
        # Escrever changelog atualizado
        with open(changelog_path, 'w', encoding='utf-8') as f:
            f.write(new_entry + existing_content)
        
        console.print(f"[green]✅ CHANGELOG.md atualizado![/green]")
    
    def update_api_docs(self, changes: List[Change]):
        """Atualiza documentação de APIs"""
        api_changes = [c for c in changes if c.type == 'api']
        if not api_changes:
            return
        
        api_docs_path = self.docs_dir / 'apis.md'
        
        # Ler documentação existente
        existing_content = ""
        if api_docs_path.exists():
            with open(api_docs_path, 'r', encoding='utf-8') as f:
                existing_content = f.read()
        
        # Adicionar novos endpoints
        new_endpoints = []
        for change in api_changes:
            if 'endpoint' in change.details:
                new_endpoints.append(change.details['endpoint'])
        
        if new_endpoints:
            new_section = f"\n## 🆕 Novos Endpoints Detectados\n\n"
            for endpoint in set(new_endpoints):
                new_section += f"- `{endpoint}`\n"
            new_section += "\n"
            
            # Adicionar ao final do arquivo
            with open(api_docs_path, 'a', encoding='utf-8') as f:
                f.write(new_section)
            
            console.print(f"[green]✅ APIs documentação atualizada![/green]")
    
    def update_database_docs(self, changes: List[Change]):
        """Atualiza documentação de banco de dados"""
        db_changes = [c for c in changes if c.type == 'database']
        if not db_changes:
            return
        
        db_docs_path = self.docs_dir / 'banco-dados.md'
        
        # Ler documentação existente
        existing_content = ""
        if db_docs_path.exists():
            with open(db_docs_path, 'r', encoding='utf-8') as f:
                existing_content = f.read()
        
        # Adicionar mudanças detectadas
        new_tables = []
        for change in db_changes:
            if 'table' in change.details:
                new_tables.append(change.details['table'])
        
        if new_tables:
            new_section = f"\n## 🔄 Mudanças Detectadas\n\n"
            for table in set(new_tables):
                new_section += f"- **{table}**: Alteração detectada\n"
            new_section += "\n"
            
            # Adicionar ao final do arquivo
            with open(db_docs_path, 'a', encoding='utf-8') as f:
                f.write(new_section)
            
            console.print(f"[green]✅ Documentação de banco atualizada![/green]")

class AutoDocSystem:
    """Sistema principal de auto-documentação"""
    
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.monitor = ProjectMonitor(str(project_root))
        self.updater = DocumentationUpdater(str(project_root))
        self.observer = None
        self.running = False
    
    def start_monitoring(self):
        """Inicia o monitoramento do projeto"""
        console.print(Panel.fit(
            "[bold blue]🚀 Sistema de Auto-Documentação Iniciado[/bold blue]\n"
            "Monitorando mudanças no projeto...",
            title="Auto-Doc System"
        ))
        
        self.observer = Observer()
        self.observer.schedule(self.monitor, str(self.project_root), recursive=True)
        self.observer.start()
        self.running = True
        
        try:
            while self.running:
                if self.monitor.changes:
                    self._handle_changes()
                import time
                time.sleep(1)
        except KeyboardInterrupt:
            self.stop_monitoring()
    
    def stop_monitoring(self):
        """Para o monitoramento"""
        if self.observer:
            self.observer.stop()
            self.observer.join()
        self.running = False
        console.print("[yellow]Sistema de monitoramento parado.[/yellow]")
    
    def _handle_changes(self):
        """Processa mudanças detectadas"""
        changes = self.monitor.changes.copy()
        self.monitor.changes.clear()
        
        if not changes:
            return
        
        # Exibir resumo das mudanças
        self._display_changes_summary(changes)
        
        # Perguntar ao usuário
        action = self._ask_user_action()
        
        if action == 's':
            self._update_documentation(changes)
        elif action == 'm':
            self._show_detailed_changes(changes)
            # Perguntar novamente
            action = self._ask_user_action()
            if action == 's':
                self._update_documentation(changes)
    
    def _display_changes_summary(self, changes: List[Change]):
        """Exibe resumo das mudanças"""
        table = Table(title="🚨 Mudanças Detectadas")
        table.add_column("Tipo", style="cyan")
        table.add_column("Descrição", style="white")
        table.add_column("Arquivo", style="green")
        
        for change in changes:
            table.add_row(
                change.type.upper(),
                change.description,
                change.file_path
            )
        
        console.print(table)
    
    def _ask_user_action(self) -> str:
        """Pergunta ao usuário o que fazer"""
        return Prompt.ask(
            "\n[bold]Deseja atualizar a documentação?[/bold]",
            choices=["s", "n", "m"],
            default="m"
        )
    
    def _show_detailed_changes(self, changes: List[Change]):
        """Mostra detalhes das mudanças"""
        console.print("\n[bold]📋 Detalhes das Mudanças:[/bold]")
        
        for i, change in enumerate(changes, 1):
            console.print(f"\n[bold cyan]{i}. {change.description}[/bold cyan]")
            console.print(f"   Arquivo: {change.file_path}")
            console.print(f"   Timestamp: {change.timestamp.strftime('%H:%M:%S')}")
            
            if change.details:
                console.print("   Detalhes:")
                for key, value in change.details.items():
                    console.print(f"     - {key}: {value}")
    
    def _update_documentation(self, changes: List[Change]):
        """Atualiza a documentação"""
        console.print("\n[bold green]📝 Atualizando documentação...[/bold green]")
        
        # Atualizar CHANGELOG
        self.updater.update_changelog(changes)
        
        # Atualizar documentação de APIs
        self.updater.update_api_docs(changes)
        
        # Atualizar documentação de banco
        self.updater.update_database_docs(changes)
        
        console.print("[bold green]✅ Documentação atualizada com sucesso![/bold green]")

@click.command()
@click.option('--project-root', default='.', help='Diretório raiz do projeto')
@click.option('--watch', is_flag=True, help='Iniciar monitoramento contínuo')
def main(project_root: str, watch: bool):
    """Sistema de Auto-Documentação Inteligente"""
    
    # Verificar se é um repositório Git
    try:
        Repo(project_root)
    except InvalidGitRepositoryError:
        console.print("[red]❌ Este não é um repositório Git válido![/red]")
        return
    
    system = AutoDocSystem(project_root)
    
    if watch:
        system.start_monitoring()
    else:
        # Análise única
        console.print("[yellow]Executando análise única...[/yellow]")
        # Aqui você pode implementar análise única se necessário

if __name__ == '__main__':
    main()
