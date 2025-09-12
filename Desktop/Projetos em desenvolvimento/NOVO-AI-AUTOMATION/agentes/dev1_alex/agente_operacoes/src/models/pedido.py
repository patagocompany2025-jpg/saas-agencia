"""
Modelos relacionados a pedidos.

Este módulo contém os modelos para pedidos e itens de pedidos.
"""

from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import List, Optional

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.types import DECIMAL as SQLDecimal
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from src.core.database import Base


class StatusPedido(str, Enum):
    """Status possíveis para um pedido."""
    PENDENTE = "pendente"
    PROCESSANDO = "processando"
    APROVADO = "aprovado"
    REJEITADO = "rejeitado"
    FATURADO = "faturado"
    ENVIADO = "enviado"
    ENTREGUE = "entregue"
    CANCELADO = "cancelado"


class TipoPagamento(str, Enum):
    """Tipos de pagamento aceitos."""
    CARTAO_CREDITO = "cartao_credito"
    CARTAO_DEBITO = "cartao_debito"
    PIX = "pix"
    BOLETO = "boleto"
    TRANSFERENCIA = "transferencia"
    DINHEIRO = "dinheiro"


class Pedido(Base):
    """Modelo para pedidos."""
    
    __tablename__ = "pedidos"
    
    # Identificação
    id = Column(Integer, primary_key=True, index=True)
    numero_pedido = Column(String(50), unique=True, index=True, nullable=False)
    codigo_externo = Column(String(100), index=True)  # Código do sistema externo
    
    # Cliente
    cliente_id = Column(String(100), nullable=False, index=True)
    cliente_nome = Column(String(255), nullable=False)
    cliente_email = Column(String(255))
    cliente_telefone = Column(String(20))
    cliente_documento = Column(String(20))  # CPF/CNPJ
    
    # Endereço de entrega
    endereco_cep = Column(String(10))
    endereco_logradouro = Column(String(255))
    endereco_numero = Column(String(20))
    endereco_complemento = Column(String(100))
    endereco_bairro = Column(String(100))
    endereco_cidade = Column(String(100))
    endereco_estado = Column(String(2))
    endereco_pais = Column(String(50), default="Brasil")
    
    # Valores
    valor_subtotal = Column(SQLDecimal(10, 2), nullable=False, default=0)
    valor_desconto = Column(SQLDecimal(10, 2), default=0)
    valor_frete = Column(SQLDecimal(10, 2), default=0)
    valor_total = Column(SQLDecimal(10, 2), nullable=False, default=0)
    
    # Status e pagamento
    status = Column(SQLEnum(StatusPedido), default=StatusPedido.PENDENTE, nullable=False)
    tipo_pagamento = Column(SQLEnum(TipoPagamento))
    status_pagamento = Column(String(50), default="pendente")
    
    # Observações
    observacoes = Column(Text)
    observacoes_internas = Column(Text)
    
    # Timestamps
    data_criacao = Column(DateTime, default=datetime.utcnow, nullable=False)
    data_atualizacao = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    data_aprovacao = Column(DateTime)
    data_faturamento = Column(DateTime)
    data_envio = Column(DateTime)
    data_entrega = Column(DateTime)
    
    # Flags
    processado_automaticamente = Column(Boolean, default=False)
    requer_aprovacao_manual = Column(Boolean, default=False)
    cancelado = Column(Boolean, default=False)
    
    # Relacionamentos
    itens = relationship("ItemPedido", back_populates="pedido", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Pedido {self.numero_pedido} - {self.status}>"


class ItemPedido(Base):
    """Modelo para itens de pedidos."""
    
    __tablename__ = "itens_pedido"
    
    # Identificação
    id = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(Integer, ForeignKey("pedidos.id"), nullable=False)
    
    # Produto
    produto_id = Column(String(100), nullable=False, index=True)
    produto_codigo = Column(String(50), nullable=False)
    produto_nome = Column(String(255), nullable=False)
    produto_descricao = Column(Text)
    produto_categoria = Column(String(100))
    
    # Quantidade e valores
    quantidade = Column(SQLDecimal(10, 3), nullable=False)
    preco_unitario = Column(SQLDecimal(10, 2), nullable=False)
    valor_desconto = Column(SQLDecimal(10, 2), default=0)
    valor_total = Column(SQLDecimal(10, 2), nullable=False)
    
    # Informações adicionais
    peso = Column(SQLDecimal(10, 3))  # Peso em kg
    volume = Column(SQLDecimal(10, 3))  # Volume em m³
    dimensoes_altura = Column(SQLDecimal(8, 2))  # Altura em cm
    dimensoes_largura = Column(SQLDecimal(8, 2))  # Largura em cm
    dimensoes_profundidade = Column(SQLDecimal(8, 2))  # Profundidade em cm
    
    # Timestamps
    data_criacao = Column(DateTime, default=datetime.utcnow, nullable=False)
    data_atualizacao = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    pedido = relationship("Pedido", back_populates="itens")
    
    def __repr__(self):
        return f"<ItemPedido {self.produto_codigo} - Qtd: {self.quantidade}>"
