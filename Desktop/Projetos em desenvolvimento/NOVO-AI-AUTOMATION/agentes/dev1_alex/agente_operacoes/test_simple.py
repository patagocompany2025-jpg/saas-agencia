#!/usr/bin/env python3
"""
Teste simples para verificar se o servidor está funcionando.
"""

import requests
import time

def test_server():
    """Testa se o servidor está funcionando."""
    try:
        print("🔍 Testando servidor...")
        
        # Testar health check
        response = requests.get("http://localhost:8000/health", timeout=5)
        
        if response.status_code == 200:
            print("✅ Servidor está funcionando!")
            print(f"📊 Resposta: {response.json()}")
            return True
        else:
            print(f"❌ Servidor retornou status {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Não foi possível conectar ao servidor")
        print("💡 Verifique se o servidor está rodando na porta 8000")
        return False
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

if __name__ == "__main__":
    print("🧪 TESTE SIMPLES DO SERVIDOR")
    print("=" * 40)
    
    # Aguardar um pouco
    print("⏳ Aguardando 3 segundos...")
    time.sleep(3)
    
    # Testar
    if test_server():
        print("\n🎉 SUCESSO! O servidor está funcionando!")
        print("📍 Acesse: http://localhost:8000/docs")
    else:
        print("\n❌ FALHA! O servidor não está funcionando!")
        print("💡 Execute: python start_agente.py")
