"""
Schemas relacionados a NFe.

Este módulo contém os schemas Pydantic para validação de dados de NFe.
"""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field

from src.models.nfe import StatusNFe, TipoEmissao


class ItemNFeBase(BaseModel):
    """Schema base para itens de NFe."""
    produto_codigo: str = Field(..., description="Código do produto")
    produto_nome: str = Field(..., description="Nome do produto")
    produto_descricao: Optional[str] = Field(None, description="Descrição do produto")
    ncm: Optional[str] = Field(None, description="NCM")
    cfop: Optional[str] = Field(None, description="CFOP")
    unidade_comercial: str = Field("UN", description="Unidade comercial")
    quantidade_comercial: Decimal = Field(..., gt=0, description="Quantidade comercial")
    valor_unitario_comercial: Decimal = Field(..., gt=0, description="Valor unitário comercial")
    valor_total_produto: Decimal = Field(..., gt=0, description="Valor total do produto")


class ItemNFeCreate(ItemNFeBase):
    """Schema para criação de item de NFe."""
    pass


class ItemNFeResponse(ItemNFeBase):
    """Schema para resposta de item de NFe."""
    id: int
    nfe_id: int
    produto_id: Optional[int]
    data_criacao: datetime
    data_atualizacao: datetime
    
    class Config:
        from_attributes = True


class NFeBase(BaseModel):
    """Schema base para NFe."""
    pedido_id: Optional[int] = Field(None, description="ID do pedido")
    destinatario_cnpj: Optional[str] = Field(None, description="CNPJ do destinatário")
    destinatario_cpf: Optional[str] = Field(None, description="CPF do destinatário")
    destinatario_nome: Optional[str] = Field(None, description="Nome do destinatário")
    destinatario_inscricao_estadual: Optional[str] = Field(None, description="Inscrição estadual")
    destinatario_email: Optional[str] = Field(None, description="Email do destinatário")
    destinatario_cep: Optional[str] = Field(None, description="CEP do destinatário")
    destinatario_logradouro: Optional[str] = Field(None, description="Logradouro do destinatário")
    destinatario_numero: Optional[str] = Field(None, description="Número do destinatário")
    destinatario_complemento: Optional[str] = Field(None, description="Complemento do destinatário")
    destinatario_bairro: Optional[str] = Field(None, description="Bairro do destinatário")
    destinatario_cidade: Optional[str] = Field(None, description="Cidade do destinatário")
    destinatario_estado: Optional[str] = Field(None, description="Estado do destinatário")
    destinatario_pais: str = Field("Brasil", description="País do destinatário")
    valor_produtos: Decimal = Field(0, ge=0, description="Valor dos produtos")
    valor_servicos: Decimal = Field(0, ge=0, description="Valor dos serviços")
    valor_desconto: Decimal = Field(0, ge=0, description="Valor do desconto")
    valor_frete: Decimal = Field(0, ge=0, description="Valor do frete")
    valor_total: Decimal = Field(..., gt=0, description="Valor total")
    observacoes: Optional[str] = Field(None, description="Observações")
    informacoes_complementares: Optional[str] = Field(None, description="Informações complementares")
    itens: List[ItemNFeCreate] = Field(..., min_items=1, description="Itens da NFe")


class NFeCreate(NFeBase):
    """Schema para criação de NFe."""
    pass


class NFeUpdate(BaseModel):
    """Schema para atualização de NFe."""
    destinatario_nome: Optional[str] = Field(None, description="Nome do destinatário")
    destinatario_email: Optional[str] = Field(None, description="Email do destinatário")
    destinatario_cep: Optional[str] = Field(None, description="CEP do destinatário")
    destinatario_logradouro: Optional[str] = Field(None, description="Logradouro do destinatário")
    destinatario_numero: Optional[str] = Field(None, description="Número do destinatário")
    destinatario_complemento: Optional[str] = Field(None, description="Complemento do destinatário")
    destinatario_bairro: Optional[str] = Field(None, description="Bairro do destinatário")
    destinatario_cidade: Optional[str] = Field(None, description="Cidade do destinatário")
    destinatario_estado: Optional[str] = Field(None, description="Estado do destinatário")
    valor_desconto: Optional[Decimal] = Field(None, ge=0, description="Valor do desconto")
    valor_frete: Optional[Decimal] = Field(None, ge=0, description="Valor do frete")
    observacoes: Optional[str] = Field(None, description="Observações")
    informacoes_complementares: Optional[str] = Field(None, description="Informações complementares")


class NFeResponse(NFeBase):
    """Schema para resposta de NFe."""
    id: int
    numero: int
    serie: int
    chave_acesso: Optional[str]
    data_emissao: datetime
    data_saida_entrada: Optional[datetime]
    tipo_emissao: TipoEmissao
    status: StatusNFe
    status_sefaz: Optional[str]
    protocolo_autorizacao: Optional[str]
    protocolo_cancelamento: Optional[str]
    protocolo_inutilizacao: Optional[str]
    data_autorizacao: Optional[datetime]
    data_cancelamento: Optional[datetime]
    xml_assinado: Optional[str]
    xml_autorizado: Optional[str]
    danfe_url: Optional[str]
    processada_automaticamente: bool
    enviada_email: bool
    data_criacao: datetime
    data_atualizacao: datetime
    itens: List[ItemNFeResponse]
    
    class Config:
        from_attributes = True


class NFeListResponse(BaseModel):
    """Schema para resposta de lista de NFe."""
    nfes: List[NFeResponse]
    total: int
    skip: int
    limit: int
