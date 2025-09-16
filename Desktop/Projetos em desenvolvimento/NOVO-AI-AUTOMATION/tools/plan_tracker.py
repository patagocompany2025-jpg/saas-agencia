#!/usr/bin/env python3
"""
Sistema de Acompanhamento Inteligente do Progresso - Dev1
Baseado no Plano Completo NO IA.pdf

Funcionalidades:
- Leitura e extração de seções Dev1 do PDF
- Acompanhamento de progresso diário
- Detecção de mudanças no plano
- Interface interativa
- Comandos CLI para diferentes modos de execução
"""

import os
import sys
import json
import hashlib
import argparse
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
import re

# Bibliotecas externas
try:
    import PyPDF2
    from rapidfuzz import fuzz
    import git
    from watchdog.observers import Observer
    from watchdog.events import FileSystemEventHandler
    from rich.console import Console
    from rich.panel import Panel
    from rich.table import Table
    from rich.prompt import Confirm, Prompt
    from rich.progress import Progress, SpinnerColumn, TextColumn
    from rich.syntax import Syntax
    from rich.markdown import Markdown
except ImportError as e:
    print(f"❌ Erro: Biblioteca não encontrada: {e}")
    print("📦 Execute: pip install PyPDF2 rapidfuzz GitPython watchdog rich")
    sys.exit(1)

# Configuração
CONFIG = {
    'pdf_path': 'Plano Completo NO IA.pdf',
    'docs_dir': 'docs',
    'progress_file': 'docs/.dev1_progress.json',
    'hash_file': 'docs/.plan_hash.txt',
    'status_file': 'docs/status.md',
    'dev1_sections': ['8.1', '9.1', '9.2', '9.3', '9.4', '9.5', '9.6', '9.7', '9.8', '9.9', '9.10']
}

console = Console()

