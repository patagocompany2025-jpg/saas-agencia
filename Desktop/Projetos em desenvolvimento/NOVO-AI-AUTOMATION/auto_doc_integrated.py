#!/usr/bin/env python3
"""
Sistema Integrado de Auto-Documentação Inteligente
Versão completa com todos os módulos integrados
"""

import os
import sys
import json
import time
import signal
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Set, Optional, Any
from dataclasses import dataclass, asdict

# Importar módulos do sistema
from auto_doc_system import ProjectMonitor, DocumentationUpdater, Change
from advanced_detectors import AdvancedChangeAnalyzer, APIDetection, DatabaseDetection, DependencyDetection
from interactive_prompts import InteractivePrompts, ChangeSummary

import click
from rich.console import Console
from rich.panel import Panel
from rich.live import Live
from watchdog.observers import Observer
from git import Repo, InvalidGitRepositoryError

console = Console()

class IntegratedAutoDocSystem:
    """Sistema integrado de auto-documentação"""
    
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.monitor = ProjectMonitor(str(project_root))
        self.updater = DocumentationUpdater(str(project_root))
        self.analyzer = AdvancedChangeAnalyzer()
        self.prompts = InteractivePrompts()
        self.observer = None
        self.running = False
        self.changes_buffer = []
        
        # Configurar handlers de sinal
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _signal_handler(self, signum, frame):
        """Handler para sinais de interrupção"""
        console.print("\n[yellow]🛑 Parando sistema de monitoramento...[/yellow]")
        self.stop_monitoring()
        sys.exit(0)
    
    def start_monitoring(self):
        """Inicia o monitoramento contínuo"""
        self.prompts.show_welcome_screen()
        
        console.print(Panel.fit(
            "[bold blue]🚀 Iniciando monitoramento contínuo...[/bold blue]\n"
            f"Projeto: {self.project_root}\n"
            "Pressione Ctrl+C para parar",
            title="Auto-Doc System",
            border_style="blue"
        ))
        
        self.observer = Observer()
        self.observer.schedule(self.monitor, str(self.project_root), recursive=True)
        self.observer.start()
        self.running = True
        
        try:
            while self.running:
                if self.monitor.changes:
                    self._process_changes()
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
    
    def _process_changes(self):
        """Processa mudanças detectadas"""
        changes = self.monitor.changes.copy()
        self.monitor.changes.clear()
        
        if not changes:
            return
        
        # Adicionar ao buffer
        self.changes_buffer.extend(changes)
        
        # Processar mudanças com análise avançada
        enhanced_changes = self._enhance_changes(changes)
        
        # Exibir resumo
        summary = self.prompts.display_changes_summary(enhanced_changes)
        
        # Perguntar ao usuário
        action = self.prompts.ask_user_action(summary)
        
        if action == 's':
            self._update_documentation(enhanced_changes)
        elif action == 'm':
            self.prompts.show_detailed_changes(enhanced_changes)
            # Perguntar novamente
            action = self.prompts.ask_user_action(summary)
            if action == 's':
                self._update_documentation(enhanced_changes)
        elif action == 'r':
            selected_changes = self.prompts.review_specific_changes(enhanced_changes)
            if selected_changes:
                self._update_documentation(selected_changes)
        elif action == 'q':
            self.stop_monitoring()
    
    def _enhance_changes(self, changes: List[Change]) -> List[Any]:
        """Melhora as mudanças com análise avançada"""
        enhanced_changes = []
        
        for change in changes:
            # Análise avançada do arquivo
            file_path = self.project_root / change.file_path
            
            if file_path.exists():
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Análise detalhada
                    analysis = self.analyzer.analyze_file_changes(str(file_path), None, content)
                    
                    # Converter detecções em mudanças
                    for api in analysis.get('apis', []):
                        enhanced_change = Change(
                            type='api',
                            description=f'API: {api.method} {api.endpoint}',
                            file_path=change.file_path,
                            timestamp=change.timestamp,
                            details={
                                'method': api.method,
                                'endpoint': api.endpoint,
                                'line_number': api.line_number,
                                'description': api.description,
                                'parameters': api.parameters
                            }
                        )
                        enhanced_changes.append(enhanced_change)
                    
                    for db in analysis.get('database', []):
                        enhanced_change = Change(
                            type='database',
                            description=f'Banco: {db.operation} {db.table_name}',
                            file_path=change.file_path,
                            timestamp=change.timestamp,
                            details={
                                'operation': db.operation,
                                'table_name': db.table_name,
                                'line_number': db.line_number,
                                'columns': db.columns
                            }
                        )
                        enhanced_changes.append(enhanced_change)
                    
                    for dep in analysis.get('dependencies', []):
                        enhanced_change = Change(
                            type='dependency',
                            description=f'Dependência: {dep.package_name}@{dep.version}',
                            file_path=change.file_path,
                            timestamp=change.timestamp,
                            details={
                                'package_name': dep.package_name,
                                'version': dep.version,
                                'category': dep.category,
                                'change_type': dep.change_type
                            }
                        )
                        enhanced_changes.append(enhanced_change)
                
                except Exception as e:
                    console.print(f"[yellow]⚠️ Erro ao analisar {file_path}: {e}[/yellow]")
                    enhanced_changes.append(change)
            else:
                enhanced_changes.append(change)
        
        return enhanced_changes
    
    def _update_documentation(self, changes: List[Change]):
        """Atualiza a documentação"""
        console.print("\n[bold green]📝 Iniciando atualização da documentação...[/bold green]")
        
        files_updated = []
        
        # Atualizar CHANGELOG
        self.prompts.show_update_progress(1, 3, "Atualizando CHANGELOG...")
        self.updater.update_changelog(changes)
        files_updated.append("docs/CHANGELOG.md")
        
        # Atualizar documentação de APIs
        self.prompts.show_update_progress(2, 3, "Atualizando APIs...")
        self.updater.update_api_docs(changes)
        files_updated.append("docs/apis.md")
        
        # Atualizar documentação de banco
        self.prompts.show_update_progress(3, 3, "Atualizando banco de dados...")
        self.updater.update_database_docs(changes)
        files_updated.append("docs/banco-dados.md")
        
        # Mostrar conclusão
        self.prompts.show_update_complete(len(changes), files_updated)
        
        # Limpar buffer
        self.changes_buffer.clear()
    
    def run_single_analysis(self):
        """Executa análise única do projeto"""
        console.print("[bold blue]🔍 Executando análise única do projeto...[/bold blue]")
        
        # Analisar todos os arquivos do projeto
        all_changes = []
        
        for root, dirs, files in os.walk(self.project_root):
            # Ignorar diretórios desnecessários
            dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '__pycache__', '.env']]
            
            for file in files:
                if file.endswith(('.js', '.ts', '.json', '.py', '.md', '.sql')):
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path, self.project_root)
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                        
                        # Análise avançada
                        analysis = self.analyzer.analyze_file_changes(file_path, None, content)
                        
                        # Converter em mudanças
                        for api in analysis.get('apis', []):
                            change = Change(
                                type='api',
                                description=f'API: {api.method} {api.endpoint}',
                                file_path=relative_path,
                                timestamp=datetime.now(),
                                details={
                                    'method': api.method,
                                    'endpoint': api.endpoint,
                                    'line_number': api.line_number
                                }
                            )
                            all_changes.append(change)
                        
                        for db in analysis.get('database', []):
                            change = Change(
                                type='database',
                                description=f'Banco: {db.operation} {db.table_name}',
                                file_path=relative_path,
                                timestamp=datetime.now(),
                                details={
                                    'operation': db.operation,
                                    'table_name': db.table_name,
                                    'line_number': db.line_number
                                }
                            )
                            all_changes.append(change)
                        
                        for dep in analysis.get('dependencies', []):
                            change = Change(
                                type='dependency',
                                description=f'Dependência: {dep.package_name}@{dep.version}',
                                file_path=relative_path,
                                timestamp=datetime.now(),
                                details={
                                    'package_name': dep.package_name,
                                    'version': dep.version,
                                    'category': dep.category
                                }
                            )
                            all_changes.append(change)
                    
                    except Exception as e:
                        console.print(f"[yellow]⚠️ Erro ao analisar {file_path}: {e}[/yellow]")
        
        if all_changes:
            # Exibir resumo
            summary = self.prompts.display_changes_summary(all_changes)
            
            # Perguntar se quer atualizar
            action = self.prompts.ask_user_action(summary)
            
            if action == 's':
                self._update_documentation(all_changes)
            elif action == 'm':
                self.prompts.show_detailed_changes(all_changes)
        else:
            console.print("[yellow]ℹ️ Nenhuma mudança detectada no projeto.[/yellow]")

