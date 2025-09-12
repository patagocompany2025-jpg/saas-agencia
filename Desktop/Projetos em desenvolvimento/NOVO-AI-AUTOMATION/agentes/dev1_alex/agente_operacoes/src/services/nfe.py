"""
Serviço de gerenciamento de NFe.

Este módulo contém a lógica de negócio para NFe.
"""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload

from src.core.logging import get_logger, log_business_event
from src.models.nfe import NFe, ItemNFe, StatusNFe, TipoEmissao
from src.schemas.nfe import NFeCreate, NFeUpdate

logger = get_logger("nfe_service")


class NFeService:
    """Serviço para gerenciamento de NFe."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def criar_nfe(self, nfe_data: NFeCreate) -> NFe:
        """Cria uma nova NFe."""
        try:
            # Gerar número da NFe
            numero = await self._gerar_numero_nfe()
            
            # Criar NFe
            nfe = NFe(
                numero=numero,
                serie=1,
                pedido_id=nfe_data.pedido_id,
                destinatario_cnpj=nfe_data.destinatario_cnpj,
                destinatario_cpf=nfe_data.destinatario_cpf,
                destinatario_nome=nfe_data.destinatario_nome,
                destinatario_inscricao_estadual=nfe_data.destinatario_inscricao_estadual,
                destinatario_email=nfe_data.destinatario_email,
                destinatario_cep=nfe_data.destinatario_cep,
                destinatario_logradouro=nfe_data.destinatario_logradouro,
                destinatario_numero=nfe_data.destinatario_numero,
                destinatario_complemento=nfe_data.destinatario_complemento,
                destinatario_bairro=nfe_data.destinatario_bairro,
                destinatario_cidade=nfe_data.destinatario_cidade,
                destinatario_estado=nfe_data.destinatario_estado,
                destinatario_pais=nfe_data.destinatario_pais,
                valor_produtos=nfe_data.valor_produtos,
                valor_servicos=nfe_data.valor_servicos,
                valor_desconto=nfe_data.valor_desconto,
                valor_frete=nfe_data.valor_frete,
                valor_total=nfe_data.valor_total,
                observacoes=nfe_data.observacoes,
                informacoes_complementares=nfe_data.informacoes_complementares,
                status=StatusNFe.RASCUNHO,
                tipo_emissao=TipoEmissao.NORMAL
            )
            
            self.db.add(nfe)
            await self.db.flush()  # Para obter o ID
            
            # Criar itens da NFe
            for item_data in nfe_data.itens:
                item = ItemNFe(
                    nfe_id=nfe.id,
                    produto_codigo=item_data.produto_codigo,
                    produto_nome=item_data.produto_nome,
                    produto_descricao=item_data.produto_descricao,
                    ncm=item_data.ncm,
                    cfop=item_data.cfop,
                    unidade_comercial=item_data.unidade_comercial,
                    quantidade_comercial=item_data.quantidade_comercial,
                    valor_unitario_comercial=item_data.valor_unitario_comercial,
                    valor_total_produto=item_data.valor_total_produto,
                    origem="0"
                )
                
                self.db.add(item)
            
            await self.db.commit()
            await self.db.refresh(nfe)
            
            # Carregar itens
            await self.db.refresh(nfe, ['itens'])
            
            return nfe
            
        except Exception as e:
            await self.db.rollback()
            logger.error("Erro ao criar NFe", error=str(e))
            raise
    
    async def listar_nfe(
        self,
        skip: int = 0,
        limit: int = 100,
        status: Optional[StatusNFe] = None,
        pedido_id: Optional[int] = None
    ) -> Tuple[List[NFe], int]:
        """Lista NFe com filtros."""
        try:
            # Query base
            query = select(NFe).options(selectinload(NFe.itens))
            
            # Aplicar filtros
            conditions = []
            if status:
                conditions.append(NFe.status == status)
            if pedido_id:
                conditions.append(NFe.pedido_id == pedido_id)
            
            if conditions:
                query = query.where(and_(*conditions))
            
            # Contar total
            count_query = select(func.count(NFe.id))
            if conditions:
                count_query = count_query.where(and_(*conditions))
            
            total_result = await self.db.execute(count_query)
            total = total_result.scalar()
            
            # Aplicar paginação e ordenação
            query = query.order_by(NFe.data_criacao.desc()).offset(skip).limit(limit)
            
            result = await self.db.execute(query)
            nfes = result.scalars().all()
            
            return list(nfes), total
            
        except Exception as e:
            logger.error("Erro ao listar NFe", error=str(e))
            raise
    
    async def obter_nfe(self, nfe_id: int) -> Optional[NFe]:
        """Obtém uma NFe específica."""
        try:
            query = select(NFe).options(selectinload(NFe.itens)).where(NFe.id == nfe_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
            
        except Exception as e:
            logger.error("Erro ao obter NFe", nfe_id=nfe_id, error=str(e))
            raise
    
    async def validar_nfe(self, nfe_id: int) -> Optional[NFe]:
        """Valida uma NFe."""
        try:
            nfe = await self.obter_nfe(nfe_id)
            if not nfe:
                return None
            
            if nfe.status != StatusNFe.RASCUNHO:
                raise ValueError(f"NFe não pode ser validada. Status atual: {nfe.status}")
            
            # Aqui seria feita a validação real dos dados fiscais
            # Por enquanto, apenas mudamos o status
            nfe.status = StatusNFe.VALIDADA
            nfe.data_atualizacao = datetime.utcnow()
            
            await self.db.commit()
            await self.db.refresh(nfe)
            
            return nfe
            
        except Exception as e:
            await self.db.rollback()
            logger.error("Erro ao validar NFe", nfe_id=nfe_id, error=str(e))
            raise
    
    async def autorizar_nfe(self, nfe_id: int) -> Optional[NFe]:
        """Autoriza uma NFe na SEFAZ."""
        try:
            nfe = await self.obter_nfe(nfe_id)
            if not nfe:
                return None
            
            if nfe.status not in [StatusNFe.VALIDADA, StatusNFe.RASCUNHO]:
                raise ValueError(f"NFe não pode ser autorizada. Status atual: {nfe.status}")
            
            # Aqui seria feita a autorização real na SEFAZ
            # Por enquanto, apenas mudamos o status
            nfe.status = StatusNFe.AUTORIZADA
            nfe.data_autorizacao = datetime.utcnow()
            nfe.data_atualizacao = datetime.utcnow()
            nfe.protocolo_autorizacao = f"PROT{nfe.numero:010d}"
            nfe.chave_acesso = f"12345678901234567890123456789012345678901234"
            
            await self.db.commit()
            await self.db.refresh(nfe)
            
            return nfe
            
        except Exception as e:
            await self.db.rollback()
            logger.error("Erro ao autorizar NFe", nfe_id=nfe_id, error=str(e))
            raise
    
    async def cancelar_nfe(self, nfe_id: int, justificativa: str) -> Optional[NFe]:
        """Cancela uma NFe."""
        try:
            nfe = await self.obter_nfe(nfe_id)
            if not nfe:
                return None
            
            if nfe.status not in [StatusNFe.AUTORIZADA, StatusNFe.VALIDADA]:
                raise ValueError(f"NFe não pode ser cancelada. Status atual: {nfe.status}")
            
            # Aqui seria feito o cancelamento real na SEFAZ
            # Por enquanto, apenas mudamos o status
            nfe.status = StatusNFe.CANCELADA
            nfe.data_cancelamento = datetime.utcnow()
            nfe.data_atualizacao = datetime.utcnow()
            nfe.protocolo_cancelamento = f"CANC{nfe.numero:010d}"
            nfe.observacoes = f"{nfe.observacoes or ''}\nCancelada: {justificativa}".strip()
            
            await self.db.commit()
            await self.db.refresh(nfe)
            
            return nfe
            
        except Exception as e:
            await self.db.rollback()
            logger.error("Erro ao cancelar NFe", nfe_id=nfe_id, error=str(e))
            raise
    
    async def obter_danfe(self, nfe_id: int) -> Optional[str]:
        """Obtém o DANFE de uma NFe."""
        try:
            nfe = await self.obter_nfe(nfe_id)
            if not nfe:
                return None
            
            if nfe.status != StatusNFe.AUTORIZADA:
                return None
            
            # Aqui seria gerado o DANFE real
            # Por enquanto, retornamos uma URL fictícia
            return f"https://danfe.example.com/{nfe.chave_acesso}.pdf"
            
        except Exception as e:
            logger.error("Erro ao obter DANFE", nfe_id=nfe_id, error=str(e))
            raise
    
    async def obter_xml(self, nfe_id: int, tipo: str = "autorizado") -> Optional[str]:
        """Obtém o XML de uma NFe."""
        try:
            nfe = await self.obter_nfe(nfe_id)
            if not nfe:
                return None
            
            if tipo == "autorizado" and nfe.status != StatusNFe.AUTORIZADA:
                return None
            
            # Aqui seria retornado o XML real
            # Por enquanto, retornamos um XML fictício
            return f"<nfe><numero>{nfe.numero}</numero><status>{nfe.status}</status></nfe>"
            
        except Exception as e:
            logger.error("Erro ao obter XML", nfe_id=nfe_id, error=str(e))
            raise
    
    async def _gerar_numero_nfe(self) -> int:
        """Gera um número único para a NFe."""
        try:
            # Buscar o último número de NFe
            query = select(func.max(NFe.numero))
            result = await self.db.execute(query)
            last_numero = result.scalar() or 0
            
            return last_numero + 1
            
        except Exception as e:
            logger.error("Erro ao gerar número da NFe", error=str(e))
            raise
