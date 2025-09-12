#!/usr/bin/env python3
"""
Script de inicialização do Agente de Operações.

Este script inicializa e executa o Agente de Operações.
"""

import asyncio
import sys
import os
from pathlib import Path

# Adicionar o diretório src ao path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from src.main import main

if __name__ == "__main__":
    print("🚀 Iniciando Agente de Operações - Operations Master")
    print("=" * 60)
    
    try:
        main()
    except KeyboardInterrupt:
        print("\n🛑 Agente de Operações interrompido pelo usuário")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Erro ao iniciar Agente de Operações: {e}")
        sys.exit(1)
