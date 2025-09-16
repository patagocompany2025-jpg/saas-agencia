#!/usr/bin/env python3
"""
Sistema de Prompts Interativos para Auto-Documentação
Interface amigável para interação com o usuário
"""

import os
import sys
from typing import List, Dict, Optional, Any
from dataclasses import dataclass
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.prompt import Prompt, Confirm, IntPrompt
from rich.syntax import Syntax
from rich.text import Text
from rich.layout import Layout
from rich.live import Live
from rich.align import Align
from rich import box

console = Console()

@dataclass
class ChangeSummary:
    """Resumo das mudanças detectadas"""
    total_changes: int
    api_changes: int
    database_changes: int
    dependency_changes: int
    file_changes: int
    critical_changes: int

class InteractivePrompts:
    """Sistema de prompts interativos"""
    
    def __init__(self):
        self.console = Console()
        self.changes_history = []
    
    def show_welcome_screen(self):
        """Exibe tela de boas-vindas"""
        welcome_text = """
[bold blue]🤖 Sistema de Auto-Documentação Inteligente[/bold blue]

[bold]Funcionalidades:[/bold]
• 🔍 Monitoramento automático de mudanças
• 📝 Atualização inteligente de documentação
• 🔌 Detecção de APIs e endpoints
• 🗄️ Monitoramento de banco de dados
• 📦 Controle de dependências
• 📊 Relatórios detalhados

[bold]Comandos disponíveis:[/bold]
• [cyan]s[/cyan] - Atualizar documentação
• [cyan]n[/cyan] - Não atualizar
• [cyan]m[/cyan] - Mostrar detalhes
• [cyan]r[/cyan] - Revisar mudanças
• [cyan]q[/cyan] - Sair
        """
        
        console.print(Panel.fit(
            welcome_text,
            title="🚀 Auto-Doc System",
            border_style="blue"
        ))
    
    def display_changes_summary(self, changes: List[Any]) -> ChangeSummary:
        """Exibe resumo das mudanças"""
        summary = ChangeSummary(
            total_changes=len(changes),
            api_changes=len([c for c in changes if getattr(c, 'type', '') == 'api']),
            database_changes=len([c for c in changes if getattr(c, 'type', '') == 'database']),
            dependency_changes=len([c for c in changes if getattr(c, 'type', '') == 'dependency']),
            file_changes=len([c for c in changes if getattr(c, 'type', '') == 'file']),
            critical_changes=len([c for c in changes if getattr(c, 'type', '') in ['api', 'database']])
        )
        
        # Criar tabela de resumo
        table = Table(title="📊 Resumo das Mudanças Detectadas", box=box.ROUNDED)
        table.add_column("Tipo", style="cyan", no_wrap=True)
        table.add_column("Quantidade", style="magenta", justify="center")
        table.add_column("Status", style="green")
        
        table.add_row("🔌 APIs", str(summary.api_changes), "✅" if summary.api_changes > 0 else "➖")
        table.add_row("🗄️ Banco de Dados", str(summary.database_changes), "✅" if summary.database_changes > 0 else "➖")
        table.add_row("📦 Dependências", str(summary.dependency_changes), "✅" if summary.dependency_changes > 0 else "➖")
        table.add_row("📁 Arquivos", str(summary.file_changes), "✅" if summary.file_changes > 0 else "➖")
        table.add_row("", "", "")
        table.add_row("📈 Total", str(summary.total_changes), "🔍")
        table.add_row("⚠️ Críticas", str(summary.critical_changes), "🚨" if summary.critical_changes > 0 else "✅")
        
        console.print(table)
        
        # Exibir alertas se houver mudanças críticas
        if summary.critical_changes > 0:
            console.print(Panel.fit(
                f"[bold red]⚠️ {summary.critical_changes} mudanças críticas detectadas![/bold red]\n"
                "Recomendamos revisar antes de atualizar a documentação.",
                title="Alerta",
                border_style="red"
            ))
        
        return summary
    
    def ask_user_action(self, summary: ChangeSummary) -> str:
        """Pergunta ao usuário qual ação tomar"""
        
        # Personalizar pergunta baseada no tipo de mudanças
        if summary.critical_changes > 0:
            question = f"[bold yellow]⚠️ {summary.critical_changes} mudanças críticas detectadas![/bold yellow]\nDeseja atualizar a documentação?"
        elif summary.total_changes > 10:
            question = f"[bold blue]📊 {summary.total_changes} mudanças detectadas![/bold blue]\nDeseja atualizar a documentação?"
        else:
            question = f"[bold green]✅ {summary.total_changes} mudanças detectadas![/bold green]\nDeseja atualizar a documentação?"
        
        console.print(f"\n{question}")
        
        # Mostrar opções
        options_table = Table(show_header=False, box=box.SIMPLE)
        options_table.add_column("Opção", style="cyan", width=3)
        options_table.add_column("Ação", style="white")
        
        options_table.add_row("[bold]s[/bold]", "Sim - Atualizar documentação")
        options_table.add_row("[bold]n[/bold]", "Não - Pular atualização")
        options_table.add_row("[bold]m[/bold]", "Mostrar detalhes das mudanças")
        options_table.add_row("[bold]r[/bold]", "Revisar mudanças específicas")
        options_table.add_row("[bold]q[/bold]", "Sair do sistema")
        
        console.print(options_table)
        
        return Prompt.ask(
            "\n[bold]Escolha uma opção[/bold]",
            choices=["s", "n", "m", "r", "q"],
            default="m"
        )
    
    def show_detailed_changes(self, changes: List[Any]):
        """Mostra detalhes das mudanças"""
        console.print("\n[bold]📋 Detalhes das Mudanças:[/bold]")
        
        # Agrupar por tipo
        changes_by_type = {}
        for change in changes:
            change_type = getattr(change, 'type', 'unknown')
            if change_type not in changes_by_type:
                changes_by_type[change_type] = []
            changes_by_type[change_type].append(change)
        
        # Mostrar por categoria
        for change_type, type_changes in changes_by_type.items():
            if change_type == 'api':
                self._show_api_changes(type_changes)
            elif change_type == 'database':
                self._show_database_changes(type_changes)
            elif change_type == 'dependency':
                self._show_dependency_changes(type_changes)
            else:
                self._show_file_changes(type_changes)
    
    def _show_api_changes(self, changes: List[Any]):
        """Mostra mudanças em APIs"""
        if not changes:
            return
        
        console.print("\n[bold cyan]🔌 Mudanças em APIs:[/bold cyan]")
        
        table = Table(box=box.SIMPLE)
        table.add_column("Método", style="green", width=8)
        table.add_column("Endpoint", style="blue")
        table.add_column("Arquivo", style="yellow")
        table.add_column("Linha", style="magenta", width=6)
        
        for change in changes:
            method = getattr(change, 'method', 'UNKNOWN')
            endpoint = getattr(change, 'endpoint', 'Unknown')
            file_path = getattr(change, 'file_path', 'Unknown')
            line_number = getattr(change, 'line_number', 0)
            
            table.add_row(method, endpoint, file_path, str(line_number))
        
        console.print(table)
    
    def _show_database_changes(self, changes: List[Any]):
        """Mostra mudanças no banco de dados"""
        if not changes:
            return
        
        console.print("\n[bold cyan]🗄️ Mudanças no Banco de Dados:[/bold cyan]")
        
        table = Table(box=box.SIMPLE)
        table.add_column("Operação", style="red", width=10)
        table.add_column("Tabela", style="blue")
        table.add_column("Arquivo", style="yellow")
        table.add_column("Linha", style="magenta", width=6)
        
        for change in changes:
            operation = getattr(change, 'operation', 'UNKNOWN')
            table_name = getattr(change, 'table_name', 'Unknown')
            file_path = getattr(change, 'file_path', 'Unknown')
            line_number = getattr(change, 'line_number', 0)
            
            table.add_row(operation, table_name, file_path, str(line_number))
        
        console.print(table)
    
    def _show_dependency_changes(self, changes: List[Any]):
        """Mostra mudanças em dependências"""
        if not changes:
            return
        
        console.print("\n[bold cyan]📦 Mudanças em Dependências:[/bold cyan]")
        
        table = Table(box=box.SIMPLE)
        table.add_column("Pacote", style="blue")
        table.add_column("Versão", style="green")
        table.add_column("Categoria", style="yellow", width=12)
        table.add_column("Arquivo", style="magenta")
        
        for change in changes:
            package = getattr(change, 'package_name', 'Unknown')
            version = getattr(change, 'version', 'Unknown')
            category = getattr(change, 'category', 'Unknown')
            file_path = getattr(change, 'file_path', 'Unknown')
            
            table.add_row(package, version, category, file_path)
        
        console.print(table)
    
    def _show_file_changes(self, changes: List[Any]):
        """Mostra mudanças em arquivos"""
        if not changes:
            return
        
        console.print("\n[bold cyan]📁 Mudanças em Arquivos:[/bold cyan]")
        
        for i, change in enumerate(changes, 1):
            description = getattr(change, 'description', 'Mudança detectada')
            file_path = getattr(change, 'file_path', 'Unknown')
            timestamp = getattr(change, 'timestamp', None)
            
            console.print(f"[bold]{i}.[/bold] {description}")
            console.print(f"    [dim]Arquivo:[/dim] {file_path}")
            if timestamp:
                console.print(f"    [dim]Hora:[/dim] {timestamp.strftime('%H:%M:%S')}")
            console.print()
    
    def review_specific_changes(self, changes: List[Any]) -> List[Any]:
        """Permite revisar mudanças específicas"""
        console.print("\n[bold]🔍 Revisão de Mudanças Específicas:[/bold]")
        
        selected_changes = []
        
        for i, change in enumerate(changes, 1):
            description = getattr(change, 'description', 'Mudança detectada')
            change_type = getattr(change, 'type', 'unknown')
            
            console.print(f"\n[bold]{i}.[/bold] [{change_type.upper()}] {description}")
            
            # Mostrar detalhes específicos
            if hasattr(change, 'details') and change.details:
                console.print("    [dim]Detalhes:[/dim]")
                for key, value in change.details.items():
                    console.print(f"      - {key}: {value}")
            
            # Perguntar se deve incluir
            include = Confirm.ask("    Incluir esta mudança?", default=True)
            if include:
                selected_changes.append(change)
        
        console.print(f"\n[bold green]✅ {len(selected_changes)} mudanças selecionadas para atualização.[/bold green]")
        return selected_changes
    
    def show_update_progress(self, current: int, total: int, operation: str):
        """Mostra progresso da atualização"""
        percentage = (current / total) * 100 if total > 0 else 0
        
        progress_text = f"[bold]{operation}[/bold]\n"
        progress_text += f"Progresso: {current}/{total} ({percentage:.1f}%)"
        
        console.print(Panel.fit(
            progress_text,
            title="📝 Atualizando Documentação",
            border_style="green"
        ))
    
    def show_update_complete(self, changes_count: int, files_updated: List[str]):
        """Mostra conclusão da atualização"""
        success_text = f"[bold green]✅ Documentação atualizada com sucesso![/bold green]\n\n"
        success_text += f"[bold]Resumo:[/bold]\n"
        success_text += f"• {changes_count} mudanças processadas\n"
        success_text += f"• {len(files_updated)} arquivos atualizados\n\n"
        
        if files_updated:
            success_text += f"[bold]Arquivos atualizados:[/bold]\n"
            for file in files_updated:
                success_text += f"• {file}\n"
        
        console.print(Panel.fit(
            success_text,
            title="🎉 Atualização Concluída",
            border_style="green"
        ))
    
    def ask_confirmation(self, message: str, default: bool = True) -> bool:
        """Pergunta de confirmação simples"""
        return Confirm.ask(message, default=default)
    
    def show_error(self, error_message: str):
        """Mostra mensagem de erro"""
        console.print(Panel.fit(
            f"[bold red]❌ Erro:[/bold red] {error_message}",
            title="Erro",
            border_style="red"
        ))
    
    def show_info(self, info_message: str):
        """Mostra mensagem informativa"""
        console.print(Panel.fit(
            f"[bold blue]ℹ️ {info_message}[/bold blue]",
            title="Informação",
            border_style="blue"
        ))
    
    def show_success(self, success_message: str):
        """Mostra mensagem de sucesso"""
        console.print(Panel.fit(
            f"[bold green]✅ {success_message}[/bold green]",
            title="Sucesso",
            border_style="green"
        ))
    
    def create_live_dashboard(self, changes: List[Any]):
        """Cria dashboard em tempo real"""
        layout = Layout()
        
        layout.split_column(
            Layout(name="header", size=3),
            Layout(name="main"),
            Layout(name="footer", size=3)
        )
        
        layout["main"].split_row(
            Layout(name="left"),
            Layout(name="right")
        )
        
        # Header
        layout["header"].update(
            Panel.fit(
                "[bold blue]🤖 Sistema de Auto-Documentação - Dashboard[/bold blue]",
                border_style="blue"
            )
        )
        
        # Left panel - Changes summary
        changes_text = f"[bold]Mudanças Detectadas:[/bold] {len(changes)}\n"
        changes_text += f"• APIs: {len([c for c in changes if getattr(c, 'type', '') == 'api'])}\n"
        changes_text += f"• Banco: {len([c for c in changes if getattr(c, 'type', '') == 'database'])}\n"
        changes_text += f"• Dependências: {len([c for c in changes if getattr(c, 'type', '') == 'dependency'])}\n"
        changes_text += f"• Arquivos: {len([c for c in changes if getattr(c, 'type', '') == 'file'])}"
        
        layout["left"].update(
            Panel.fit(
                changes_text,
                title="📊 Resumo",
                border_style="green"
            )
        )
        
        # Right panel - Recent changes
        recent_changes = changes[-5:] if len(changes) > 5 else changes
        recent_text = ""
        for change in recent_changes:
            description = getattr(change, 'description', 'Mudança detectada')
            change_type = getattr(change, 'type', 'unknown')
            recent_text += f"• [{change_type}] {description}\n"
        
        layout["right"].update(
            Panel.fit(
                recent_text or "Nenhuma mudança recente",
                title="🕒 Recentes",
                border_style="yellow"
            )
        )
        
        # Footer
        layout["footer"].update(
            Panel.fit(
                "[bold]Comandos:[/bold] s=atualizar | n=pular | m=detalhes | r=revisar | q=sair",
                border_style="blue"
            )
        )
        
        return layout