class PlanTracker:
    """Sistema principal de acompanhamento do progresso"""
    
    def __init__(self, pdf_path: str = None, dry_run: bool = False, auto_approve: bool = False):
        self.pdf_path = pdf_path or CONFIG['pdf_path']
        self.dry_run = dry_run
        self.auto_approve = auto_approve
        self.progress_data = self._load_progress()
        self.plan_data = None
        self.current_hash = None
        
    def _load_progress(self) -> Dict[str, Any]:
        """Carrega dados de progresso do arquivo JSON"""
        progress_file = Path(CONFIG['progress_file'])
        if progress_file.exists():
            try:
                with open(progress_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                console.print(f"⚠️ Erro ao carregar progresso: {e}")
        
        return {
            'version': '1.0.0',
            'created_at': datetime.now().isoformat(),
            'last_updated': datetime.now().isoformat(),
            'dev1_sections': {},
            'completed_items': [],
            'current_step': None,
            'next_steps': [],
            'notes': []
        }
    
    def _save_progress(self):
        """Salva dados de progresso no arquivo JSON"""
        if self.dry_run:
            console.print("🔍 [DRY RUN] Dados de progresso seriam salvos")
            return
            
        progress_file = Path(CONFIG['progress_file'])
        progress_file.parent.mkdir(exist_ok=True)
        
        self.progress_data['last_updated'] = datetime.now().isoformat()
        
        try:
            with open(progress_file, 'w', encoding='utf-8') as f:
                json.dump(self.progress_data, f, indent=2, ensure_ascii=False)
            console.print("✅ Progresso salvo com sucesso")
        except Exception as e:
            console.print(f"❌ Erro ao salvar progresso: {e}")
    
    def _calculate_pdf_hash(self) -> str:
        """Calcula hash do arquivo PDF para detectar mudanças"""
        if not os.path.exists(self.pdf_path):
            return ""
        
        try:
            with open(self.pdf_path, 'rb') as f:
                content = f.read()
                return hashlib.sha256(content).hexdigest()
        except Exception as e:
            console.print(f"❌ Erro ao calcular hash do PDF: {e}")
            return ""
    
    def _load_plan_hash(self) -> str:
        """Carrega hash salvo do plano"""
        hash_file = Path(CONFIG['hash_file'])
        if hash_file.exists():
            try:
                return hash_file.read_text(encoding='utf-8').strip()
            except Exception as e:
                console.print(f"⚠️ Erro ao carregar hash: {e}")
        return ""
    
    def _save_plan_hash(self, hash_value: str):
        """Salva hash do plano atual"""
        if self.dry_run:
            console.print("🔍 [DRY RUN] Hash seria salvo")
            return
            
        hash_file = Path(CONFIG['hash_file'])
        hash_file.parent.mkdir(exist_ok=True)
        
        try:
            hash_file.write_text(hash_value, encoding='utf-8')
            console.print("✅ Hash do plano salvo")
        except Exception as e:
            console.print(f"❌ Erro ao salvar hash: {e}")
    
    def _extract_pdf_text(self) -> str:
        """Extrai texto do PDF"""
        if not os.path.exists(self.pdf_path):
            console.print(f"❌ Arquivo PDF não encontrado: {self.pdf_path}")
            return ""
        
        try:
            with open(self.pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                return text
        except Exception as e:
            console.print(f"❌ Erro ao extrair texto do PDF: {e}")
            return ""
    
    def _extract_dev1_sections(self, pdf_text: str) -> Dict[str, Any]:
        """Extrai seções específicas do Dev1 do texto do PDF"""
        dev1_data = {
            'sections': {},
            'objectives': [],
            'deliverables': [],
            'timeline': [],
            'extracted_at': datetime.now().isoformat()
        }
        
        # Padrões para encontrar seções Dev1
        section_patterns = [
            r'8\.1\s+([^9]+?)(?=9\.|$)',
            r'9\.(\d+)\s+([^9]+?)(?=9\.\d+|$)'
        ]
        
        for pattern in section_patterns:
            matches = re.finditer(pattern, pdf_text, re.DOTALL | re.IGNORECASE)
            for match in matches:
                if '8.1' in pattern:
                    section_num = '8.1'
                    content = match.group(1)
                else:
                    section_num = f"9.{match.group(1)}"
                    content = match.group(2)
                
                # Extrair objetivos, entregáveis e cronograma
                objectives = self._extract_objectives(content)
                deliverables = self._extract_deliverables(content)
                timeline = self._extract_timeline(content)
                
                dev1_data['sections'][section_num] = {
                    'content': content.strip(),
                    'objectives': objectives,
                    'deliverables': deliverables,
                    'timeline': timeline
                }
                
                dev1_data['objectives'].extend(objectives)
                dev1_data['deliverables'].extend(deliverables)
                dev1_data['timeline'].extend(timeline)
        
        return dev1_data
    
    def _extract_objectives(self, text: str) -> List[str]:
        """Extrai objetivos do texto"""
        objectives = []
        # Padrões comuns para objetivos
        patterns = [
            r'Objetivo[s]?[:\s]+([^\n]+)',
            r'Meta[s]?[:\s]+([^\n]+)',
            r'Finalidade[:\s]+([^\n]+)'
        ]
        
        for pattern in patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                objectives.append(match.group(1).strip())
        
        return objectives
    
    def _extract_deliverables(self, text: str) -> List[str]:
        """Extrai entregáveis do texto"""
        deliverables = []
        # Padrões comuns para entregáveis
        patterns = [
            r'Entregável[s]?[:\s]+([^\n]+)',
            r'Deliverable[s]?[:\s]+([^\n]+)',
            r'Produto[s]?[:\s]+([^\n]+)'
        ]
        
        for pattern in patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                deliverables.append(match.group(1).strip())
        
        return deliverables
    
    def _extract_timeline(self, text: str) -> List[str]:
        """Extrai cronograma do texto"""
        timeline = []
        # Padrões comuns para cronograma
        patterns = [
            r'Cronograma[:\s]+([^\n]+)',
            r'Timeline[:\s]+([^\n]+)',
            r'Prazo[s]?[:\s]+([^\n]+)',
            r'Data[s]?[:\s]+([^\n]+)'
        ]
        
        for pattern in patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                timeline.append(match.group(1).strip())
        
        return timeline
    
    def load_plan(self) -> bool:
        """Carrega e processa o plano do PDF"""
        console.print("📖 Carregando plano do PDF...")
        
        # Verificar se PDF existe
        if not os.path.exists(self.pdf_path):
            console.print(f"❌ Arquivo PDF não encontrado: {self.pdf_path}")
            console.print("💡 Coloque o arquivo 'Plano Completo NO IA.pdf' na raiz do projeto")
            return False
        
        # Calcular hash atual
        self.current_hash = self._calculate_pdf_hash()
        saved_hash = self._load_plan_hash()
        
        # Verificar se houve mudanças
        if self.current_hash and saved_hash and self.current_hash != saved_hash:
            console.print("🔄 Mudanças detectadas no plano!")
            if not self.auto_approve:
                if not Confirm.ask("Deseja atualizar o plano?"):
                    console.print("⏭️ Pulando atualização do plano")
                    return True
        
        # Extrair texto do PDF
        pdf_text = self._extract_pdf_text()
        if not pdf_text:
            return False
        
        # Extrair seções Dev1
        self.plan_data = self._extract_dev1_sections(pdf_text)
        
        # Salvar hash atual
        if self.current_hash:
            self._save_plan_hash(self.current_hash)
        
        console.print("✅ Plano carregado com sucesso")
        return True
    
    def show_status(self):
        """Mostra status atual do progresso"""
        console.print("\n" + "="*60)
        console.print("📊 STATUS ATUAL DO PROGRESSO - DEV1", style="bold blue")
        console.print("="*60)
        
        # Informações básicas
        last_updated = self.progress_data.get('last_updated', 'Nunca')
        console.print(f"📅 Última atualização: {last_updated}")
        
        # Seções do plano
        if self.plan_data:
            console.print(f"📋 Seções Dev1 encontradas: {len(self.plan_data['sections'])}")
            
            # Mostrar seções
            table = Table(title="Seções do Plano Dev1")
            table.add_column("Seção", style="cyan")
            table.add_column("Objetivos", style="green")
            table.add_column("Entregáveis", style="yellow")
            
            for section_id, section_data in self.plan_data['sections'].items():
                objectives_count = len(section_data.get('objectives', []))
                deliverables_count = len(section_data.get('deliverables', []))
                table.add_row(
                    section_id,
                    str(objectives_count),
                    str(deliverables_count)
                )
            
            console.print(table)
        
        # Progresso atual
        completed_count = len(self.progress_data.get('completed_items', []))
        console.print(f"✅ Itens concluídos: {completed_count}")
        
        # Próximo passo
        current_step = self.progress_data.get('current_step')
        if current_step:
            console.print(f"🎯 Próximo passo: {current_step}")
        
        # Notas
        notes = self.progress_data.get('notes', [])
        if notes:
            console.print("\n📝 Notas recentes:")
            for note in notes[-3:]:  # Últimas 3 notas
                console.print(f"  • {note}")
    
    def suggest_next_step(self) -> str:
        """Sugere o próximo passo baseado no progresso atual"""
        if not self.plan_data:
            return "Carregue o plano primeiro"
        
        completed = set(self.progress_data.get('completed_items', []))
        
        # Buscar próximo entregável não concluído
        for section_id, section_data in self.plan_data['sections'].items():
            for deliverable in section_data.get('deliverables', []):
                if deliverable not in completed:
                    return f"Trabalhar em: {deliverable} (Seção {section_id})"
        
        return "Parabéns! Todos os entregáveis foram concluídos! 🎉"
    
    def update_progress(self, item: str, status: str = "completed"):
        """Atualiza progresso de um item"""
        if status == "completed":
            if item not in self.progress_data['completed_items']:
                self.progress_data['completed_items'].append(item)
                console.print(f"✅ Item concluído: {item}")
        elif status == "in_progress":
            self.progress_data['current_step'] = item
            console.print(f"🔄 Trabalhando em: {item}")
        
        self._save_progress()
    
    def add_note(self, note: str):
        """Adiciona uma nota ao progresso"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
        self.progress_data['notes'].append(f"[{timestamp}] {note}")
        console.print(f"📝 Nota adicionada: {note}")
        self._save_progress()
    
    def reset_progress(self):
        """Reseta todo o progresso"""
        if not self.auto_approve:
            if not Confirm.ask("⚠️ Tem certeza que deseja resetar todo o progresso?"):
                console.print("❌ Operação cancelada")
                return
        
        self.progress_data = {
            'version': '1.0.0',
            'created_at': datetime.now().isoformat(),
            'last_updated': datetime.now().isoformat(),
            'dev1_sections': {},
            'completed_items': [],
            'current_step': None,
            'next_steps': [],
            'notes': []
        }
        
        self._save_progress()
        console.print("🔄 Progresso resetado com sucesso")
    
    def generate_status_report(self):
        """Gera relatório de status em Markdown"""
        if self.dry_run:
            console.print("🔍 [DRY RUN] Relatório seria gerado")
            return
        
        status_file = Path(CONFIG['status_file'])
        status_file.parent.mkdir(exist_ok=True)
        
        # Gerar conteúdo do relatório
        content = f"""# 📊 Status do Progresso - Dev1

**Última atualização:** {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

## 🎯 Próximo Passo
{self.suggest_next_step()}

## ✅ Itens Concluídos
{len(self.progress_data.get('completed_items', []))} itens concluídos

"""
        
        # Adicionar itens concluídos
        for item in self.progress_data.get('completed_items', []):
            content += f"- ✅ {item}\n"
        
        content += f"""
## 📝 Notas Recentes
"""
        
        # Adicionar notas recentes
        for note in self.progress_data.get('notes', [])[-5:]:
            content += f"- {note}\n"
        
        content += f"""
## 📋 Seções do Plano
"""
        
        # Adicionar seções do plano
        if self.plan_data:
            for section_id, section_data in self.plan_data['sections'].items():
                content += f"### Seção {section_id}\n"
                
                if section_data.get('objectives'):
                    content += "**Objetivos:**\n"
                    for obj in section_data['objectives']:
                        content += f"- {obj}\n"
                
                if section_data.get('deliverables'):
                    content += "**Entregáveis:**\n"
                    for deliv in section_data['deliverables']:
                        content += f"- {deliv}\n"
                
                content += "\n"
        
        # Salvar arquivo
        try:
            status_file.write_text(content, encoding='utf-8')
            console.print(f"✅ Relatório de status gerado: {status_file}")
        except Exception as e:
            console.print(f"❌ Erro ao gerar relatório: {e}")

def main():
    """Função principal"""
    parser = argparse.ArgumentParser(description="Sistema de Acompanhamento do Progresso - Dev1")
    parser.add_argument('--pdf', default='Plano Completo NO IA.pdf', help='Caminho para o arquivo PDF')
    parser.add_argument('--dry-run', action='store_true', help='Modo de simulação (não salva nada)')
    parser.add_argument('--yes', action='store_true', help='Auto-aprovar todas as operações')
    parser.add_argument('--reset', action='store_true', help='Resetar progresso salvo')
    
    args = parser.parse_args()
    
    # Criar instância do tracker
    tracker = PlanTracker(
        pdf_path=args.pdf,
        dry_run=args.dry_run,
        auto_approve=args.yes
    )
    
    console.print(Panel.fit(
        "🚀 Sistema de Acompanhamento do Progresso - Dev1\n"
        "Baseado no Plano Completo NO IA.pdf",
        title="Plan Tracker",
        border_style="blue"
    ))
    
    # Reset se solicitado
    if args.reset:
        tracker.reset_progress()
        return
    
    # Carregar plano
    if not tracker.load_plan():
        return
    
    # Mostrar status
    tracker.show_status()
    
    # Gerar relatório
    tracker.generate_status_report()
    
    # Sugerir próximo passo
    next_step = tracker.suggest_next_step()
    console.print(f"\n🎯 Próximo passo sugerido: {next_step}")
    
    # Modo interativo (se não for dry-run)
    if not args.dry_run and not args.yes:
        console.print("\n💡 Comandos disponíveis:")
        console.print("  • Adicionar item concluído: tracker.update_progress('item')")
        console.print("  • Adicionar nota: tracker.add_note('nota')")
        console.print("  • Ver status: tracker.show_status()")

if __name__ == "__main__":
    main()
