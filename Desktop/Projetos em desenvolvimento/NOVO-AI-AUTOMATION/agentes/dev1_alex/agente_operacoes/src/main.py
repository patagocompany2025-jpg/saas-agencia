"""
Agente de Operações - Ponto de Entrada Principal

Este módulo inicializa e executa o Agente de Operações.
"""

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from src.api.routes import pedidos, estoque, nfe, frete, alertas
from src.core.config import settings
from src.core.database import init_database
from src.core.logging import setup_logging
from src.core.middleware import LoggingMiddleware, MetricsMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Gerencia o ciclo de vida da aplicação."""
    # Startup
    logging.info("🚀 Iniciando Agente de Operações...")
    
    # Inicializar banco de dados
    await init_database()
    logging.info("✅ Banco de dados inicializado")
    
    # Inicializar serviços
    # TODO: Inicializar serviços de integração
    logging.info("✅ Serviços inicializados")
    
    yield
    
    # Shutdown
    logging.info("🛑 Finalizando Agente de Operações...")


def create_app() -> FastAPI:
    """Cria e configura a aplicação FastAPI."""
    
    # Configurar logging
    setup_logging()
    
    # Criar aplicação
    app = FastAPI(
        title="Agente de Operações",
        description="Sistema inteligente de automação operacional e logística",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan
    )
    
    # Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.ALLOWED_HOSTS
    )
    
    app.add_middleware(LoggingMiddleware)
    app.add_middleware(MetricsMiddleware)
    
    # Rotas
    app.include_router(pedidos.router, prefix="/api/v1/pedidos", tags=["Pedidos"])
    app.include_router(estoque.router, prefix="/api/v1/estoque", tags=["Estoque"])
    app.include_router(nfe.router, prefix="/api/v1/nfe", tags=["NFe"])
    app.include_router(frete.router, prefix="/api/v1/frete", tags=["Frete"])
    app.include_router(alertas.router, prefix="/api/v1/alertas", tags=["Alertas"])
    
    # Health check
    @app.get("/health")
    async def health_check():
        """Endpoint de verificação de saúde."""
        return {
            "status": "healthy",
            "version": "1.0.0",
            "service": "agente-operacoes"
        }
    
    return app


def main():
    """Função principal para execução."""
    import uvicorn
    
    uvicorn.run(
        "src.main:create_app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD,
        log_level=settings.LOG_LEVEL.lower()
    )


if __name__ == "__main__":
    main()
