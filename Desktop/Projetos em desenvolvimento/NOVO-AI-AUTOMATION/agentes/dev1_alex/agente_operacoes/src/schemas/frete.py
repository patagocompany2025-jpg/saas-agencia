"""
Schemas relacionados a frete.

Este módulo contém os schemas Pydantic para validação de dados de frete.
"""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field

from src.models.frete import StatusCotacao, TipoServico


class TransportadoraBase(BaseModel):
    """Schema base para transportadoras."""
    codigo: str = Field(..., description="Código da transportadora")
    nome: str = Field(..., description="Nome da transportadora")
    nome_fantasia: Optional[str] = Field(None, description="Nome fantasia")
    cnpj: Optional[str] = Field(None, description="CNPJ")
    inscricao_estadual: Optional[str] = Field(None, description="Inscrição estadual")
    email: Optional[str] = Field(None, description="Email")
    telefone: Optional[str] = Field(None, description="Telefone")
    site: Optional[str] = Field(None, description="Site")
    cep: Optional[str] = Field(None, description="CEP")
    logradouro: Optional[str] = Field(None, description="Logradouro")
    numero: Optional[str] = Field(None, description="Número")
    complemento: Optional[str] = Field(None, description="Complemento")
    bairro: Optional[str] = Field(None, description="Bairro")
    cidade: Optional[str] = Field(None, description="Cidade")
    estado: Optional[str] = Field(None, description="Estado")
    pais: str = Field("Brasil", description="País")
    prazo_entrega_padrao: int = Field(5, description="Prazo de entrega padrão em dias")
    valor_minimo: Decimal = Field(0, ge=0, description="Valor mínimo")
    valor_maximo: Optional[Decimal] = Field(None, ge=0, description="Valor máximo")
    peso_maximo: Optional[Decimal] = Field(None, ge=0, description="Peso máximo em kg")
    volume_maximo: Optional[Decimal] = Field(None, ge=0, description="Volume máximo em m³")
    ativo: bool = Field(True, description="Transportadora ativa")
    disponivel: bool = Field(True, description="Transportadora disponível")


class TransportadoraCreate(TransportadoraBase):
    """Schema para criação de transportadora."""
    pass


class TransportadoraResponse(TransportadoraBase):
    """Schema para resposta de transportadora."""
    id: int
    data_criacao: datetime
    data_atualizacao: datetime
    data_ultima_cotacao: Optional[datetime]
    
    class Config:
        from_attributes = True


class CotacaoFreteBase(BaseModel):
    """Schema base para cotações de frete."""
    pedido_id: Optional[int] = Field(None, description="ID do pedido")
    transportadora_id: int = Field(..., description="ID da transportadora")
    tipo_servico: TipoServico = Field(..., description="Tipo de serviço")
    codigo_servico: Optional[str] = Field(None, description="Código do serviço")
    nome_servico: Optional[str] = Field(None, description="Nome do serviço")
    valor_frete: Decimal = Field(..., gt=0, description="Valor do frete")
    valor_seguro: Decimal = Field(0, ge=0, description="Valor do seguro")
    valor_declarado: Decimal = Field(0, ge=0, description="Valor declarado")
    valor_total: Decimal = Field(..., gt=0, description="Valor total")
    prazo_entrega: int = Field(..., gt=0, description="Prazo de entrega em dias úteis")
    prazo_entrega_minimo: Optional[int] = Field(None, gt=0, description="Prazo mínimo")
    prazo_entrega_maximo: Optional[int] = Field(None, gt=0, description="Prazo máximo")
    peso_total: Decimal = Field(..., gt=0, description="Peso total em kg")
    volume_total: Optional[Decimal] = Field(None, ge=0, description="Volume total em m³")
    quantidade_caixas: int = Field(1, gt=0, description="Quantidade de caixas")
    cep_origem: str = Field(..., description="CEP de origem")
    cep_destino: str = Field(..., description="CEP de destino")
    cidade_origem: str = Field(..., description="Cidade de origem")
    cidade_destino: str = Field(..., description="Cidade de destino")
    estado_origem: str = Field(..., description="Estado de origem")
    estado_destino: str = Field(..., description="Estado de destino")
    entrega_domicilio: bool = Field(True, description="Entrega domiciliar")
    entrega_sabado: bool = Field(False, description="Entrega aos sábados")
    entrega_feriado: bool = Field(False, description="Entrega em feriados")
    coleta_agendada: bool = Field(False, description="Coleta agendada")
    observacoes: Optional[str] = Field(None, description="Observações")


class CotacaoFreteCreate(CotacaoFreteBase):
    """Schema para criação de cotação de frete."""
    pass


class CotacaoFreteResponse(CotacaoFreteBase):
    """Schema para resposta de cotação de frete."""
    id: int
    codigo_cotacao: str
    status: StatusCotacao
    codigo_rastreamento: Optional[str]
    url_rastreamento: Optional[str]
    etiqueta_url: Optional[str]
    erro_api: Optional[str]
    codigo_erro: Optional[str]
    mensagem_erro: Optional[str]
    observacoes_internas: Optional[str]
    data_cotacao: datetime
    data_expiracao: Optional[datetime]
    data_confirmacao: Optional[datetime]
    data_coleta: Optional[datetime]
    data_entrega: Optional[datetime]
    data_criacao: datetime
    data_atualizacao: datetime
    selecionada: bool
    confirmada: bool
    processada_automaticamente: bool
    
    class Config:
        from_attributes = True


class CotacaoFreteListResponse(BaseModel):
    """Schema para resposta de lista de cotações de frete."""
    cotacoes: List[CotacaoFreteResponse]
    total: int
    skip: int
    limit: int


class TransportadoraListResponse(BaseModel):
    """Schema para resposta de lista de transportadoras."""
    transportadoras: List[TransportadoraResponse]
    total: int
    skip: int
    limit: int
