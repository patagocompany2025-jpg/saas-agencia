"""
Rotas relacionadas a NFe (Nota Fiscal Eletrônica).

Este módulo contém os endpoints para gerenciamento de NFe.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.core.logging import get_logger, log_business_event
from src.models.nfe import NFe, StatusNFe
from src.schemas.nfe import (
    NFeCreate, NFeUpdate, NFeResponse,
    NFeListResponse
)
from src.services.nfe import NFeService

logger = get_logger("nfe")
router = APIRouter()


@router.post("/", response_model=NFeResponse)
async def criar_nfe(
    nfe_data: NFeCreate,
    db: AsyncSession = Depends(get_db)
):
    """Cria uma nova NFe."""
    try:
        logger.info("Criando nova NFe", pedido_id=nfe_data.pedido_id)
        
        service = NFeService(db)
        nfe = await service.criar_nfe(nfe_data)
        
        log_business_event(
            "nfe_criada",
            nfe_id=nfe.id,
            numero=nfe.numero,
            pedido_id=nfe.pedido_id,
            valor_total=float(nfe.valor_total)
        )
        
        return nfe
        
    except Exception as e:
        logger.error("Erro ao criar NFe", error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/", response_model=NFeListResponse)
async def listar_nfe(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[StatusNFe] = None,
    pedido_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
    """Lista NFe com filtros."""
    try:
        service = NFeService(db)
        nfes, total = await service.listar_nfe(
            skip=skip,
            limit=limit,
            status=status,
            pedido_id=pedido_id
        )
        
        return NFeListResponse(
            nfes=nfes,
            total=total,
            skip=skip,
            limit=limit
        )
        
    except Exception as e:
        logger.error("Erro ao listar NFe", error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/{nfe_id}", response_model=NFeResponse)
async def obter_nfe(
    nfe_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Obtém uma NFe específica."""
    try:
        service = NFeService(db)
        nfe = await service.obter_nfe(nfe_id)
        
        if not nfe:
            raise HTTPException(status_code=404, detail="NFe não encontrada")
        
        return nfe
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Erro ao obter NFe", nfe_id=nfe_id, error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/{nfe_id}/validar", response_model=NFeResponse)
async def validar_nfe(
    nfe_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Valida uma NFe."""
    try:
        service = NFeService(db)
        nfe = await service.validar_nfe(nfe_id)
        
        if not nfe:
            raise HTTPException(status_code=404, detail="NFe não encontrada")
        
        log_business_event(
            "nfe_validada",
            nfe_id=nfe.id,
            numero=nfe.numero,
            status=nfe.status
        )
        
        return nfe
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Erro ao validar NFe", nfe_id=nfe_id, error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/{nfe_id}/autorizar", response_model=NFeResponse)
async def autorizar_nfe(
    nfe_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Autoriza uma NFe na SEFAZ."""
    try:
        service = NFeService(db)
        nfe = await service.autorizar_nfe(nfe_id)
        
        if not nfe:
            raise HTTPException(status_code=404, detail="NFe não encontrada")
        
        log_business_event(
            "nfe_autorizada",
            nfe_id=nfe.id,
            numero=nfe.numero,
            chave_acesso=nfe.chave_acesso
        )
        
        return nfe
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Erro ao autorizar NFe", nfe_id=nfe_id, error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/{nfe_id}/cancelar", response_model=NFeResponse)
async def cancelar_nfe(
    nfe_id: int,
    justificativa: str = Query(..., description="Justificativa do cancelamento"),
    db: AsyncSession = Depends(get_db)
):
    """Cancela uma NFe."""
    try:
        service = NFeService(db)
        nfe = await service.cancelar_nfe(nfe_id, justificativa)
        
        if not nfe:
            raise HTTPException(status_code=404, detail="NFe não encontrada")
        
        log_business_event(
            "nfe_cancelada",
            nfe_id=nfe.id,
            numero=nfe.numero,
            justificativa=justificativa
        )
        
        return nfe
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Erro ao cancelar NFe", nfe_id=nfe_id, error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/{nfe_id}/danfe")
async def obter_danfe(
    nfe_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Obtém o DANFE de uma NFe."""
    try:
        service = NFeService(db)
        danfe_url = await service.obter_danfe(nfe_id)
        
        if not danfe_url:
            raise HTTPException(status_code=404, detail="DANFE não encontrado")
        
        return {"danfe_url": danfe_url}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Erro ao obter DANFE", nfe_id=nfe_id, error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/{nfe_id}/xml")
async def obter_xml(
    nfe_id: int,
    tipo: str = Query("autorizado", description="Tipo do XML: autorizado ou assinado"),
    db: AsyncSession = Depends(get_db)
):
    """Obtém o XML de uma NFe."""
    try:
        service = NFeService(db)
        xml_content = await service.obter_xml(nfe_id, tipo)
        
        if not xml_content:
            raise HTTPException(status_code=404, detail="XML não encontrado")
        
        return {"xml": xml_content}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Erro ao obter XML", nfe_id=nfe_id, error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
