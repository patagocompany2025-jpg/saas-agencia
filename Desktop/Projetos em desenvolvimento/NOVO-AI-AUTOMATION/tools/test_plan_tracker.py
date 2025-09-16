#!/usr/bin/env python3
"""
Testes para o Sistema de Acompanhamento do Progresso
"""

import os
import sys
import json
import tempfile
from pathlib import Path
from unittest.mock import patch, MagicMock

# Adicionar o diretório tools ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from plan_tracker import PlanTracker
from plan_tracker_config import CONFIG, setup_directories

def test_plan_tracker_initialization():
    """Testa inicialização do PlanTracker"""
    print("🧪 Testando inicialização do PlanTracker...")
    
    tracker = PlanTracker(dry_run=True)
    
    assert tracker.dry_run == True
    assert tracker.auto_approve == False
    assert 'version' in tracker.progress_data
    assert 'completed_items' in tracker.progress_data
    
    print("✅ Inicialização OK")

def test_progress_loading():
    """Testa carregamento de progresso"""
    print("🧪 Testando carregamento de progresso...")
    
    tracker = PlanTracker(dry_run=True)
    
    # Verificar estrutura básica
    assert isinstance(tracker.progress_data, dict)
    assert 'version' in tracker.progress_data
    assert 'created_at' in tracker.progress_data
    assert 'last_updated' in tracker.progress_data
    assert 'completed_items' in tracker.progress_data
    assert isinstance(tracker.progress_data['completed_items'], list)
    
    print("✅ Carregamento de progresso OK")

def test_pdf_hash_calculation():
    """Testa cálculo de hash do PDF"""
    print("🧪 Testando cálculo de hash do PDF...")
    
    tracker = PlanTracker(dry_run=True)
    
    # Testar com arquivo inexistente
    hash_value = tracker._calculate_pdf_hash()
    assert hash_value == ""
    
    # Criar arquivo temporário para teste
    with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_file:
        temp_file.write(b"test content")
        temp_path = temp_file.name
    
    try:
        tracker.pdf_path = temp_path
        hash_value = tracker._calculate_pdf_hash()
        assert len(hash_value) == 64  # SHA256 hash length
        assert hash_value != ""
    finally:
        os.unlink(temp_path)
    
    print("✅ Cálculo de hash OK")

def test_section_extraction():
    """Testa extração de seções do texto"""
    print("🧪 Testando extração de seções...")
    
    tracker = PlanTracker(dry_run=True)
    
    # Testar apenas a estrutura de retorno
    dev1_data = tracker._extract_dev1_sections("")
    
    assert 'sections' in dev1_data
    assert 'objectives' in dev1_data
    assert 'deliverables' in dev1_data
    assert 'timeline' in dev1_data
    assert 'extracted_at' in dev1_data
    assert isinstance(dev1_data['sections'], dict)
    
    print("✅ Extração de seções OK")

def test_objective_extraction():
    """Testa extração de objetivos"""
    print("🧪 Testando extração de objetivos...")
    
    tracker = PlanTracker(dry_run=True)
    
    sample_text = """
    Objetivo: Criar sistema de automação
    Meta: Implementar funcionalidades
    Finalidade: Automatizar processos
    """
    
    objectives = tracker._extract_objectives(sample_text)
    
    assert len(objectives) >= 3
    assert any("automação" in obj.lower() for obj in objectives)
    assert any("funcionalidades" in obj.lower() for obj in objectives)
    assert any("processos" in obj.lower() for obj in objectives)
    
    print("✅ Extração de objetivos OK")

def test_deliverable_extraction():
    """Testa extração de entregáveis"""
    print("🧪 Testando extração de entregáveis...")
    
    tracker = PlanTracker(dry_run=True)
    
    sample_text = """
    Entregável: Sistema funcional
    Deliverable: API de autenticação
    Produto: Engine de processamento
    """
    
    deliverables = tracker._extract_deliverables(sample_text)
    
    assert len(deliverables) >= 3
    assert any("sistema" in deliv.lower() for deliv in deliverables)
    assert any("api" in deliv.lower() for deliv in deliverables)
    assert any("engine" in deliv.lower() for deliv in deliverables)
    
    print("✅ Extração de entregáveis OK")

def test_progress_update():
    """Testa atualização de progresso"""
    print("🧪 Testando atualização de progresso...")
    
    tracker = PlanTracker(dry_run=True)
    
    initial_count = len(tracker.progress_data['completed_items'])
    
    # Adicionar item concluído
    tracker.update_progress("Teste item", "completed")
    
    assert len(tracker.progress_data['completed_items']) == initial_count + 1
    assert "Teste item" in tracker.progress_data['completed_items']
    
    # Adicionar item em progresso
    tracker.update_progress("Item em progresso", "in_progress")
    assert tracker.progress_data['current_step'] == "Item em progresso"
    
    print("✅ Atualização de progresso OK")

def test_note_adding():
    """Testa adição de notas"""
    print("🧪 Testando adição de notas...")
    
    tracker = PlanTracker(dry_run=True)
    
    initial_count = len(tracker.progress_data['notes'])
    
    tracker.add_note("Nota de teste")
    
    assert len(tracker.progress_data['notes']) == initial_count + 1
    assert "Nota de teste" in tracker.progress_data['notes'][-1]
    
    print("✅ Adição de notas OK")

def test_next_step_suggestion():
    """Testa sugestão de próximo passo"""
    print("🧪 Testando sugestão de próximo passo...")
    
    tracker = PlanTracker(dry_run=True)
    
    # Sem plano carregado
    next_step = tracker.suggest_next_step()
    assert "Carregue o plano primeiro" in next_step
    
    # Com plano simulado
    tracker.plan_data = {
        'sections': {
            '9.1': {
                'deliverables': ['Entregável 1', 'Entregável 2']
            }
        }
    }
    
    next_step = tracker.suggest_next_step()
    assert "Entregável 1" in next_step
    
    print("✅ Sugestão de próximo passo OK")

def test_config_loading():
    """Testa carregamento de configurações"""
    print("🧪 Testando carregamento de configurações...")
    
    from plan_tracker_config import get_config, setup_directories
    
    # Testar configuração básica
    config = get_config()
    assert 'pdf_path' in config
    assert 'dev1_sections' in config
    assert 'extraction_patterns' in config
    
    # Testar configuração específica
    pdf_path = get_config('pdf_path')
    assert pdf_path == 'Plano Completo NO IA.pdf'
    
    # Testar setup de diretórios
    setup_directories()
    assert os.path.exists(CONFIG['docs_dir'])
    
    print("✅ Carregamento de configurações OK")

def run_all_tests():
    """Executa todos os testes"""
    print("🚀 Iniciando testes do Sistema de Acompanhamento do Progresso")
    print("="*60)
    
    tests = [
        test_plan_tracker_initialization,
        test_progress_loading,
        test_pdf_hash_calculation,
        test_section_extraction,
        test_objective_extraction,
        test_deliverable_extraction,
        test_progress_update,
        test_note_adding,
        test_next_step_suggestion,
        test_config_loading
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            test()
            passed += 1
        except Exception as e:
            print(f"❌ {test.__name__} FALHOU: {e}")
            failed += 1
    
    print("\n" + "="*60)
    print(f"📊 Resultado dos Testes:")
    print(f"✅ Passou: {passed}")
    print(f"❌ Falhou: {failed}")
    print(f"📈 Total: {passed + failed}")
    
    if failed == 0:
        print("🎉 Todos os testes passaram!")
        return True
    else:
        print("⚠️ Alguns testes falharam!")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
