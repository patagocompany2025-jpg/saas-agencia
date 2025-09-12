"""
Modelos relacionados a frete e transportadoras.

Este módulo contém os modelos para cotações de frete e transportadoras.
"""

from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.types import DECIMAL as SQLDecimal
from sqlalchemy.orm import relationship

from src.core.database import Base


class StatusCotacao(str, Enum):
    """Status da cotação de frete."""
    PENDENTE = "pendente"
    PROCESSANDO = "processando"
    COTADA = "cotada"
    SELECIONADA = "selecionada"
    CONFIRMADA = "confirmada"
    REJEITADA = "rejeitada"
    EXPIRADA = "expirada"


class TipoServico(str, Enum):
    """Tipos de serviço de frete."""
    PAC = "pac"
    SEDEX = "sedex"
    SEDEX_10 = "sedex_10"
    SEDEX_12 = "sedex_12"
    SEDEX_HOJE = "sedex_hoje"
    E_SEDEX = "e_sedex"
    OUTROS = "outros"


class Transportadora(Base):
    """Modelo para transportadoras."""
    
    __tablename__ = "transportadoras"
    
    # Identificação
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(50), unique=True, index=True, nullable=False)
    nome = Column(String(255), nullable=False)
    nome_fantasia = Column(String(255))
    
    # Documentos
    cnpj = Column(String(14), unique=True, index=True)
    inscricao_estadual = Column(String(20))
    inscricao_municipal = Column(String(20))
    
    # Contato
    email = Column(String(255))
    telefone = Column(String(20))
    site = Column(String(255))
    
    # Endereço
    cep = Column(String(10))
    logradouro = Column(String(255))
    numero = Column(String(20))
    complemento = Column(String(100))
    bairro = Column(String(100))
    cidade = Column(String(100))
    estado = Column(String(2))
    pais = Column(String(50), default="Brasil")
    
    # Configurações da API
    api_url = Column(String(500))
    api_key = Column(String(255))
    api_secret = Column(String(255))
    api_timeout = Column(Integer, default=30)
    
    # Configurações de frete
    prazo_entrega_padrao = Column(Integer, default=5)  # Dias
    valor_minimo = Column(SQLDecimal(10, 2), default=0)
    valor_maximo = Column(SQLDecimal(10, 2))
    peso_maximo = Column(SQLDecimal(10, 3))  # Peso máximo em kg
    volume_maximo = Column(SQLDecimal(10, 3))  # Volume máximo em m³
    
    # Status
    ativo = Column(Boolean, default=True, nullable=False)
    disponivel = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    data_criacao = Column(DateTime, default=datetime.utcnow, nullable=False)
    data_atualizacao = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    data_ultima_cotacao = Column(DateTime)
    
    # Relacionamentos
    cotacoes = relationship("CotacaoFrete", back_populates="transportadora")
    
    def __repr__(self):
        return f"<Transportadora {self.codigo} - {self.nome}>"


class CotacaoFrete(Base):
    """Modelo para cotações de frete."""
    
    __tablename__ = "cotacoes_frete"
    
    # Identificação
    id = Column(Integer, primary_key=True, index=True)
    codigo_cotacao = Column(String(50), unique=True, index=True, nullable=False)
    pedido_id = Column(Integer, ForeignKey("pedidos.id"))
    
    # Transportadora
    transportadora_id = Column(Integer, ForeignKey("transportadoras.id"), nullable=False)
    
    # Status
    status = Column(SQLEnum(StatusCotacao), default=StatusCotacao.PENDENTE, nullable=False)
    
    # Serviço
    tipo_servico = Column(SQLEnum(TipoServico), nullable=False)
    codigo_servico = Column(String(50))  # Código específico da transportadora
    nome_servico = Column(String(255))
    
    # Valores
    valor_frete = Column(SQLDecimal(10, 2), nullable=False)
    valor_seguro = Column(SQLDecimal(10, 2), default=0)
    valor_declarado = Column(SQLDecimal(10, 2), default=0)
    valor_total = Column(SQLDecimal(10, 2), nullable=False)
    
    # Prazos
    prazo_entrega = Column(Integer, nullable=False)  # Dias úteis
    prazo_entrega_minimo = Column(Integer)
    prazo_entrega_maximo = Column(Integer)
    
    # Dimensões e peso
    peso_total = Column(SQLDecimal(10, 3), nullable=False)  # Peso total em kg
    volume_total = Column(SQLDecimal(10, 3))  # Volume total em m³
    quantidade_caixas = Column(Integer, default=1)
    
    # Endereços
    cep_origem = Column(String(10), nullable=False)
    cep_destino = Column(String(10), nullable=False)
    cidade_origem = Column(String(100), nullable=False)
    cidade_destino = Column(String(100), nullable=False)
    estado_origem = Column(String(2), nullable=False)
    estado_destino = Column(String(2), nullable=False)
    
    # Informações da API
    codigo_rastreamento = Column(String(100))
    url_rastreamento = Column(String(500))
    etiqueta_url = Column(String(500))
    
    # Validações
    erro_api = Column(Text)  # Erro retornado pela API
    codigo_erro = Column(String(50))
    mensagem_erro = Column(Text)
    
    # Configurações
    entrega_domicilio = Column(Boolean, default=True)
    entrega_sabado = Column(Boolean, default=False)
    entrega_feriado = Column(Boolean, default=False)
    coleta_agendada = Column(Boolean, default=False)
    
    # Observações
    observacoes = Column(Text)
    observacoes_internas = Column(Text)
    
    # Timestamps
    data_cotacao = Column(DateTime, default=datetime.utcnow, nullable=False)
    data_expiracao = Column(DateTime)  # Data de expiração da cotação
    data_confirmacao = Column(DateTime)
    data_coleta = Column(DateTime)
    data_entrega = Column(DateTime)
    data_criacao = Column(DateTime, default=datetime.utcnow, nullable=False)
    data_atualizacao = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Flags
    selecionada = Column(Boolean, default=False)
    confirmada = Column(Boolean, default=False)
    processada_automaticamente = Column(Boolean, default=False)
    
    # Relacionamentos
    transportadora = relationship("Transportadora", back_populates="cotacoes")
    
    def __repr__(self):
        return f"<CotacaoFrete {self.codigo_cotacao} - {self.transportadora.nome}>"
