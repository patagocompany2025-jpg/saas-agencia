"""
Serviço de gerenciamento de pedidos.

Este módulo contém a lógica de negócio para pedidos.
"""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload

from src.core.logging import get_logger, log_business_event
from src.models.pedido import Pedido, ItemPedido, StatusPedido
from src.schemas.pedido import PedidoCreate, PedidoUpdate, ItemPedidoCreate

logger = get_logger("pedidos_service")


class PedidoService:
    """Serviço para gerenciamento de pedidos."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def criar_pedido(self, pedido_data: PedidoCreate) -> Pedido:
        """Cria um novo pedido."""
        try:
            # Gerar número do pedido
            numero_pedido = await self._gerar_numero_pedido()
            
            # Calcular valores
            valor_subtotal = sum(
                (item.quantidade * item.preco_unitario) - (item.valor_desconto or 0)
                for item in pedido_data.itens
            )
            valor_total = valor_subtotal + (pedido_data.valor_frete or 0) - (pedido_data.valor_desconto or 0)
            
            # Criar pedido
            pedido = Pedido(
                numero_pedido=numero_pedido,
                cliente_id=pedido_data.cliente_id,
                cliente_nome=pedido_data.cliente_nome,
                cliente_email=pedido_data.cliente_email,
                cliente_telefone=pedido_data.cliente_telefone,
                cliente_documento=pedido_data.cliente_documento,
                endereco_cep=pedido_data.endereco_cep,
                endereco_logradouro=pedido_data.endereco_logradouro,
                endereco_numero=pedido_data.endereco_numero,
                endereco_complemento=pedido_data.endereco_complemento,
                endereco_bairro=pedido_data.endereco_bairro,
                endereco_cidade=pedido_data.endereco_cidade,
                endereco_estado=pedido_data.endereco_estado,
                endereco_pais=pedido_data.endereco_pais,
                valor_subtotal=valor_subtotal,
                valor_desconto=pedido_data.valor_desconto or 0,
                valor_frete=pedido_data.valor_frete or 0,
                valor_total=valor_total,
                tipo_pagamento=pedido_data.tipo_pagamento,
                observacoes=pedido_data.observacoes,
                observacoes_internas=pedido_data.observacoes_internas,
                status=StatusPedido.PENDENTE
            )
            
            self.db.add(pedido)
            await self.db.flush()  # Para obter o ID
            
            # Criar itens do pedido
            for item_data in pedido_data.itens:
                valor_total_item = (item_data.quantidade * item_data.preco_unitario) - (item_data.valor_desconto or 0)
                
                item = ItemPedido(
                    pedido_id=pedido.id,
                    produto_id=item_data.produto_id,
                    produto_codigo=item_data.produto_codigo,
                    produto_nome=item_data.produto_nome,
                    produto_descricao=item_data.produto_descricao,
                    produto_categoria=item_data.produto_categoria,
                    quantidade=item_data.quantidade,
                    preco_unitario=item_data.preco_unitario,
                    valor_desconto=item_data.valor_desconto or 0,
                    valor_total=valor_total_item,
                    peso=item_data.peso,
                    volume=item_data.volume,
                    dimensoes_altura=item_data.dimensoes_altura,
                    dimensoes_largura=item_data.dimensoes_largura,
                    dimensoes_profundidade=item_data.dimensoes_profundidade
                )
                
                self.db.add(item)
            
            await self.db.commit()
            await self.db.refresh(pedido)
            
            # Carregar itens
            await self.db.refresh(pedido, ['itens'])
            
            log_business_event(
                "pedido_criado",
                pedido_id=pedido.id,
                numero_pedido=pedido.numero_pedido,
                cliente_id=pedido.cliente_id,
                valor_total=float(pedido.valor_total)
            )
            
            return pedido
            
        except Exception as e:
            await self.db.rollback()
            logger.error("Erro ao criar pedido", error=str(e))
            raise
    
    async def listar_pedidos(
        self,
        skip: int = 0,
        limit: int = 100,
        status: Optional[StatusPedido] = None,
        cliente_id: Optional[str] = None
    ) -> Tuple[List[Pedido], int]:
        """Lista pedidos com filtros."""
        try:
            # Query base
            query = select(Pedido).options(selectinload(Pedido.itens))
            
            # Aplicar filtros
            conditions = []
            if status:
                conditions.append(Pedido.status == status)
            if cliente_id:
                conditions.append(Pedido.cliente_id == cliente_id)
            
            if conditions:
                query = query.where(and_(*conditions))
            
            # Contar total
            count_query = select(func.count(Pedido.id))
            if conditions:
                count_query = count_query.where(and_(*conditions))
            
            total_result = await self.db.execute(count_query)
            total = total_result.scalar()
            
            # Aplicar paginação e ordenação
            query = query.order_by(Pedido.data_criacao.desc()).offset(skip).limit(limit)
            
            result = await self.db.execute(query)
            pedidos = result.scalars().all()
            
            return list(pedidos), total
            
        except Exception as e:
            logger.error("Erro ao listar pedidos", error=str(e))
            raise
    
    async def obter_pedido(self, pedido_id: int) -> Optional[Pedido]:
        """Obtém um pedido específico."""
        try:
            query = select(Pedido).options(selectinload(Pedido.itens)).where(Pedido.id == pedido_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
            
        except Exception as e:
            logger.error("Erro ao obter pedido", pedido_id=pedido_id, error=str(e))
            raise
    
    async def atualizar_pedido(self, pedido_id: int, pedido_data: PedidoUpdate) -> Optional[Pedido]:
        """Atualiza um pedido existente."""
        try:
            pedido = await self.obter_pedido(pedido_id)
            if not pedido:
                return None
            
            # Atualizar campos fornecidos
            update_data = pedido_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(pedido, field, value)
            
            # Recalcular valores se necessário
            if any(field in update_data for field in ['valor_desconto', 'valor_frete']):
                valor_subtotal = sum(item.valor_total for item in pedido.itens)
                pedido.valor_total = valor_subtotal + (pedido.valor_frete or 0) - (pedido.valor_desconto or 0)
            
            pedido.data_atualizacao = datetime.utcnow()
            
            await self.db.commit()
            await self.db.refresh(pedido)
            
            return pedido
            
        except Exception as e:
            await self.db.rollback()
            logger.error("Erro ao atualizar pedido", pedido_id=pedido_id, error=str(e))
            raise
    
    async def aprovar_pedido(self, pedido_id: int) -> Optional[Pedido]:
        """Aprova um pedido."""
        try:
            pedido = await self.obter_pedido(pedido_id)
            if not pedido:
                return None
            
            if pedido.status != StatusPedido.PENDENTE:
                raise ValueError(f"Pedido não pode ser aprovado. Status atual: {pedido.status}")
            
            pedido.status = StatusPedido.APROVADO
            pedido.data_aprovacao = datetime.utcnow()
            pedido.data_atualizacao = datetime.utcnow()
            
            await self.db.commit()
            await self.db.refresh(pedido)
            
            log_business_event(
                "pedido_aprovado",
                pedido_id=pedido.id,
                numero_pedido=pedido.numero_pedido,
                cliente_id=pedido.cliente_id
            )
            
            return pedido
            
        except Exception as e:
            await self.db.rollback()
            logger.error("Erro ao aprovar pedido", pedido_id=pedido_id, error=str(e))
            raise
    
    async def rejeitar_pedido(self, pedido_id: int, motivo: str) -> Optional[Pedido]:
        """Rejeita um pedido."""
        try:
            pedido = await self.obter_pedido(pedido_id)
            if not pedido:
                return None
            
            if pedido.status not in [StatusPedido.PENDENTE, StatusPedido.PROCESSANDO]:
                raise ValueError(f"Pedido não pode ser rejeitado. Status atual: {pedido.status}")
            
            pedido.status = StatusPedido.REJEITADO
            pedido.observacoes_internas = f"{pedido.observacoes_internas or ''}\nRejeitado: {motivo}".strip()
            pedido.data_atualizacao = datetime.utcnow()
            
            await self.db.commit()
            await self.db.refresh(pedido)
            
            log_business_event(
                "pedido_rejeitado",
                pedido_id=pedido.id,
                numero_pedido=pedido.numero_pedido,
                motivo=motivo
            )
            
            return pedido
            
        except Exception as e:
            await self.db.rollback()
            logger.error("Erro ao rejeitar pedido", pedido_id=pedido_id, error=str(e))
            raise
    
    async def cancelar_pedido(self, pedido_id: int, motivo: str) -> Optional[Pedido]:
        """Cancela um pedido."""
        try:
            pedido = await self.obter_pedido(pedido_id)
            if not pedido:
                return None
            
            if pedido.status in [StatusPedido.ENTREGUE, StatusPedido.CANCELADO]:
                raise ValueError(f"Pedido não pode ser cancelado. Status atual: {pedido.status}")
            
            pedido.status = StatusPedido.CANCELADO
            pedido.cancelado = True
            pedido.observacoes_internas = f"{pedido.observacoes_internas or ''}\nCancelado: {motivo}".strip()
            pedido.data_atualizacao = datetime.utcnow()
            
            await self.db.commit()
            await self.db.refresh(pedido)
            
            log_business_event(
                "pedido_cancelado",
                pedido_id=pedido.id,
                numero_pedido=pedido.numero_pedido,
                motivo=motivo
            )
            
            return pedido
            
        except Exception as e:
            await self.db.rollback()
            logger.error("Erro ao cancelar pedido", pedido_id=pedido_id, error=str(e))
            raise
    
    async def listar_itens_pedido(self, pedido_id: int) -> List[ItemPedido]:
        """Lista os itens de um pedido."""
        try:
            query = select(ItemPedido).where(ItemPedido.pedido_id == pedido_id)
            result = await self.db.execute(query)
            return list(result.scalars().all())
            
        except Exception as e:
            logger.error("Erro ao listar itens do pedido", pedido_id=pedido_id, error=str(e))
            raise
    
    async def adicionar_item_pedido(self, pedido_id: int, item_data: ItemPedidoCreate) -> Optional[ItemPedido]:
        """Adiciona um item a um pedido."""
        try:
            pedido = await self.obter_pedido(pedido_id)
            if not pedido:
                return None
            
            if pedido.status not in [StatusPedido.PENDENTE, StatusPedido.PROCESSANDO]:
                raise ValueError(f"Não é possível adicionar itens. Status atual: {pedido.status}")
            
            valor_total_item = (item_data.quantidade * item_data.preco_unitario) - (item_data.valor_desconto or 0)
            
            item = ItemPedido(
                pedido_id=pedido_id,
                produto_id=item_data.produto_id,
                produto_codigo=item_data.produto_codigo,
                produto_nome=item_data.produto_nome,
                produto_descricao=item_data.produto_descricao,
                produto_categoria=item_data.produto_categoria,
                quantidade=item_data.quantidade,
                preco_unitario=item_data.preco_unitario,
                valor_desconto=item_data.valor_desconto or 0,
                valor_total=valor_total_item,
                peso=item_data.peso,
                volume=item_data.volume,
                dimensoes_altura=item_data.dimensoes_altura,
                dimensoes_largura=item_data.dimensoes_largura,
                dimensoes_profundidade=item_data.dimensoes_profundidade
            )
            
            self.db.add(item)
            
            # Recalcular valores do pedido
            valor_subtotal = sum(item.valor_total for item in pedido.itens) + valor_total_item
            pedido.valor_subtotal = valor_subtotal
            pedido.valor_total = valor_subtotal + (pedido.valor_frete or 0) - (pedido.valor_desconto or 0)
            pedido.data_atualizacao = datetime.utcnow()
            
            await self.db.commit()
            await self.db.refresh(item)
            
            return item
            
        except Exception as e:
            await self.db.rollback()
            logger.error("Erro ao adicionar item ao pedido", pedido_id=pedido_id, error=str(e))
            raise
    
    async def _gerar_numero_pedido(self) -> str:
        """Gera um número único para o pedido."""
        try:
            # Buscar o último número de pedido
            query = select(func.max(Pedido.id))
            result = await self.db.execute(query)
            last_id = result.scalar() or 0
            
            # Gerar número baseado no ID + timestamp
            timestamp = datetime.now().strftime("%Y%m%d")
            numero = f"PED{timestamp}{last_id + 1:06d}"
            
            return numero
            
        except Exception as e:
            logger.error("Erro ao gerar número do pedido", error=str(e))
            raise
