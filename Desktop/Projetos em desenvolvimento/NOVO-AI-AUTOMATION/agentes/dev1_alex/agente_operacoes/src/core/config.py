"""
Configurações do Agente de Operações.

Este módulo centraliza todas as configurações da aplicação.
"""

import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Configurações da aplicação."""
    
    # ===========================================
    # CONFIGURAÇÕES GERAIS
    # ===========================================
    DEBUG: bool = Field(default=False, env="DEBUG")
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    
    # ===========================================
    # SERVIDOR
    # ===========================================
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8000, env="PORT")
    RELOAD: bool = Field(default=False, env="RELOAD")
    WORKERS: int = Field(default=1, env="WORKERS")
    
    # ===========================================
    # BANCO DE DADOS
    # ===========================================
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    DATABASE_POOL_SIZE: int = Field(default=10, env="DATABASE_POOL_SIZE")
    DATABASE_MAX_OVERFLOW: int = Field(default=20, env="DATABASE_MAX_OVERFLOW")
    
    # ===========================================
    # REDIS
    # ===========================================
    REDIS_URL: str = Field(..., env="REDIS_URL")
    REDIS_PASSWORD: Optional[str] = Field(default=None, env="REDIS_PASSWORD")
    REDIS_DB: int = Field(default=0, env="REDIS_DB")
    
    # ===========================================
    # CELERY
    # ===========================================
    CELERY_BROKER_URL: str = Field(..., env="CELERY_BROKER_URL")
    CELERY_RESULT_BACKEND: str = Field(..., env="CELERY_RESULT_BACKEND")
    
    # ===========================================
    # APIs EXTERNAS - ERP
    # ===========================================
    ERP_API_URL: str = Field(..., env="ERP_API_URL")
    ERP_API_KEY: str = Field(..., env="ERP_API_KEY")
    ERP_API_SECRET: str = Field(..., env="ERP_API_SECRET")
    ERP_TIMEOUT: int = Field(default=30, env="ERP_TIMEOUT")
    
    # ===========================================
    # APIs EXTERNAS - LOGÍSTICA
    # ===========================================
    LOGISTICA_API_URL: str = Field(..., env="LOGISTICA_API_URL")
    LOGISTICA_API_KEY: str = Field(..., env="LOGISTICA_API_KEY")
    LOGISTICA_API_SECRET: str = Field(..., env="LOGISTICA_API_SECRET")
    LOGISTICA_TIMEOUT: int = Field(default=30, env="LOGISTICA_TIMEOUT")
    
    # ===========================================
    # APIs EXTERNAS - TRANSPORTADORAS
    # ===========================================
    CORREIOS_API_URL: str = Field(..., env="CORREIOS_API_URL")
    CORREIOS_API_KEY: str = Field(..., env="CORREIOS_API_KEY")
    MERCADO_ENVIOS_API_URL: str = Field(..., env="MERCADO_ENVIOS_API_URL")
    MERCADO_ENVIOS_ACCESS_TOKEN: str = Field(..., env="MERCADO_ENVIOS_ACCESS_TOKEN")
    
    # ===========================================
    # APIs FISCAIS - SEFAZ
    # ===========================================
    SEFAZ_API_URL: str = Field(..., env="SEFAZ_API_URL")
    SEFAZ_API_KEY: str = Field(..., env="SEFAZ_API_KEY")
    SEFAZ_CERTIFICADO_PATH: str = Field(..., env="SEFAZ_CERTIFICADO_PATH")
    SEFAZ_CERTIFICADO_PASSWORD: str = Field(..., env="SEFAZ_CERTIFICADO_PASSWORD")
    
    # ===========================================
    # CONFIGURAÇÕES DE NFE
    # ===========================================
    NFE_AMBIENTE: str = Field(default="homologacao", env="NFE_AMBIENTE")
    NFE_SERIE: int = Field(default=1, env="NFE_SERIE")
    NFE_NUMERO_INICIAL: int = Field(default=1, env="NFE_NUMERO_INICIAL")
    NFE_EMPRESA_CNPJ: str = Field(..., env="NFE_EMPRESA_CNPJ")
    NFE_EMPRESA_RAZAO_SOCIAL: str = Field(..., env="NFE_EMPRESA_RAZAO_SOCIAL")
    
    # ===========================================
    # CONFIGURAÇÕES DE ESTOQUE
    # ===========================================
    ESTOQUE_MINIMO_PERCENTUAL: float = Field(default=10.0, env="ESTOQUE_MINIMO_PERCENTUAL")
    ESTOQUE_ALERTA_PERCENTUAL: float = Field(default=20.0, env="ESTOQUE_ALERTA_PERCENTUAL")
    ESTOQUE_REPOSICAO_AUTOMATICA: bool = Field(default=False, env="ESTOQUE_REPOSICAO_AUTOMATICA")
    
    # ===========================================
    # CONFIGURAÇÕES DE FRETE
    # ===========================================
    FRETE_CALCULO_AUTOMATICO: bool = Field(default=True, env="FRETE_CALCULO_AUTOMATICO")
    FRETE_OTIMIZACAO: bool = Field(default=True, env="FRETE_OTIMIZACAO")
    FRETE_PRAZO_MAXIMO: int = Field(default=7, env="FRETE_PRAZO_MAXIMO")
    
    # ===========================================
    # CONFIGURAÇÕES DE NOTIFICAÇÕES
    # ===========================================
    NOTIFICACAO_EMAIL_SMTP: str = Field(..., env="NOTIFICACAO_EMAIL_SMTP")
    NOTIFICACAO_EMAIL_PORT: int = Field(default=587, env="NOTIFICACAO_EMAIL_PORT")
    NOTIFICACAO_EMAIL_USER: str = Field(..., env="NOTIFICACAO_EMAIL_USER")
    NOTIFICACAO_EMAIL_PASSWORD: str = Field(..., env="NOTIFICACAO_EMAIL_PASSWORD")
    NOTIFICACAO_EMAIL_FROM: str = Field(..., env="NOTIFICACAO_EMAIL_FROM")
    
    NOTIFICACAO_WHATSAPP_API_URL: str = Field(..., env="NOTIFICACAO_WHATSAPP_API_URL")
    NOTIFICACAO_WHATSAPP_TOKEN: str = Field(..., env="NOTIFICACAO_WHATSAPP_TOKEN")
    
    # ===========================================
    # CONFIGURAÇÕES DE SEGURANÇA
    # ===========================================
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    JWT_SECRET_KEY: str = Field(..., env="JWT_SECRET_KEY")
    JWT_ALGORITHM: str = Field(default="HS256", env="JWT_ALGORITHM")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, env="JWT_ACCESS_TOKEN_EXPIRE_MINUTES")
    
    # ===========================================
    # CONFIGURAÇÕES DE MONITORAMENTO
    # ===========================================
    SENTRY_DSN: Optional[str] = Field(default=None, env="SENTRY_DSN")
    PROMETHEUS_PORT: int = Field(default=8001, env="PROMETHEUS_PORT")
    HEALTH_CHECK_INTERVAL: int = Field(default=30, env="HEALTH_CHECK_INTERVAL")
    
    # ===========================================
    # CONFIGURAÇÕES DE CORS
    # ===========================================
    ALLOWED_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:8080"],
        env="ALLOWED_ORIGINS"
    )
    ALLOWED_HOSTS: List[str] = Field(
        default=["localhost", "127.0.0.1"],
        env="ALLOWED_HOSTS"
    )
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Instância global das configurações
settings = Settings()
