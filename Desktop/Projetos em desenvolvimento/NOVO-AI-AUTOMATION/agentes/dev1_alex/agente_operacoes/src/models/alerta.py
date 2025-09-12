"""
Modelos relacionados a alertas e notificações.

Este módulo contém os modelos para alertas do sistema.
"""

from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, Enum as SQLEnum, JSON
from sqlalchemy.types import DECIMAL as SQLDecimal
from sqlalchemy.orm import relationship

from src.core.database import Base


class TipoAlerta(str, Enum):
    """Tipos de alertas do sistema."""
    ESTOQUE_BAIXO = "estoque_baixo"
    ESTOQUE_ZERADO = "estoque_zerado"
    PEDIDO_PENDENTE = "pedido_pendente"
    NFE_REJEITADA = "nfe_rejeitada"
    FRETE_NAO_COTADO = "frete_nao_cotado"
    PAGAMENTO_ATRASADO = "pagamento_atrasado"
    SISTEMA_ERRO = "sistema_erro"
    INTEGRACAO_FALHA = "integracao_falha"
    REPOSICAO_SUGERIDA = "reposicao_sugerida"
    PRAZO_ENTREGA = "prazo_entrega"


class PrioridadeAlerta(str, Enum):
    """Prioridades de alertas."""
    BAIXA = "baixa"
    MEDIA = "media"
    ALTA = "alta"
    CRITICA = "critica"


class StatusAlerta(str, Enum):
    """Status dos alertas."""
    PENDENTE = "pendente"
    ENVIADO = "enviado"
    LIDO = "lido"
    RESOLVIDO = "resolvido"
    IGNORADO = "ignorado"
    EXPIRADO = "expirado"


class CanalNotificacao(str, Enum):
    """Canais de notificação."""
    EMAIL = "email"
    WHATSAPP = "whatsapp"
    SMS = "sms"
    SISTEMA = "sistema"
    WEBHOOK = "webhook"


class Alerta(Base):
    """Modelo para alertas do sistema."""
    
    __tablename__ = "alertas"
    
    # Identificação
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(50), unique=True, index=True, nullable=False)
    
    # Classificação
    tipo = Column(SQLEnum(TipoAlerta), nullable=False, index=True)
    prioridade = Column(SQLEnum(PrioridadeAlerta), default=PrioridadeAlerta.MEDIA, nullable=False)
    status = Column(SQLEnum(StatusAlerta), default=StatusAlerta.PENDENTE, nullable=False)
    
    # Conteúdo
    titulo = Column(String(255), nullable=False)
    mensagem = Column(Text, nullable=False)
    descricao = Column(Text)
    
    # Referências
    entidade_tipo = Column(String(50))  # pedido, produto, nfe, etc.
    entidade_id = Column(String(100))  # ID da entidade relacionada
    pedido_id = Column(Integer, ForeignKey("pedidos.id"))
    produto_id = Column(Integer, ForeignKey("produtos.id"))
    nfe_id = Column(Integer, ForeignKey("nfe.id"))
    
    # Dados adicionais
    dados_extras = Column(JSON)  # Dados específicos do tipo de alerta
    
    # Notificações
    canais_notificacao = Column(JSON)  # Lista de canais para notificar
    destinatarios = Column(JSON)  # Lista de destinatários
    
    # Controle de envio
    tentativas_envio = Column(Integer, default=0)
    max_tentativas = Column(Integer, default=3)
    proximo_envio = Column(DateTime)  # Próxima tentativa de envio
    data_ultimo_envio = Column(DateTime)
    
    # Timestamps
    data_criacao = Column(DateTime, default=datetime.utcnow, nullable=False)
    data_atualizacao = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    data_leitura = Column(DateTime)
    data_resolucao = Column(DateTime)
    data_expiracao = Column(DateTime)  # Data de expiração do alerta
    
    # Flags
    ativo = Column(Boolean, default=True, nullable=False)
    processado_automaticamente = Column(Boolean, default=False)
    requer_acao_manual = Column(Boolean, default=False)
    
    # Relacionamentos
    pedido = relationship("Pedido")
    produto = relationship("Produto")
    nfe = relationship("NFe")
    
    def __repr__(self):
        return f"<Alerta {self.codigo} - {self.tipo} - {self.prioridade}>"
