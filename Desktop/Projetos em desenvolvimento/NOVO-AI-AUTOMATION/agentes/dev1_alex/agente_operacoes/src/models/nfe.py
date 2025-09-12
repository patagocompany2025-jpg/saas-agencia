"""
Modelos relacionados a NFe (Nota Fiscal Eletrônica).

Este módulo contém os modelos para NFe e itens de NFe.
"""

from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.types import DECIMAL as SQLDecimal
from sqlalchemy.orm import relationship

from src.core.database import Base


class StatusNFe(str, Enum):
    """Status possíveis para uma NFe."""
    RASCUNHO = "rascunho"
    VALIDADA = "validada"
    AUTORIZADA = "autorizada"
    REJEITADA = "rejeitada"
    CANCELADA = "cancelada"
    INUTILIZADA = "inutilizada"
    CONTINGENCIA = "contingencia"


class TipoEmissao(str, Enum):
    """Tipos de emissão de NFe."""
    NORMAL = "normal"
    CONTINGENCIA_FS_IA = "contingencia_fs_ia"
    CONTINGENCIA_SCAN = "contingencia_scan"
    CONTINGENCIA_DPEC = "contingencia_dpec"
    CONTINGENCIA_FS_DA = "contingencia_fs_da"
    CONTINGENCIA_SVC_AN = "contingencia_svc_an"
    CONTINGENCIA_SVC_RS = "contingencia_svc_rs"
    OFFLINE_NFCe = "offline_nfce"


