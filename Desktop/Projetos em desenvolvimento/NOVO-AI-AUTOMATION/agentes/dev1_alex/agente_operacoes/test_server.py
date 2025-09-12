#!/usr/bin/env python3
"""
Script para testar se o servidor está funcionando.

Este script testa a conectividade com o servidor.
"""

import requests
import time
import sys

def test_health_check():
    """Testa o health check do servidor."""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health Check OK: {data}")
            return True
        else:
            print(f"❌ Health Check falhou: Status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Não foi possível conectar ao servidor")
        print("   💡 Verifique se o servidor está rodando")
        return False
    except requests.exceptions.Timeout:
        print("❌ Timeout ao conectar ao servidor")
        return False
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        return False

def test_swagger_ui():
    """Testa se o Swagger UI está acessível."""
    try:
        response = requests.get("http://localhost:8000/docs", timeout=5)
        if response.status_code == 200:
            print("✅ Swagger UI acessível")
            return True
        else:
            print(f"❌ Swagger UI falhou: Status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erro ao acessar Swagger UI: {e}")
        return False

def test_api_endpoints():
    """Testa alguns endpoints da API."""
    endpoints = [
        ("/api/v1/pedidos/", "GET"),
        ("/api/v1/estoque/produtos", "GET"),
        ("/api/v1/nfe/", "GET"),
        ("/api/v1/frete/cotacoes", "GET"),
        ("/api/v1/alertas/", "GET")
    ]
    
    print("\n🔍 Testando endpoints da API...")
    
    for endpoint, method in endpoints:
        try:
            url = f"http://localhost:8000{endpoint}"
            response = requests.get(url, timeout=5)
            
            if response.status_code in [200, 422]:  # 422 é OK para endpoints que precisam de parâmetros
                print(f"✅ {method} {endpoint} - OK")
            else:
                print(f"⚠️  {method} {endpoint} - Status {response.status_code}")
                
        except Exception as e:
            print(f"❌ {method} {endpoint} - Erro: {e}")

def main():
    """Função principal de teste."""
    print("🧪 TESTE DE CONECTIVIDADE DO AGENTE DE OPERAÇÕES")
    print("=" * 60)
    
    print("🔍 Verificando se o servidor está rodando...")
    
    # Aguardar um pouco para o servidor inicializar
    print("⏳ Aguardando 3 segundos...")
    time.sleep(3)
    
    # Testar health check
    print("\n1. Testando Health Check...")
    health_ok = test_health_check()
    
    if not health_ok:
        print("\n❌ Servidor não está respondendo!")
        print("💡 Execute: python start_agente_fix.py")
        sys.exit(1)
    
    # Testar Swagger UI
    print("\n2. Testando Swagger UI...")
    swagger_ok = test_swagger_ui()
    
    # Testar endpoints da API
    print("\n3. Testando endpoints da API...")
    test_api_endpoints()
    
    # Resumo
    print("\n" + "="*60)
    if health_ok and swagger_ok:
        print("🎉 SERVIDOR FUNCIONANDO PERFEITAMENTE!")
        print("📍 Swagger UI: http://localhost:8000/docs")
        print("📍 Health Check: http://localhost:8000/health")
    else:
        print("⚠️  Servidor está rodando, mas alguns testes falharam")
        print("💡 Consulte o arquivo TROUBLESHOOTING.md para mais ajuda")

if __name__ == "__main__":
    main()
