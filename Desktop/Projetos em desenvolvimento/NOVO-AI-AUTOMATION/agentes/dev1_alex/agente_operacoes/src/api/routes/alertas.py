"""
Rotas relacionadas a alertas e notificações.

Este módulo contém os endpoints para gerenciamento de alertas.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.core.logging import get_logger, log_business_event
from src.models.alerta import Alerta, TipoAlerta, PrioridadeAlerta, StatusAlerta
from src.schemas.alerta import (
    AlertaCreate, AlertaUpdate, AlertaResponse,
    AlertaListResponse
)
from src.services.alertas import AlertaService

logger = get_logger("alertas")
router = APIRouter()


@router.get("/", response_model=AlertaListResponse)
async def listar_alertas(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    tipo: Optional[TipoAlerta] = None,
    prioridade: Optional[PrioridadeAlerta] = None,
    status: Optional[StatusAlerta] = None,
    ativo: Optional[bool] = None,
    db: AsyncSession = Depends(get_db)
):
    """Lista alertas com filtros."""
    try:
        service = AlertaService(db)
        alertas, total = await service.listar_alertas(
            skip=skip,
            limit=limit,
            tipo=tipo,
            prioridade=prioridade,
            status=status,
            ativo=ativo
        )
        
        return AlertaListResponse(
            alertas=alertas,
            total=total,
            skip=skip,
            limit=limit
        )
        
    except Exception as e:
        logger.error("Erro ao listar alertas", error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/{alerta_id}", response_model=AlertaResponse)
async def obter_alerta(
    alerta_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Obtém um alerta específico."""
    try:
        service = AlertaService(db)
        alerta = await service.obter_alerta(alerta_id)
        
        if not alerta:
            raise HTTPException(status_code=404, detail="Alerta não encontrado")
        
        return alerta
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Erro ao obter alerta", alerta_id=alerta_id, error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/", response_model=AlertaResponse)
async def criar_alerta(
    alerta_data: AlertaCreate,
    db: AsyncSession = Depends(get_db)
):
    """Cria um novo alerta."""
    try:
        service = AlertaService(db)
        alerta = await service.criar_alerta(alerta_data)
        
        log_business_event(
            "alerta_criado",
            alerta_id=alerta.id,
            tipo=alerta.tipo,
            prioridade=alerta.prioridade
        )
        
        return alerta
        
    except Exception as e:
        logger.error("Erro ao criar alerta", error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.put("/{alerta_id}", response_model=AlertaResponse)
async def atualizar_alerta(
    alerta_id: int,
    alerta_data: AlertaUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Atualiza um alerta existente."""
    try:
        service = AlertaService(db)
        alerta = await service.atualizar_alerta(alerta_id, alerta_data)
        
        if not alerta:
            raise HTTPException(status_code=404, detail="Alerta não encontrado")
        
        log_business_event(
            "alerta_atualizado",
            alerta_id=alerta.id,
            status=alerta.status
        )
        
        return alerta
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Erro ao atualizar alerta", alerta_id=alerta_id, error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/{alerta_id}/marcar-lido", response_model=AlertaResponse)
async def marcar_alerta_lido(
    alerta_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Marca um alerta como lido."""
    try:
        service = AlertaService(db)
        alerta = await service.marcar_lido(alerta_id)
        
        if not alerta:
            raise HTTPException(status_code=404, detail="Alerta não encontrado")
        
        log_business_event(
            "alerta_marcado_lido",
            alerta_id=alerta.id,
            tipo=alerta.tipo
        )
        
        return alerta
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Erro ao marcar alerta como lido", alerta_id=alerta_id, error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/{alerta_id}/resolver", response_model=AlertaResponse)
async def resolver_alerta(
    alerta_id: int,
    observacoes: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Resolve um alerta."""
    try:
        service = AlertaService(db)
        alerta = await service.resolver_alerta(alerta_id, observacoes)
        
        if not alerta:
            raise HTTPException(status_code=404, detail="Alerta não encontrado")
        
        log_business_event(
            "alerta_resolvido",
            alerta_id=alerta.id,
            tipo=alerta.tipo,
            observacoes=observacoes
        )
        
        return alerta
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Erro ao resolver alerta", alerta_id=alerta_id, error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/{alerta_id}/ignorar", response_model=AlertaResponse)
async def ignorar_alerta(
    alerta_id: int,
    motivo: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Ignora um alerta."""
    try:
        service = AlertaService(db)
        alerta = await service.ignorar_alerta(alerta_id, motivo)
        
        if not alerta:
            raise HTTPException(status_code=404, detail="Alerta não encontrado")
        
        log_business_event(
            "alerta_ignorado",
            alerta_id=alerta.id,
            tipo=alerta.tipo,
            motivo=motivo
        )
        
        return alerta
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Erro ao ignorar alerta", alerta_id=alerta_id, error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/dashboard/resumo")
async def obter_resumo_alertas(
    db: AsyncSession = Depends(get_db)
):
    """Obtém resumo dos alertas para dashboard."""
    try:
        service = AlertaService(db)
        resumo = await service.obter_resumo_alertas()
        
        return resumo
        
    except Exception as e:
        logger.error("Erro ao obter resumo de alertas", error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/processar-pendentes")
async def processar_alertas_pendentes(
    db: AsyncSession = Depends(get_db)
):
    """Processa alertas pendentes de envio."""
    try:
        service = AlertaService(db)
        resultado = await service.processar_alertas_pendentes()
        
        log_business_event(
            "alertas_processados",
            total_processados=resultado["total_processados"],
            sucessos=resultado["sucessos"],
            erros=resultado["erros"]
        )
        
        return resultado
        
    except Exception as e:
        logger.error("Erro ao processar alertas pendentes", error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
