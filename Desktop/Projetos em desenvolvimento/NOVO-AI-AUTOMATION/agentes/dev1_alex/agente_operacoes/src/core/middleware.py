"""
Middlewares personalizados para o Agente de Operações.

Este módulo contém middlewares para logging, métricas e outras funcionalidades.
"""

import time
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from src.core.logging import get_logger, log_api_call

logger = get_logger("middleware")


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware para logging de requisições HTTP."""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Processa a requisição e registra logs."""
        
        # Log da requisição recebida
        logger.info(
            "request_received",
            method=request.method,
            url=str(request.url),
            client_ip=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent")
        )
        
        # Processar requisição
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        
        # Log da resposta
        logger.info(
            "response_sent",
            method=request.method,
            url=str(request.url),
            status_code=response.status_code,
            duration_ms=round(process_time * 1000, 2)
        )
        
        # Log da chamada da API
        log_api_call(
            method=request.method,
            endpoint=str(request.url.path),
            status_code=response.status_code,
            duration=process_time
        )
        
        return response


class MetricsMiddleware(BaseHTTPMiddleware):
    """Middleware para coleta de métricas."""
    
    def __init__(self, app):
        super().__init__(app)
        self.request_count = 0
        self.total_duration = 0.0
        self.error_count = 0
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Coleta métricas da requisição."""
        
        # Incrementar contador de requisições
        self.request_count += 1
        
        # Processar requisição
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        
        # Atualizar métricas
        self.total_duration += process_time
        
        if response.status_code >= 400:
            self.error_count += 1
        
        # Adicionar headers de métricas
        response.headers["X-Process-Time"] = str(round(process_time * 1000, 2))
        response.headers["X-Request-Count"] = str(self.request_count)
        
        return response
    
    def get_metrics(self) -> dict:
        """Retorna métricas coletadas."""
        avg_duration = self.total_duration / self.request_count if self.request_count > 0 else 0
        
        return {
            "request_count": self.request_count,
            "error_count": self.error_count,
            "total_duration": self.total_duration,
            "average_duration": avg_duration,
            "error_rate": self.error_count / self.request_count if self.request_count > 0 else 0
        }
