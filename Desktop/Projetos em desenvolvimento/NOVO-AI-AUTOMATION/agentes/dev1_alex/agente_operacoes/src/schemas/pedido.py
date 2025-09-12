"""
Schemas relacionados a pedidos.

Este módulo contém os schemas Pydantic para validação de dados de pedidos.
"""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field, validator

from src.models.pedido import StatusPedido, TipoPagamento


class ItemPedidoBase(BaseModel):
    """Schema base para itens de pedido."""
    produto_id: str = Field(..., description="ID do produto")
    produto_codigo: str = Field(..., description="Código do produto")
    produto_nome: str = Field(..., description="Nome do produto")
    produto_descricao: Optional[str] = Field(None, description="Descrição do produto")
    produto_categoria: Optional[str] = Field(None, description="Categoria do produto")
    quantidade: Decimal = Field(..., gt=0, description="Quantidade")
    preco_unitario: Decimal = Field(..., gt=0, description="Preço unitário")
    valor_desconto: Optional[Decimal] = Field(0, ge=0, description="Valor do desconto")
    peso: Optional[Decimal] = Field(None, ge=0, description="Peso em kg")
    volume: Optional[Decimal] = Field(None, ge=0, description="Volume em m³")
    dimensoes_altura: Optional[Decimal] = Field(None, ge=0, description="Altura em cm")
    dimensoes_largura: Optional[Decimal] = Field(None, ge=0, description="Largura em cm")
    dimensoes_profundidade: Optional[Decimal] = Field(None, ge=0, description="Profundidade em cm")
    
    @validator('valor_desconto')
    def validate_desconto(cls, v, values):
        if v and 'preco_unitario' in values and v >= values['preco_unitario']:
            raise ValueError('Desconto não pode ser maior ou igual ao preço unitário')
        return v


class ItemPedidoCreate(ItemPedidoBase):
    """Schema para criação de item de pedido."""
    pass


class ItemPedidoUpdate(BaseModel):
    """Schema para atualização de item de pedido."""
    quantidade: Optional[Decimal] = Field(None, gt=0, description="Quantidade")
    preco_unitario: Optional[Decimal] = Field(None, gt=0, description="Preço unitário")
    valor_desconto: Optional[Decimal] = Field(None, ge=0, description="Valor do desconto")


class ItemPedidoResponse(ItemPedidoBase):
    """Schema para resposta de item de pedido."""
    id: int
    pedido_id: int
    valor_total: Decimal
    data_criacao: datetime
    data_atualizacao: datetime
    
    class Config:
        from_attributes = True


class PedidoBase(BaseModel):
    """Schema base para pedido."""
    cliente_id: str = Field(..., description="ID do cliente")
    cliente_nome: str = Field(..., description="Nome do cliente")
    cliente_email: Optional[str] = Field(None, description="Email do cliente")
    cliente_telefone: Optional[str] = Field(None, description="Telefone do cliente")
    cliente_documento: Optional[str] = Field(None, description="CPF/CNPJ do cliente")
    
    # Endereço de entrega
    endereco_cep: Optional[str] = Field(None, description="CEP")
    endereco_logradouro: Optional[str] = Field(None, description="Logradouro")
    endereco_numero: Optional[str] = Field(None, description="Número")
    endereco_complemento: Optional[str] = Field(None, description="Complemento")
    endereco_bairro: Optional[str] = Field(None, description="Bairro")
    endereco_cidade: Optional[str] = Field(None, description="Cidade")
    endereco_estado: Optional[str] = Field(None, description="Estado")
    endereco_pais: Optional[str] = Field("Brasil", description="País")
    
    # Valores
    valor_subtotal: Decimal = Field(0, ge=0, description="Valor subtotal")
    valor_desconto: Optional[Decimal] = Field(0, ge=0, description="Valor do desconto")
    valor_frete: Optional[Decimal] = Field(0, ge=0, description="Valor do frete")
    
    # Pagamento
    tipo_pagamento: Optional[TipoPagamento] = Field(None, description="Tipo de pagamento")
    
    # Observações
    observacoes: Optional[str] = Field(None, description="Observações")
    observacoes_internas: Optional[str] = Field(None, description="Observações internas")
    
    # Itens
    itens: List[ItemPedidoCreate] = Field(..., min_items=1, description="Itens do pedido")
    
    @validator('endereco_cep')
    def validate_cep(cls, v):
        if v and not v.replace('-', '').replace('.', '').isdigit():
            raise ValueError('CEP deve conter apenas números')
        return v
    
    @validator('cliente_documento')
    def validate_documento(cls, v):
        if v and not v.replace('.', '').replace('-', '').replace('/', '').isdigit():
            raise ValueError('Documento deve conter apenas números')
        return v


class PedidoCreate(PedidoBase):
    """Schema para criação de pedido."""
    pass


class PedidoUpdate(BaseModel):
    """Schema para atualização de pedido."""
    cliente_nome: Optional[str] = Field(None, description="Nome do cliente")
    cliente_email: Optional[str] = Field(None, description="Email do cliente")
    cliente_telefone: Optional[str] = Field(None, description="Telefone do cliente")
    
    # Endereço de entrega
    endereco_cep: Optional[str] = Field(None, description="CEP")
    endereco_logradouro: Optional[str] = Field(None, description="Logradouro")
    endereco_numero: Optional[str] = Field(None, description="Número")
    endereco_complemento: Optional[str] = Field(None, description="Complemento")
    endereco_bairro: Optional[str] = Field(None, description="Bairro")
    endereco_cidade: Optional[str] = Field(None, description="Cidade")
    endereco_estado: Optional[str] = Field(None, description="Estado")
    endereco_pais: Optional[str] = Field(None, description="País")
    
    # Valores
    valor_desconto: Optional[Decimal] = Field(None, ge=0, description="Valor do desconto")
    valor_frete: Optional[Decimal] = Field(None, ge=0, description="Valor do frete")
    
    # Pagamento
    tipo_pagamento: Optional[TipoPagamento] = Field(None, description="Tipo de pagamento")
    
    # Observações
    observacoes: Optional[str] = Field(None, description="Observações")
    observacoes_internas: Optional[str] = Field(None, description="Observações internas")


class PedidoResponse(PedidoBase):
    """Schema para resposta de pedido."""
    id: int
    numero_pedido: str
    codigo_externo: Optional[str]
    valor_total: Decimal
    status: StatusPedido
    status_pagamento: Optional[str]
    data_criacao: datetime
    data_atualizacao: datetime
    data_aprovacao: Optional[datetime]
    data_faturamento: Optional[datetime]
    data_envio: Optional[datetime]
    data_entrega: Optional[datetime]
    processado_automaticamente: bool
    requer_aprovacao_manual: bool
    cancelado: bool
    itens: List[ItemPedidoResponse]
    
    class Config:
        from_attributes = True


class PedidoListResponse(BaseModel):
    """Schema para resposta de lista de pedidos."""
    pedidos: List[PedidoResponse]
    total: int
    skip: int
    limit: int
