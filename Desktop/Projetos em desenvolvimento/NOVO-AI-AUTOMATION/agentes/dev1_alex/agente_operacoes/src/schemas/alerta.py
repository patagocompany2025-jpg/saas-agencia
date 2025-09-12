"""
Schemas relacionados a alertas.

Este módulo contém os schemas Pydantic para validação de dados de alertas.
"""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

from src.models.alerta import TipoAlerta, PrioridadeAlerta, StatusAlerta, CanalNotificacao


class AlertaBase(BaseModel):
    """Schema base para alertas."""
    tipo: TipoAlerta = Field(..., description="Tipo do alerta")
    prioridade: PrioridadeAlerta = Field(PrioridadeAlerta.MEDIA, description="Prioridade do alerta")
    titulo: str = Field(..., description="Título do alerta")
    mensagem: str = Field(..., description="Mensagem do alerta")
    descricao: Optional[str] = Field(None, description="Descrição do alerta")
    entidade_tipo: Optional[str] = Field(None, description="Tipo da entidade relacionada")
    entidade_id: Optional[str] = Field(None, description="ID da entidade relacionada")
    pedido_id: Optional[int] = Field(None, description="ID do pedido")
    produto_id: Optional[int] = Field(None, description="ID do produto")
    nfe_id: Optional[int] = Field(None, description="ID da NFe")
    dados_extras: Optional[Dict[str, Any]] = Field(None, description="Dados extras do alerta")
    canais_notificacao: Optional[List[CanalNotificacao]] = Field(None, description="Canais de notificação")
    destinatarios: Optional[List[str]] = Field(None, description="Destinatários")
    max_tentativas: int = Field(3, ge=1, le=10, description="Máximo de tentativas de envio")
    data_expiracao: Optional[datetime] = Field(None, description="Data de expiração do alerta")
    requer_acao_manual: bool = Field(False, description="Requer ação manual")


class AlertaCreate(AlertaBase):
    """Schema para criação de alerta."""
    pass


class AlertaUpdate(BaseModel):
    """Schema para atualização de alerta."""
    titulo: Optional[str] = Field(None, description="Título do alerta")
    mensagem: Optional[str] = Field(None, description="Mensagem do alerta")
    descricao: Optional[str] = Field(None, description="Descrição do alerta")
    prioridade: Optional[PrioridadeAlerta] = Field(None, description="Prioridade do alerta")
    status: Optional[StatusAlerta] = Field(None, description="Status do alerta")
    dados_extras: Optional[Dict[str, Any]] = Field(None, description="Dados extras do alerta")
    canais_notificacao: Optional[List[CanalNotificacao]] = Field(None, description="Canais de notificação")
    destinatarios: Optional[List[str]] = Field(None, description="Destinatários")
    ativo: Optional[bool] = Field(None, description="Alerta ativo")


class AlertaResponse(AlertaBase):
    """Schema para resposta de alerta."""
    id: int
    codigo: str
    status: StatusAlerta
    tentativas_envio: int
    proximo_envio: Optional[datetime]
    data_ultimo_envio: Optional[datetime]
    data_criacao: datetime
    data_atualizacao: datetime
    data_leitura: Optional[datetime]
    data_resolucao: Optional[datetime]
    ativo: bool
    processado_automaticamente: bool
    
    class Config:
        from_attributes = True


class AlertaListResponse(BaseModel):
    """Schema para resposta de lista de alertas."""
    alertas: List[AlertaResponse]
    total: int
    skip: int
    limit: int


class ResumoAlertasResponse(BaseModel):
    """Schema para resumo de alertas."""
    total_alertas: int
    alertas_pendentes: int
    alertas_enviados: int
    alertas_lidos: int
    alertas_resolvidos: int
    alertas_ignorados: int
    alertas_expirados: int
    alertas_por_tipo: Dict[str, int]
    alertas_por_prioridade: Dict[str, int]
    alertas_por_status: Dict[str, int]
    ultimos_alertas: List[AlertaResponse]
