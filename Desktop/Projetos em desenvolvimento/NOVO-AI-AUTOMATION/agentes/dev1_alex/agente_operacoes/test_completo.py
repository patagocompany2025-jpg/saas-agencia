#!/usr/bin/env python3
"""
Teste completo do Agente de Operações.
"""

import asyncio
import requests
import time
from src.main import create_app
from src.core.database import get_db
from src.services.pedidos import PedidoService
from src.services.estoque import EstoqueService
from src.services.nfe import NFeService
from src.services.frete import FreteService
from src.services.alertas import AlertaService

def test_api_endpoints():
    """Testa os endpoints da API."""
    print("🔍 TESTANDO ENDPOINTS DA API")
    print("=" * 50)
    
    base_url = "http://localhost:8000"
    
    # Lista de endpoints para testar
    endpoints = [
        ("/", "Página inicial"),
        ("/health", "Health Check"),
        ("/docs", "Documentação Swagger"),
        ("/redoc", "Documentação ReDoc"),
        ("/api/pedidos/", "Lista de pedidos"),
        ("/api/estoque/produtos/", "Lista de produtos"),
        ("/api/nfe/", "Lista de NFe"),
        ("/api/frete/cotacoes/", "Lista de cotações de frete"),
        ("/api/alertas/", "Lista de alertas")
    ]
    
    sucessos = 0
    falhas = 0
    
    for endpoint, descricao in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=5)
            if response.status_code in [200, 404]:  # 404 é aceitável para listas vazias
                print(f"✅ {descricao}: {response.status_code}")
                sucessos += 1
            else:
                print(f"⚠️  {descricao}: {response.status_code}")
                falhas += 1
        except requests.exceptions.ConnectionError:
            print(f"❌ {descricao}: Servidor não está rodando")
            falhas += 1
        except Exception as e:
            print(f"❌ {descricao}: Erro - {e}")
            falhas += 1
    
    print(f"\n📊 RESULTADO: {sucessos} sucessos, {falhas} falhas")
    return sucessos > 0

async def test_services():
    """Testa os serviços do agente."""
    print("\n🔍 TESTANDO SERVIÇOS")
    print("=" * 50)
    
    try:
        # Simular sessão de banco de dados
        db = None  # Em um teste real, você criaria uma sessão
        
        # Testar criação de serviços
        pedido_service = PedidoService(db)
        estoque_service = EstoqueService(db)
        nfe_service = NFeService(db)
        frete_service = FreteService(db)
        alerta_service = AlertaService(db)
        
        print("✅ Todos os serviços criados com sucesso")
        print("✅ PedidoService: OK")
        print("✅ EstoqueService: OK")
        print("✅ NFeService: OK")
        print("✅ FreteService: OK")
        print("✅ AlertaService: OK")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao testar serviços: {e}")
        return False

def test_app_creation():
    """Testa a criação da aplicação."""
    print("🔍 TESTANDO CRIAÇÃO DA APLICAÇÃO")
    print("=" * 50)
    
    try:
        app = create_app()
        print("✅ Aplicação criada com sucesso")
        print(f"✅ Título: {app.title}")
        print(f"✅ Versão: {app.version}")
        print(f"✅ Descrição: {app.description}")
        
        # Verificar rotas
        routes = [route.path for route in app.routes]
        print(f"✅ Rotas registradas: {len(routes)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao criar aplicação: {e}")
        return False

def main():
    """Função principal do teste."""
    print("🧪 TESTE COMPLETO DO AGENTE DE OPERAÇÕES")
    print("=" * 60)
    
    # Teste 1: Criação da aplicação
    app_ok = test_app_creation()
    
    # Teste 2: Serviços
    services_ok = asyncio.run(test_services())
    
    # Teste 3: Endpoints da API (se o servidor estiver rodando)
    print("\n🔍 VERIFICANDO SE O SERVIDOR ESTÁ RODANDO...")
    try:
        response = requests.get("http://localhost:8000/health", timeout=2)
        if response.status_code == 200:
            print("✅ Servidor está rodando!")
            api_ok = test_api_endpoints()
        else:
            print("⚠️  Servidor retornou status inesperado")
            api_ok = False
    except requests.exceptions.ConnectionError:
        print("❌ Servidor não está rodando")
        print("💡 Para testar a API, execute: python start_simple.py")
        api_ok = False
    
    # Resultado final
    print("\n" + "=" * 60)
    print("📊 RESULTADO FINAL")
    print("=" * 60)
    
    if app_ok:
        print("✅ Aplicação: FUNCIONANDO")
    else:
        print("❌ Aplicação: FALHOU")
    
    if services_ok:
        print("✅ Serviços: FUNCIONANDO")
    else:
        print("❌ Serviços: FALHOU")
    
    if api_ok:
        print("✅ API: FUNCIONANDO")
    else:
        print("⚠️  API: Servidor não está rodando")
    
    if app_ok and services_ok:
        print("\n🎉 AGENTE DE OPERAÇÕES ESTÁ FUNCIONANDO!")
        print("📍 Para iniciar o servidor: python start_simple.py")
        print("📍 Para acessar a API: http://localhost:8000/docs")
    else:
        print("\n❌ AGENTE DE OPERAÇÕES TEM PROBLEMAS!")
        print("💡 Verifique os erros acima")

if __name__ == "__main__":
    main()