class NFe(Base):
    """Modelo para Nota Fiscal Eletrônica."""
    
    __tablename__ = "nfe"
    
    # Identificação
    id = Column(Integer, primary_key=True, index=True)
    numero = Column(Integer, nullable=False, index=True)
    serie = Column(Integer, nullable=False, default=1)
    chave_acesso = Column(String(44), unique=True, index=True)  # Chave de acesso da NFe
    
    # Referências
    pedido_id = Column(Integer, ForeignKey("pedidos.id"))
    codigo_externo = Column(String(100), index=True)  # Código do sistema externo
    
    # Emissão
    data_emissao = Column(DateTime, default=datetime.utcnow, nullable=False)
    data_saida_entrada = Column(DateTime)
    tipo_emissao = Column(SQLEnum(TipoEmissao), default=TipoEmissao.NORMAL)
    
    # Status
    status = Column(SQLEnum(StatusNFe), default=StatusNFe.RASCUNHO, nullable=False)
    status_sefaz = Column(String(50))  # Status retornado pela SEFAZ
    
    # Valores
    valor_produtos = Column(SQLDecimal(10, 2), default=0)
    valor_servicos = Column(SQLDecimal(10, 2), default=0)
    valor_desconto = Column(SQLDecimal(10, 2), default=0)
    valor_frete = Column(SQLDecimal(10, 2), default=0)
    valor_seguro = Column(SQLDecimal(10, 2), default=0)
    valor_outros = Column(SQLDecimal(10, 2), default=0)
    valor_total = Column(SQLDecimal(10, 2), nullable=False, default=0)
    
    # Impostos
    base_icms = Column(SQLDecimal(10, 2), default=0)
    valor_icms = Column(SQLDecimal(10, 2), default=0)
    base_ipi = Column(SQLDecimal(10, 2), default=0)
    valor_ipi = Column(SQLDecimal(10, 2), default=0)
    base_pis = Column(SQLDecimal(10, 2), default=0)
    valor_pis = Column(SQLDecimal(10, 2), default=0)
    base_cofins = Column(SQLDecimal(10, 2), default=0)
    valor_cofins = Column(SQLDecimal(10, 2), default=0)
    
    # Destinatário
    destinatario_cnpj = Column(String(14))
    destinatario_cpf = Column(String(11))
    destinatario_nome = Column(String(255))
    destinatario_inscricao_estadual = Column(String(20))
    destinatario_email = Column(String(255))
    
    # Endereço destinatário
    destinatario_cep = Column(String(10))
    destinatario_logradouro = Column(String(255))
    destinatario_numero = Column(String(20))
    destinatario_complemento = Column(String(100))
    destinatario_bairro = Column(String(100))
    destinatario_cidade = Column(String(100))
    destinatario_estado = Column(String(2))
    destinatario_pais = Column(String(50), default="Brasil")
    
    # Transporte
    transportadora_cnpj = Column(String(14))
    transportadora_nome = Column(String(255))
    veiculo_placa = Column(String(10))
    veiculo_uf = Column(String(2))
    
    # Informações SEFAZ
    protocolo_autorizacao = Column(String(50))
    protocolo_cancelamento = Column(String(50))
    protocolo_inutilizacao = Column(String(50))
    data_autorizacao = Column(DateTime)
    data_cancelamento = Column(DateTime)
    
    # Arquivos
    xml_assinado = Column(Text)  # XML assinado
    xml_autorizado = Column(Text)  # XML autorizado pela SEFAZ
    danfe_url = Column(String(500))  # URL do DANFE
    
    # Observações
    observacoes = Column(Text)
    informacoes_complementares = Column(Text)
    
    # Timestamps
    data_criacao = Column(DateTime, default=datetime.utcnow, nullable=False)
    data_atualizacao = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Flags
    processada_automaticamente = Column(Boolean, default=False)
    enviada_email = Column(Boolean, default=False)
    
    # Relacionamentos
    itens = relationship("ItemNFe", back_populates="nfe", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<NFe {self.numero} - {self.status}>"


class ItemNFe(Base):
    """Modelo para itens de NFe."""
    
    __tablename__ = "itens_nfe"
    
    # Identificação
    id = Column(Integer, primary_key=True, index=True)
    nfe_id = Column(Integer, ForeignKey("nfe.id"), nullable=False)
    produto_id = Column(Integer, ForeignKey("produtos.id"))
    
    # Produto
    produto_codigo = Column(String(50), nullable=False)
    produto_nome = Column(String(255), nullable=False)
    produto_descricao = Column(Text)
    ncm = Column(String(20))  # Nomenclatura Comum do Mercosul
    cfop = Column(String(10))  # Código Fiscal de Operações e Prestações
    unidade_comercial = Column(String(10), default="UN")
    
    # Quantidade e valores
    quantidade_comercial = Column(SQLDecimal(10, 3), nullable=False)
    valor_unitario_comercial = Column(SQLDecimal(10, 2), nullable=False)
    valor_total_produto = Column(SQLDecimal(10, 2), nullable=False)
    
    # Impostos
    origem = Column(String(10), default="0")  # Origem do produto (0-8)
    cst_icms = Column(String(10))  # Código de Situação Tributária ICMS
    base_icms = Column(SQLDecimal(10, 2), default=0)
    aliquota_icms = Column(SQLDecimal(5, 2), default=0)
    valor_icms = Column(SQLDecimal(10, 2), default=0)
    
    cst_ipi = Column(String(10))  # Código de Situação Tributária IPI
    base_ipi = Column(SQLDecimal(10, 2), default=0)
    aliquota_ipi = Column(SQLDecimal(5, 2), default=0)
    valor_ipi = Column(SQLDecimal(10, 2), default=0)
    
    cst_pis = Column(String(10))  # Código de Situação Tributária PIS
    base_pis = Column(SQLDecimal(10, 2), default=0)
    aliquota_pis = Column(SQLDecimal(5, 2), default=0)
    valor_pis = Column(SQLDecimal(10, 2), default=0)
    
    cst_cofins = Column(String(10))  # Código de Situação Tributária COFINS
    base_cofins = Column(SQLDecimal(10, 2), default=0)
    aliquota_cofins = Column(SQLDecimal(5, 2), default=0)
    valor_cofins = Column(SQLDecimal(10, 2), default=0)
    
    # Timestamps
    data_criacao = Column(DateTime, default=datetime.utcnow, nullable=False)
    data_atualizacao = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    nfe = relationship("NFe", back_populates="itens")
    produto = relationship("Produto")
    
    def __repr__(self):
        return f"<ItemNFe {self.produto_codigo} - Qtd: {self.quantidade_comercial}>"
