"""
Configurações do Sistema de Acompanhamento do Progresso
"""

import os
from pathlib import Path

# Configurações principais
CONFIG = {
    # Arquivos e diretórios
    'pdf_path': 'Plano Completo NO IA.pdf',
    'docs_dir': 'docs',
    'progress_file': 'docs/.dev1_progress.json',
    'hash_file': 'docs/.plan_hash.txt',
    'status_file': 'docs/status.md',
    'backup_dir': 'docs/backups',
    
    # Seções específicas do Dev1 no plano
    'dev1_sections': [
        '8.1',  # Seção principal Dev1
        '9.1', '9.2', '9.3', '9.4', '9.5',  # Entregáveis 1-5
        '9.6', '9.7', '9.8', '9.9', '9.10'  # Entregáveis 6-10
    ],
    
    # Padrões de extração de texto
    'extraction_patterns': {
        'objectives': [
            r'Objetivo[s]?[:\s]+([^\n]+)',
            r'Meta[s]?[:\s]+([^\n]+)',
            r'Finalidade[:\s]+([^\n]+)',
            r'Propósito[:\s]+([^\n]+)'
        ],
        'deliverables': [
            r'Entregável[s]?[:\s]+([^\n]+)',
            r'Deliverable[s]?[:\s]+([^\n]+)',
            r'Produto[s]?[:\s]+([^\n]+)',
            r'Resultado[s]?[:\s]+([^\n]+)'
        ],
        'timeline': [
            r'Cronograma[:\s]+([^\n]+)',
            r'Timeline[:\s]+([^\n]+)',
            r'Prazo[s]?[:\s]+([^\n]+)',
            r'Data[s]?[:\s]+([^\n]+)',
            r'Deadline[s]?[:\s]+([^\n]+)'
        ],
        'sections': [
            r'8\.1\s+([^9]+?)(?=9\.|$)',
            r'9\.(\d+)\s+([^9]+?)(?=9\.\d+|$)'
        ]
    },
    
    # Configurações de interface
    'ui': {
        'max_notes_display': 5,
        'max_sections_display': 10,
        'progress_bar_width': 50,
        'table_max_width': 80
    },
    
    # Configurações de backup
    'backup': {
        'max_backups': 10,
        'backup_on_change': True,
        'backup_interval_hours': 24
    },
    
    # Configurações de notificação
    'notifications': {
        'show_progress_summary': True,
        'show_next_steps': True,
        'show_notes': True,
        'auto_save': True
    }
}

def get_config(key: str = None, default=None):
    """Obtém valor de configuração"""
    if key is None:
        return CONFIG
    
    keys = key.split('.')
    value = CONFIG
    
    try:
        for k in keys:
            value = value[k]
        return value
    except (KeyError, TypeError):
        return default

def setup_directories():
    """Cria diretórios necessários"""
    directories = [
        CONFIG['docs_dir'],
        CONFIG['backup_dir']
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)

def get_absolute_path(relative_path: str) -> str:
    """Converte caminho relativo para absoluto"""
    return os.path.abspath(relative_path)

def validate_pdf_path(pdf_path: str) -> bool:
    """Valida se o arquivo PDF existe e é válido"""
    if not os.path.exists(pdf_path):
        return False
    
    if not pdf_path.lower().endswith('.pdf'):
        return False
    
    return True

def get_backup_filename(original_filename: str) -> str:
    """Gera nome de arquivo para backup"""
    from datetime import datetime
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    name, ext = os.path.splitext(original_filename)
    return f"{name}_backup_{timestamp}{ext}"
