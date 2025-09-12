"""
Sistema de logging estruturado para o Agente de Operações.

Este módulo configura o sistema de logs com formatação JSON estruturada.
"""

import logging
import sys
from typing import Any, Dict

import structlog
from structlog.stdlib import LoggerFactory

from src.core.config import settings


def setup_logging() -> None:
    """Configura o sistema de logging estruturado."""
    
    # Configurar structlog
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer()
        ],
        context_class=dict,
        logger_factory=LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )
    
    # Configurar logging padrão
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, settings.LOG_LEVEL.upper()),
    )
    
    # Configurar loggers específicos
    _configure_loggers()


def _configure_loggers() -> None:
    """Configura loggers específicos da aplicação."""
    
    # Logger principal
    logger = structlog.get_logger("agente_operacoes")
    
    # Logger para pedidos
    pedidos_logger = structlog.get_logger("pedidos")
    
    # Logger para estoque
    estoque_logger = structlog.get_logger("estoque")
    
    # Logger para NFe
    nfe_logger = structlog.get_logger("nfe")
    
    # Logger para frete
    frete_logger = structlog.get_logger("frete")
    
    # Logger para alertas
    alertas_logger = structlog.get_logger("alertas")
    
    # Logger para integrações
    integracoes_logger = structlog.get_logger("integracoes")


def get_logger(name: str) -> structlog.BoundLogger:
    """Retorna um logger estruturado para o módulo especificado."""
    return structlog.get_logger(name)


class LoggerMixin:
    """Mixin para adicionar logging a classes."""
    
    @property
    def logger(self) -> structlog.BoundLogger:
        """Retorna o logger para a classe."""
        return get_logger(self.__class__.__name__)


def log_function_call(func_name: str, **kwargs: Any) -> None:
    """Log de chamada de função com parâmetros."""
    logger = get_logger("function_calls")
    logger.info(
        "function_called",
        function=func_name,
        parameters=kwargs
    )


def log_api_call(method: str, endpoint: str, status_code: int, duration: float) -> None:
    """Log de chamada de API."""
    logger = get_logger("api_calls")
    logger.info(
        "api_call",
        method=method,
        endpoint=endpoint,
        status_code=status_code,
        duration_ms=round(duration * 1000, 2)
    )


def log_business_event(event: str, **context: Any) -> None:
    """Log de evento de negócio."""
    logger = get_logger("business_events")
    logger.info(
        "business_event",
        event=event,
        **context
    )


def log_error(error: Exception, context: Dict[str, Any] = None) -> None:
    """Log de erro com contexto."""
    logger = get_logger("errors")
    logger.error(
        "error_occurred",
        error_type=type(error).__name__,
        error_message=str(error),
        context=context or {}
    )
