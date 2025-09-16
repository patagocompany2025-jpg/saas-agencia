#!/usr/bin/env python3
"""
Script de teste para o Sistema de Auto-Documentação
"""

import os
import sys
import tempfile
import shutil
from pathlib import Path
from rich.console import Console
from rich.panel import Panel

console = Console()

def create_test_project():
    """Cria um projeto de teste para validar o sistema"""
    test_dir = Path("test_project")
    test_dir.mkdir(exist_ok=True)
    
    # Criar estrutura de teste
    (test_dir / "src").mkdir(exist_ok=True)
    (test_dir / "docs").mkdir(exist_ok=True)
    
    # Arquivo de API de teste
    api_content = '''
const express = require('express');
const app = express();

// Endpoint de teste
app.get('/api/test', (req, res) => {
    res.json({ message: 'Test endpoint' });
});

// Novo endpoint
app.post('/api/users', (req, res) => {
    res.json({ message: 'Create user' });
});

app.listen(3000);
'''
    
    with open(test_dir / "src" / "server.js", 'w') as f:
        f.write(api_content)
    
    # Arquivo de banco de dados de teste
    db_content = '''
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100)
);

ALTER TABLE users ADD COLUMN created_at TIMESTAMP;
'''
    
    with open(test_dir / "src" / "schema.sql", 'w') as f:
        f.write(db_content)
    
    # Package.json de teste
    package_json = {
        "name": "test-project",
        "version": "1.0.0",
        "dependencies": {
            "express": "^4.18.0",
            "axios": "^1.0.0"
        },
        "devDependencies": {
            "nodemon": "^2.0.0"
        }
    }
    
    import json
    with open(test_dir / "package.json", 'w') as f:
        json.dump(package_json, f, indent=2)
    
    # Inicializar Git
    import subprocess
    subprocess.run(['git', 'init'], cwd=test_dir, capture_output=True)
    subprocess.run(['git', 'add', '.'], cwd=test_dir, capture_output=True)
    subprocess.run(['git', 'commit', '-m', 'Initial commit'], cwd=test_dir, capture_output=True)
    
    return test_dir

def test_api_detection():
    """Testa detecção de APIs"""
    console.print("[blue]🔍 Testando detecção de APIs...[/blue]")
    
    from advanced_detectors import APIDetector
    
    detector = APIDetector()
    
    # Conteúdo de teste
    test_content = '''
app.get('/api/users', (req, res) => {
    res.json({ users: [] });
});

app.post('/api/users', (req, res) => {
    res.json({ message: 'User created' });
});

router.put('/api/users/:id', (req, res) => {
    res.json({ message: 'User updated' });
});
'''
    
    detections = detector.detect_apis("test.js", test_content)
    
    console.print(f"[green]✅ {len(detections)} APIs detectadas:[/green]")
    for detection in detections:
        console.print(f"  • {detection.method} {detection.endpoint}")
    
    return len(detections) > 0

def test_database_detection():
    """Testa detecção de banco de dados"""
    console.print("[blue]🔍 Testando detecção de banco de dados...[/blue]")
    
    from advanced_detectors import DatabaseDetector
    
    detector = DatabaseDetector()
    
    # Conteúdo de teste
    test_content = '''
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100)
);

ALTER TABLE users ADD COLUMN email VARCHAR(100);

DROP TABLE old_table;
'''
    
    detections = detector.detect_database_changes("test.sql", test_content)
    
    console.print(f"[green]✅ {len(detections)} mudanças de banco detectadas:[/green]")
    for detection in detections:
        console.print(f"  • {detection.operation} {detection.table_name}")
    
    return len(detections) > 0

def test_dependency_detection():
    """Testa detecção de dependências"""
    console.print("[blue]🔍 Testando detecção de dependências...[/blue]")
    
    from advanced_detectors import DependencyDetector
    
    detector = DependencyDetector()
    
    # Conteúdo de teste
    test_content = '''
{
  "dependencies": {
    "express": "^4.18.0",
    "axios": "^1.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.0"
  }
}
'''
    
    detections = detector.detect_dependencies("package.json", test_content)
    
    console.print(f"[green]✅ {len(detections)} dependências detectadas:[/green]")
    for detection in detections:
        console.print(f"  • {detection.package_name}@{detection.version} ({detection.category})")
    
    return len(detections) > 0

def test_integrated_system():
    """Testa o sistema integrado"""
    console.print("[blue]🔍 Testando sistema integrado...[/blue]")
    
    # Criar projeto de teste
    test_dir = create_test_project()
    
    try:
        from auto_doc_integrated import IntegratedAutoDocSystem
        
        system = IntegratedAutoDocSystem(str(test_dir))
        
        # Executar análise única
        console.print("[yellow]Executando análise única...[/yellow]")
        system.run_single_analysis()
        
        console.print("[green]✅ Sistema integrado funcionando![/green]")
        return True
        
    except Exception as e:
        console.print(f"[red]❌ Erro no sistema integrado: {e}[/red]")
        return False
    
    finally:
        # Limpar projeto de teste
        shutil.rmtree(test_dir, ignore_errors=True)

def main():
    """Função principal de teste"""
    console.print(Panel.fit(
        "[bold blue]🧪 Teste do Sistema de Auto-Documentação[/bold blue]\n"
        "Executando testes para validar funcionalidades...",
        title="Test Suite",
        border_style="blue"
    ))
    
    tests = [
        ("Detecção de APIs", test_api_detection),
        ("Detecção de Banco de Dados", test_database_detection),
        ("Detecção de Dependências", test_dependency_detection),
        ("Sistema Integrado", test_integrated_system)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        console.print(f"\n[bold]🧪 {test_name}:[/bold]")
        try:
            if test_func():
                console.print(f"[green]✅ {test_name} - PASSOU[/green]")
                passed += 1
            else:
                console.print(f"[red]❌ {test_name} - FALHOU[/red]")
        except Exception as e:
            console.print(f"[red]❌ {test_name} - ERRO: {e}[/red]")
    
    # Resultado final
    console.print(f"\n[bold]📊 Resultado dos Testes:[/bold]")
    console.print(f"[green]✅ Passou: {passed}/{total}[/green]")
    console.print(f"[red]❌ Falhou: {total - passed}/{total}[/red]")
    
    if passed == total:
        console.print(Panel.fit(
            "[bold green]🎉 Todos os testes passaram![/bold green]\n"
            "O sistema está funcionando corretamente.",
            title="Teste Concluído",
            border_style="green"
        ))
    else:
        console.print(Panel.fit(
            "[bold red]⚠️ Alguns testes falharam![/bold red]\n"
            "Verifique os erros acima.",
            title="Teste Concluído",
            border_style="red"
        ))

if __name__ == '__main__':
    main()
