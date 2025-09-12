#!/usr/bin/env python3
"""
Script simples para iniciar o Agente de Operações.
"""

import uvicorn
from src.main import create_app

if __name__ == "__main__":
    print("🚀 Iniciando Agente de Operações...")
    print("📍 Acesse: http://localhost:8000/docs")
    print("🔍 Health Check: http://localhost:8000/health")
    print("=" * 50)
    
    app = create_app()
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
