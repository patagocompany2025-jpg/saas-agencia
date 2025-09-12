"""
Schemas relacionados a estoque.

Este módulo contém os schemas Pydantic para validação de dados de estoque.
"""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field

from src.models.estoque import TipoMovimentacao, StatusProduto


class ProdutoBase(BaseModel):
    """Schema base para produtos."""
    codigo: str = Field(..., description="Código do produto")
    codigo_barras: Optional[str] = Field(None, description="Código de barras")
    nome: str = Field(..., description="Nome do produto")
    descricao: Optional[str] = Field(None, description="Descrição do produto")
    categoria: Optional[str] = Field(None, description="Categoria do produto")
    marca: Optional[str] = Field(None, description="Marca do produto")
    preco_custo: Optional[Decimal] = Field(None, ge=0, description="Preço de custo")
    preco_venda: Optional[Decimal] = Field(None, ge=0, description="Preço de venda")
    estoque_minimo: Optional[Decimal] = Field(0, ge=0, description="Estoque mínimo")
    estoque_maximo: Optional[Decimal] = Field(0, ge=0, description="Estoque máximo")
    unidade_medida: str = Field("UN", description="Unidade de medida")
    ncm: Optional[str] = Field(None, description="NCM")
    cfop: Optional[str] = Field(None, description="CFOP")
    origem: str = Field("0", description="Origem do produto")


class ProdutoCreate(ProdutoBase):
    """Schema para criação de produto."""
    pass


class ProdutoUpdate(BaseModel):
    """Schema para atualização de produto."""
    nome: Optional[str] = Field(None, description="Nome do produto")
    descricao: Optional[str] = Field(None, description="Descrição do produto")
    categoria: Optional[str] = Field(None, description="Categoria do produto")
    marca: Optional[str] = Field(None, description="Marca do produto")
    preco_custo: Optional[Decimal] = Field(None, ge=0, description="Preço de custo")
    preco_venda: Optional[Decimal] = Field(None, ge=0, description="Preço de venda")
    estoque_minimo: Optional[Decimal] = Field(None, ge=0, description="Estoque mínimo")
    estoque_maximo: Optional[Decimal] = Field(None, ge=0, description="Estoque máximo")
    status: Optional[StatusProduto] = Field(None, description="Status do produto")
    ativo: Optional[bool] = Field(None, description="Produto ativo")


class ProdutoResponse(ProdutoBase):
    """Schema para resposta de produto."""
    id: int
    estoque_atual: Decimal
    estoque_reservado: Decimal
    estoque_disponivel: Decimal
    status: StatusProduto
    ativo: bool
    data_criacao: datetime
    data_atualizacao: datetime
    
    class Config:
        from_attributes = True


class EstoqueResponse(BaseModel):
    """Schema para resposta de estoque."""
    id: int
    produto_id: int
    localizacao: str
    endereco: Optional[str]
    quantidade_atual: Decimal
    quantidade_reservada: Decimal
    quantidade_disponivel: Decimal
    estoque_minimo: Decimal
    estoque_maximo: Decimal
    data_criacao: datetime
    data_atualizacao: datetime
    
    class Config:
        from_attributes = True


class MovimentacaoEstoqueCreate(BaseModel):
    """Schema para criação de movimentação de estoque."""
    produto_id: int = Field(..., description="ID do produto")
    tipo: TipoMovimentacao = Field(..., description="Tipo de movimentação")
    quantidade: Decimal = Field(..., description="Quantidade")
    origem_tipo: Optional[str] = Field(None, description="Tipo de origem")
    origem_id: Optional[str] = Field(None, description="ID da origem")
    localizacao_origem: Optional[str] = Field(None, description="Localização origem")
    localizacao_destino: Optional[str] = Field(None, description="Localização destino")
    observacoes: Optional[str] = Field(None, description="Observações")
    usuario: Optional[str] = Field(None, description="Usuário responsável")


class MovimentacaoEstoqueResponse(BaseModel):
    """Schema para resposta de movimentação de estoque."""
    id: int
    produto_id: int
    tipo: TipoMovimentacao
    quantidade: Decimal
    quantidade_anterior: Optional[Decimal]
    quantidade_posterior: Optional[Decimal]
    origem_tipo: Optional[str]
    origem_id: Optional[str]
    localizacao_origem: Optional[str]
    localizacao_destino: Optional[str]
    observacoes: Optional[str]
    usuario: Optional[str]
    data_movimentacao: datetime
    data_criacao: datetime
    
    class Config:
        from_attributes = True


class ProdutoListResponse(BaseModel):
    """Schema para resposta de lista de produtos."""
    produtos: List[ProdutoResponse]
    total: int
    skip: int
    limit: int
