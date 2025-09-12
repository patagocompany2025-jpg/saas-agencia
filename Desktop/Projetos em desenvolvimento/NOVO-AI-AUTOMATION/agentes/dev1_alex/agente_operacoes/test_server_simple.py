#!/usr/bin/env python3
"""
Servidor de teste simples para verificar se o FastAPI funciona.
"""

from fastapi import FastAPI
import uvicorn

# Criar app simples
app = FastAPI(title="Teste Agente de Operações")

@app.get("/")
async def root():
    return {"message": "Agente de Operações funcionando!"}

@app.get("/health")
async def health():
    return {"status": "ok", "message": "Servidor funcionando"}

if __name__ == "__main__":
    print("🚀 Iniciando servidor de teste...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
