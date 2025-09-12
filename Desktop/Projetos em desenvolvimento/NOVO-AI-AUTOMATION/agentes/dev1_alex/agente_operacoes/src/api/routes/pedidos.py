"""
Rotas relacionadas a pedidos.

Este módulo contém os endpoints para gerenciamento de pedidos.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.core.logging import get_logger, log_business_event
from src.models.pedido import Pedido, ItemPedido, StatusPedido
from src.schemas.pedido import (
    PedidoCreate, PedidoUpdate, PedidoResponse, 
    ItemPedidoCreate, ItemPedidoResponse,
    PedidoListResponse
)
from src.services.pedidos import PedidoService

logger = get_logger("pedidos")
router = APIRouter()


@router.post("/", response_model=PedidoResponse)
async def criar_pedido(
    pedido_data: PedidoCreate,
    db: AsyncSession = Depends(get_db)
):
    """Cria um novo pedido."""
    try:
        logger.info("Criando novo pedido", cliente_id=pedido_data.cliente_id)
        
        service = PedidoService(db)
        pedido = await service.criar_pedido(pedido_data)
        
        log_business_event(
            "pedido_criado",
            pedido_id=pedido.id,
            numero_pedido=pedido.numero_pedido,
            cliente_id=pedido.cliente_id,
            valor_total=float(pedido.valor_total)
        )
        
        return pedido
        
    except Exception as e:
        logger.error("Erro ao criar pedido", error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/", response_model=PedidoListResponse)
async def listar_pedidos(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[StatusPedido] = None,
    cliente_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Lista pedidos com filtros."""
    try:
        service = PedidoService(db)
        pedidos, total = await service.listar_pedidos(
            skip=skip,
            limit=limit,
            status=status,
            cliente_id=cliente_id
        )
        
        return PedidoListResponse(
            pedidos=pedidos,
            total=total,
            skip=skip,
            limit=limit
        )
        
    except Exception as e:
        logger.error("Erro ao listar pedidos", error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/{pedido_id}", response_model=PedidoResponse)
async def obter_pedido(
    pedido_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Obtém um pedido específico."""
    try:
        service = PedidoService(db)
        pedido = await service.obter_pedido(pedido_id)
        
        if not pedido:
            raise HTTPException(status_code=404, detail="Pedido não encontrado")
        
        return pedido
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Erro ao obter pedido", pedido_id=pedido_id, error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.put("/{pedido_id}", response_model=PedidoResponse)
async def atualizar_pedido(
    pedido_id: int,
    pedido_data: PedidoUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Atualiza um pedido existente."""
    try:
        service = PedidoService(db)
        pedido = await service.atualizar_pedido(pedido_id, pedido_data)
        
        if not pedido:
            raise HTTPException(status_code=404, detail="Pedido não encontrado")
        
        log_business_event(
            "pedido_atualizado",
            pedido_id=pedido.id,
            numero_pedido=pedido.numero_pedido,
            status=pedido.status
        )
        
        return pedido
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Erro ao atualizar pedido", pedido_id=pedido_id, error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/{pedido_id}/aprovar", response_model=PedidoResponse)
async def aprovar_pedido(
    pedido_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Aprova um pedido."""
    try:
        service = PedidoService(db)
        pedido = await service.aprovar_pedido(pedido_id)
        
        if not pedido:
            raise HTTPException(status_code=404, detail="Pedido não encontrado")
        
        log_business_event(
            "pedido_aprovado",
            pedido_id=pedido.id,
            numero_pedido=pedido.numero_pedido,
            cliente_id=pedido.cliente_id
        )
        
        return pedido
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Erro ao aprovar pedido", pedido_id=pedido_id, error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/{pedido_id}/rejeitar", response_model=PedidoResponse)
async def rejeitar_pedido(
    pedido_id: int,
    motivo: str = Query(..., description="Motivo da rejeição"),
    db: AsyncSession = Depends(get_db)
):
    """Rejeita um pedido."""
    try:
        service = PedidoService(db)
        pedido = await service.rejeitar_pedido(pedido_id, motivo)
        
        if not pedido:
            raise HTTPException(status_code=404, detail="Pedido não encontrado")
        
        log_business_event(
            "pedido_rejeitado",
            pedido_id=pedido.id,
            numero_pedido=pedido.numero_pedido,
            motivo=motivo
        )
        
        return pedido
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Erro ao rejeitar pedido", pedido_id=pedido_id, error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/{pedido_id}/cancelar", response_model=PedidoResponse)
async def cancelar_pedido(
    pedido_id: int,
    motivo: str = Query(..., description="Motivo do cancelamento"),
    db: AsyncSession = Depends(get_db)
):
    """Cancela um pedido."""
    try:
        service = PedidoService(db)
        pedido = await service.cancelar_pedido(pedido_id, motivo)
        
        if not pedido:
            raise HTTPException(status_code=404, detail="Pedido não encontrado")
        
        log_business_event(
            "pedido_cancelado",
            pedido_id=pedido.id,
            numero_pedido=pedido.numero_pedido,
            motivo=motivo
        )
        
        return pedido
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Erro ao cancelar pedido", pedido_id=pedido_id, error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/{pedido_id}/itens", response_model=List[ItemPedidoResponse])
async def listar_itens_pedido(
    pedido_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Lista os itens de um pedido."""
    try:
        service = PedidoService(db)
        itens = await service.listar_itens_pedido(pedido_id)
        
        return itens
        
    except Exception as e:
        logger.error("Erro ao listar itens do pedido", pedido_id=pedido_id, error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/{pedido_id}/itens", response_model=ItemPedidoResponse)
async def adicionar_item_pedido(
    pedido_id: int,
    item_data: ItemPedidoCreate,
    db: AsyncSession = Depends(get_db)
):
    """Adiciona um item a um pedido."""
    try:
        service = PedidoService(db)
        item = await service.adicionar_item_pedido(pedido_id, item_data)
        
        if not item:
            raise HTTPException(status_code=404, detail="Pedido não encontrado")
        
        log_business_event(
            "item_adicionado_pedido",
            pedido_id=pedido_id,
            item_id=item.id,
            produto_codigo=item.produto_codigo,
            quantidade=float(item.quantidade)
        )
        
        return item
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Erro ao adicionar item ao pedido", pedido_id=pedido_id, error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