@click.command()
@click.option('--project-root', default='.', help='Diretório raiz do projeto')
@click.option('--watch', is_flag=True, help='Iniciar monitoramento contínuo')
@click.option('--analyze', is_flag=True, help='Executar análise única')
@click.option('--setup', is_flag=True, help='Configurar sistema')
def main(project_root: str, watch: bool, analyze: bool, setup: bool):
    """Sistema de Auto-Documentação Inteligente"""
    
    # Verificar se é um repositório Git
    try:
        Repo(project_root)
    except InvalidGitRepositoryError:
        console.print("[red]❌ Este não é um repositório Git válido![/red]")
        console.print("[yellow]💡 Execute 'git init' para inicializar um repositório Git.[/yellow]")
        return
    
    # Verificar se Python está instalado
    if sys.version_info < (3, 8):
        console.print("[red]❌ Python 3.8+ é necessário![/red]")
        console.print(f"Versão atual: {sys.version}")
        return
    
    system = IntegratedAutoDocSystem(project_root)
    
    if setup:
        # Executar configuração
        console.print("[blue]🔧 Executando configuração...[/blue]")
        try:
            import subprocess
            subprocess.run([sys.executable, "setup_auto_doc.py"], check=True)
        except subprocess.CalledProcessError:
            console.print("[red]❌ Erro na configuração![/red]")
        return
    
    if watch:
        system.start_monitoring()
    elif analyze:
        system.run_single_analysis()
    else:
        # Mostrar ajuda
        console.print(Panel.fit(
            "[bold blue]🤖 Sistema de Auto-Documentação Inteligente[/bold blue]\n\n"
            "[bold]Comandos disponíveis:[/bold]\n"
            "• [cyan]--watch[/cyan] - Monitoramento contínuo\n"
            "• [cyan]--analyze[/cyan] - Análise única\n"
            "• [cyan]--setup[/cyan] - Configurar sistema\n\n"
            "[bold]Exemplos:[/bold]\n"
            "• [green]python auto_doc_integrated.py --watch[/green]\n"
            "• [green]python auto_doc_integrated.py --analyze[/green]\n"
            "• [green]python auto_doc_integrated.py --setup[/green]",
            title="Ajuda",
            border_style="blue"
        ))

if __name__ == '__main__':
    main()
