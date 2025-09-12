"""
Rotas relacionadas a frete e transportadoras.

Este módulo contém os endpoints para gerenciamento de frete.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.core.logging import get_logger, log_business_event
from src.models.frete import CotacaoFrete, Transportadora, StatusCotacao, TipoServico
from src.schemas.frete import (
    CotacaoFreteCreate, CotacaoFreteResponse,
    TransportadoraCreate, TransportadoraResponse,
    CotacaoFreteListResponse, TransportadoraListResponse
)
from src.services.frete import FreteService

logger = get_logger("frete")
router = APIRouter()


@router.post("/cotar", response_model=List[CotacaoFreteResponse])
async def cotar_frete(
    cotacao_data: CotacaoFreteCreate,
    db: AsyncSession = Depends(get_db)
):
    """Cota frete com todas as transportadoras disponíveis."""
    try:
        logger.info("Cotando frete", pedido_id=cotacao_data.pedido_id)
        
        service = FreteService(db)
        cotacoes = await service.cotar_frete(cotacao_data)
        
        log_business_event(
            "frete_cotado",
            pedido_id=cotacao_data.pedido_id,
            total_cotacoes=len(cotacoes)
        )
        
        return cotacoes
        
    except Exception as e:
        logger.error("Erro ao cotar frete", error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/cotacoes", response_model=CotacaoFreteListResponse)
async def listar_cotacoes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[StatusCotacao] = None,
    pedido_id: Optional[int] = None,
    transportadora_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
    """Lista cotações de frete com filtros."""
    try:
        service = FreteService(db)
        cotacoes, total = await service.listar_cotacoes(
            skip=skip,
            limit=limit,
            status=status,
            pedido_id=pedido_id,
            transportadora_id=transportadora_id
        )
        
        return CotacaoFreteListResponse(
            cotacoes=cotacoes,
            total=total,
            skip=skip,
            limit=limit
        )
        
    except Exception as e:
        logger.error("Erro ao listar cotações", error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/cotacoes/{cotacao_id}", response_model=CotacaoFreteResponse)
async def obter_cotacao(
    cotacao_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Obtém uma cotação específica."""
    try:
        service = FreteService(db)
        cotacao = await service.obter_cotacao(cotacao_id)
        
        if not cotacao:
            raise HTTPException(status_code=404, detail="Cotação não encontrada")
        
        return cotacao
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Erro ao obter cotação", cotacao_id=cotacao_id, error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/cotacoes/{cotacao_id}/selecionar", response_model=CotacaoFreteResponse)
async def selecionar_cotacao(
    cotacao_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Seleciona uma cotação de frete."""
    try:
        service = FreteService(db)
        cotacao = await service.selecionar_cotacao(cotacao_id)
        
        if not cotacao:
            raise HTTPException(status_code=404, detail="Cotação não encontrada")
        
        log_business_event(
            "cotacao_selecionada",
            cotacao_id=cotacao.id,
            transportadora_id=cotacao.transportadora_id,
            valor_frete=float(cotacao.valor_frete)
        )
        
        return cotacao
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Erro ao selecionar cotação", cotacao_id=cotacao_id, error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/cotacoes/{cotacao_id}/confirmar", response_model=CotacaoFreteResponse)
async def confirmar_cotacao(
    cotacao_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Confirma uma cotação de frete."""
    try:
        service = FreteService(db)
        cotacao = await service.confirmar_cotacao(cotacao_id)
        
        if not cotacao:
            raise HTTPException(status_code=404, detail="Cotação não encontrada")
        
        log_business_event(
            "cotacao_confirmada",
            cotacao_id=cotacao.id,
            transportadora_id=cotacao.transportadora_id,
            codigo_rastreamento=cotacao.codigo_rastreamento
        )
        
        return cotacao
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Erro ao confirmar cotação", cotacao_id=cotacao_id, error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/transportadoras", response_model=TransportadoraListResponse)
async def listar_transportadoras(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    ativo: Optional[bool] = None,
    db: AsyncSession = Depends(get_db)
):
    """Lista transportadoras com filtros."""
    try:
        service = FreteService(db)
        transportadoras, total = await service.listar_transportadoras(
            skip=skip,
            limit=limit,
            ativo=ativo
        )
        
        return TransportadoraListResponse(
            transportadoras=transportadoras,
            total=total,
            skip=skip,
            limit=limit
        )
        
    except Exception as e:
        logger.error("Erro ao listar transportadoras", error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/transportadoras", response_model=TransportadoraResponse)
async def criar_transportadora(
    transportadora_data: TransportadoraCreate,
    db: AsyncSession = Depends(get_db)
):
    """Cria uma nova transportadora."""
    try:
        service = FreteService(db)
        transportadora = await service.criar_transportadora(transportadora_data)
        
        log_business_event(
            "transportadora_criada",
            transportadora_id=transportadora.id,
            codigo=transportadora.codigo,
            nome=transportadora.nome
        )
        
        return transportadora
        
    except Exception as e:
        logger.error("Erro ao criar transportadora", error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/transportadoras/{transportadora_id}", response_model=TransportadoraResponse)
async def obter_transportadora(
    transportadora_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Obtém uma transportadora específica."""
    try:
        service = FreteService(db)
        transportadora = await service.obter_transportadora(transportadora_id)
        
        if not transportadora:
            raise HTTPException(status_code=404, detail="Transportadora não encontrada")
        
        return transportadora
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Erro ao obter transportadora", transportadora_id=transportadora_id, error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/cotacoes/{cotacao_id}/rastreamento")
async def obter_rastreamento(
    cotacao_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Obtém informações de rastreamento de uma cotação."""
    try:
        service = FreteService(db)
        rastreamento = await service.obter_rastreamento(cotacao_id)
        
        if not rastreamento:
            raise HTTPException(status_code=404, detail="Rastreamento não encontrado")
        
        return rastreamento
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Erro ao obter rastreamento", cotacao_id=cotacao_id, error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
