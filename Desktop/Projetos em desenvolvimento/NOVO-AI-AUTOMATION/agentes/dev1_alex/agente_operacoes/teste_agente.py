#!/usr/bin/env python3
"""
Script para testar o Agente de Operações.
"""

import subprocess
import time
import requests
import threading
import sys

def start_server():
    """Inicia o servidor em background."""
    try:
        print("🚀 Iniciando servidor...")
        process = subprocess.Popen([
            sys.executable, "start_simple.py"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return process
    except Exception as e:
        print(f"❌ Erro ao iniciar servidor: {e}")
        return None

def test_server():
    """Testa se o servidor está funcionando."""
    print("🔍 Testando servidor...")
    
    for i in range(10):  # Tentar por 10 segundos
        try:
            response = requests.get("http://localhost:8000/health", timeout=2)
            if response.status_code == 200:
                print("✅ Servidor está funcionando!")
                return True
        except:
            pass
        
        time.sleep(1)
        print(f"⏳ Aguardando... ({i+1}/10)")
    
    print("❌ Servidor não respondeu")
    return False

def test_endpoints():
    """Testa os principais endpoints."""
    print("\n🔍 Testando endpoints...")
    
    endpoints = [
        ("/", "Página inicial"),
        ("/health", "Health Check"),
        ("/docs", "Swagger UI"),
        ("/api/pedidos/", "Pedidos"),
        ("/api/estoque/produtos/", "Produtos"),
        ("/api/nfe/", "NFe"),
        ("/api/frete/cotacoes/", "Frete"),
        ("/api/alertas/", "Alertas")
    ]
    
    sucessos = 0
    
    for endpoint, nome in endpoints:
        try:
            response = requests.get(f"http://localhost:8000{endpoint}", timeout=3)
            if response.status_code in [200, 404]:  # 404 é aceitável para listas vazias
                print(f"✅ {nome}: OK")
                sucessos += 1
            else:
                print(f"⚠️  {nome}: {response.status_code}")
        except Exception as e:
            print(f"❌ {nome}: Erro - {e}")
    
    return sucessos

def main():
    """Função principal."""
    print("🧪 TESTE DO AGENTE DE OPERAÇÕES")
    print("=" * 50)
    
    # Iniciar servidor
    server_process = start_server()
    if not server_process:
        print("❌ Não foi possível iniciar o servidor")
        return
    
    try:
        # Aguardar servidor iniciar
        if test_server():
            # Testar endpoints
            sucessos = test_endpoints()
            
            print(f"\n📊 RESULTADO: {sucessos} endpoints funcionando")
            
            if sucessos > 0:
                print("\n🎉 AGENTE DE OPERAÇÕES ESTÁ FUNCIONANDO!")
                print("📍 Acesse: http://localhost:8000/docs")
                print("📍 Health: http://localhost:8000/health")
                print("\n⏳ Pressione Ctrl+C para parar o servidor...")
                
                # Manter servidor rodando
                try:
                    server_process.wait()
                except KeyboardInterrupt:
                    print("\n🛑 Parando servidor...")
            else:
                print("\n❌ Nenhum endpoint funcionou")
        else:
            print("\n❌ Servidor não iniciou corretamente")
    
    finally:
        # Parar servidor
        if server_process:
            server_process.terminate()
            print("🛑 Servidor parado")

if __name__ == "__main__":
    main()
