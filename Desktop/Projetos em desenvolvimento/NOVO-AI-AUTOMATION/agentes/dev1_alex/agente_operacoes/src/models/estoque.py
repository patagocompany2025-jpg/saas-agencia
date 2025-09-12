"""
Modelos relacionados a estoque.

Este módulo contém os modelos para produtos, estoque e movimentações.
"""

from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.types import DECIMAL as SQLDecimal
from sqlalchemy.orm import relationship

from src.core.database import Base


class TipoMovimentacao(str, Enum):
    """Tipos de movimentação de estoque."""
    ENTRADA = "entrada"
    SAIDA = "saida"
    AJUSTE = "ajuste"
    TRANSFERENCIA = "transferencia"
    PERDA = "perda"
    DEVOLUCAO = "devolucao"


class StatusProduto(str, Enum):
    """Status do produto."""
    ATIVO = "ativo"
    INATIVO = "inativo"
    DESCONTINUADO = "descontinuado"
    FORA_LINHA = "fora_linha"


class Produto(Base):
    """Modelo para produtos."""
    
    __tablename__ = "produtos"
    
    # Identificação
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(50), unique=True, index=True, nullable=False)
    codigo_barras = Column(String(50), index=True)
    codigo_externo = Column(String(100), index=True)  # Código do sistema externo
    
    # Informações básicas
    nome = Column(String(255), nullable=False)
    descricao = Column(Text)
    categoria = Column(String(100))
    subcategoria = Column(String(100))
    marca = Column(String(100))
    modelo = Column(String(100))
    
    # Características físicas
    peso = Column(SQLDecimal(10, 3))  # Peso em kg
    volume = Column(SQLDecimal(10, 3))  # Volume em m³
    dimensoes_altura = Column(SQLDecimal(8, 2))  # Altura em cm
    dimensoes_largura = Column(SQLDecimal(8, 2))  # Largura em cm
    dimensoes_profundidade = Column(SQLDecimal(8, 2))  # Profundidade em cm
    
    # Preços
    preco_custo = Column(SQLDecimal(10, 2))
    preco_venda = Column(SQLDecimal(10, 2))
    preco_promocional = Column(SQLDecimal(10, 2))
    
    # Controle de estoque
    estoque_minimo = Column(SQLDecimal(10, 3), default=0)
    estoque_maximo = Column(SQLDecimal(10, 3), default=0)
    estoque_atual = Column(SQLDecimal(10, 3), default=0)
    estoque_reservado = Column(SQLDecimal(10, 3), default=0)
    estoque_disponivel = Column(SQLDecimal(10, 3), default=0)
    
    # Status
    status = Column(SQLEnum(StatusProduto), default=StatusProduto.ATIVO, nullable=False)
    ativo = Column(Boolean, default=True, nullable=False)
    
    # Informações adicionais
    unidade_medida = Column(String(10), default="UN")  # UN, KG, L, etc.
    ncm = Column(String(20))  # Nomenclatura Comum do Mercosul
    cfop = Column(String(10))  # Código Fiscal de Operações e Prestações
    origem = Column(String(10))  # Origem do produto (0-8)
    
    # Timestamps
    data_criacao = Column(DateTime, default=datetime.utcnow, nullable=False)
    data_atualizacao = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    data_ultima_compra = Column(DateTime)
    data_ultima_venda = Column(DateTime)
    
    # Relacionamentos
    movimentacoes = relationship("MovimentacaoEstoque", back_populates="produto")
    
    def __repr__(self):
        return f"<Produto {self.codigo} - {self.nome}>"


class Estoque(Base):
    """Modelo para controle de estoque por localização."""
    
    __tablename__ = "estoque"
    
    # Identificação
    id = Column(Integer, primary_key=True, index=True)
    produto_id = Column(Integer, ForeignKey("produtos.id"), nullable=False)
    
    # Localização
    localizacao = Column(String(100), nullable=False, default="principal")
    endereco = Column(String(50))  # Endereço físico no estoque
    
    # Quantidades
    quantidade_atual = Column(SQLDecimal(10, 3), default=0)
    quantidade_reservada = Column(SQLDecimal(10, 3), default=0)
    quantidade_disponivel = Column(SQLDecimal(10, 3), default=0)
    
    # Controles
    estoque_minimo = Column(SQLDecimal(10, 3), default=0)
    estoque_maximo = Column(SQLDecimal(10, 3), default=0)
    
    # Timestamps
    data_criacao = Column(DateTime, default=datetime.utcnow, nullable=False)
    data_atualizacao = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    data_ultima_movimentacao = Column(DateTime)
    
    # Relacionamentos
    produto = relationship("Produto")
    
    def __repr__(self):
        return f"<Estoque {self.produto.codigo} - {self.localizacao}: {self.quantidade_atual}>"


class MovimentacaoEstoque(Base):
    """Modelo para movimentações de estoque."""
    
    __tablename__ = "movimentacoes_estoque"
    
    # Identificação
    id = Column(Integer, primary_key=True, index=True)
    produto_id = Column(Integer, ForeignKey("produtos.id"), nullable=False)
    
    # Movimentação
    tipo = Column(SQLEnum(TipoMovimentacao), nullable=False)
    quantidade = Column(SQLDecimal(10, 3), nullable=False)
    quantidade_anterior = Column(SQLDecimal(10, 3))
    quantidade_posterior = Column(SQLDecimal(10, 3))
    
    # Origem da movimentação
    origem_tipo = Column(String(50))  # pedido, compra, ajuste, etc.
    origem_id = Column(String(100))  # ID do documento origem
    
    # Localização
    localizacao_origem = Column(String(100))
    localizacao_destino = Column(String(100))
    
    # Informações adicionais
    observacoes = Column(Text)
    usuario = Column(String(100))  # Usuário que fez a movimentação
    
    # Timestamps
    data_movimentacao = Column(DateTime, default=datetime.utcnow, nullable=False)
    data_criacao = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relacionamentos
    produto = relationship("Produto", back_populates="movimentacoes")
    
    def __repr__(self):
        return f"<MovimentacaoEstoque {self.tipo} - {self.quantidade}>"
