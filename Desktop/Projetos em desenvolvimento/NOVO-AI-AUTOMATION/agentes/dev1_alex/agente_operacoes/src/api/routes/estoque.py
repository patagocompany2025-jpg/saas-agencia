"""
Rotas relacionadas a estoque.

Este módulo contém os endpoints para gerenciamento de estoque.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.core.logging import get_logger, log_business_event
from src.models.estoque import Produto, Estoque, MovimentacaoEstoque, TipoMovimentacao
from src.schemas.estoque import (
    ProdutoCreate, ProdutoUpdate, ProdutoResponse,
    EstoqueResponse, MovimentacaoEstoqueCreate, MovimentacaoEstoqueResponse,
    ProdutoListResponse
)
from src.services.estoque import EstoqueService

logger = get_logger("estoque")
router = APIRouter()


@router.get("/produtos", response_model=ProdutoListResponse)
async def listar_produtos(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    categoria: Optional[str] = None,
    ativo: Optional[bool] = None,
    db: AsyncSession = Depends(get_db)
):
    """Lista produtos com filtros."""
    try:
        service = EstoqueService(db)
        produtos, total = await service.listar_produtos(
            skip=skip,
            limit=limit,
            categoria=categoria,
            ativo=ativo
        )
        
        return ProdutoListResponse(
            produtos=produtos,
            total=total,
            skip=skip,
            limit=limit
        )
        
    except Exception as e:
        logger.error("Erro ao listar produtos", error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/produtos/{produto_id}", response_model=ProdutoResponse)
async def obter_produto(
    produto_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Obtém um produto específico."""
    try:
        service = EstoqueService(db)
        produto = await service.obter_produto(produto_id)
        
        if not produto:
            raise HTTPException(status_code=404, detail="Produto não encontrado")
        
        return produto
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Erro ao obter produto", produto_id=produto_id, error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/produtos", response_model=ProdutoResponse)
async def criar_produto(
    produto_data: ProdutoCreate,
    db: AsyncSession = Depends(get_db)
):
    """Cria um novo produto."""
    try:
        service = EstoqueService(db)
        produto = await service.criar_produto(produto_data)
        
        log_business_event(
            "produto_criado",
            produto_id=produto.id,
            codigo=produto.codigo,
            nome=produto.nome
        )
        
        return produto
        
    except Exception as e:
        logger.error("Erro ao criar produto", error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.put("/produtos/{produto_id}", response_model=ProdutoResponse)
async def atualizar_produto(
    produto_id: int,
    produto_data: ProdutoUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Atualiza um produto existente."""
    try:
        service = EstoqueService(db)
        produto = await service.atualizar_produto(produto_id, produto_data)
        
        if not produto:
            raise HTTPException(status_code=404, detail="Produto não encontrado")
        
        log_business_event(
            "produto_atualizado",
            produto_id=produto.id,
            codigo=produto.codigo,
            nome=produto.nome
        )
        
        return produto
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Erro ao atualizar produto", produto_id=produto_id, error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/produtos/{produto_id}/estoque", response_model=List[EstoqueResponse])
async def obter_estoque_produto(
    produto_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Obtém o estoque de um produto."""
    try:
        service = EstoqueService(db)
        estoque = await service.obter_estoque_produto(produto_id)
        
        return estoque
        
    except Exception as e:
        logger.error("Erro ao obter estoque do produto", produto_id=produto_id, error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/movimentacoes", response_model=MovimentacaoEstoqueResponse)
async def criar_movimentacao(
    movimentacao_data: MovimentacaoEstoqueCreate,
    db: AsyncSession = Depends(get_db)
):
    """Cria uma movimentação de estoque."""
    try:
        service = EstoqueService(db)
        movimentacao = await service.criar_movimentacao(movimentacao_data)
        
        log_business_event(
            "movimentacao_estoque_criada",
            movimentacao_id=movimentacao.id,
            produto_id=movimentacao.produto_id,
            tipo=movimentacao.tipo,
            quantidade=float(movimentacao.quantidade)
        )
        
        return movimentacao
        
    except Exception as e:
        logger.error("Erro ao criar movimentação", error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/movimentacoes", response_model=List[MovimentacaoEstoqueResponse])
async def listar_movimentacoes(
    produto_id: Optional[int] = None,
    tipo: Optional[TipoMovimentacao] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db)
):
    """Lista movimentações de estoque."""
    try:
        service = EstoqueService(db)
        movimentacoes = await service.listar_movimentacoes(
            produto_id=produto_id,
            tipo=tipo,
            skip=skip,
            limit=limit
        )
        
        return movimentacoes
        
    except Exception as e:
        logger.error("Erro ao listar movimentações", error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/alertas/estoque-baixo")
async def verificar_estoque_baixo(
    db: AsyncSession = Depends(get_db)
):
    """Verifica produtos com estoque baixo."""
    try:
        service = EstoqueService(db)
        alertas = await service.verificar_estoque_baixo()
        
        return {
            "alertas": alertas,
            "total": len(alertas)
        }
        
    except Exception as e:
        logger.error("Erro ao verificar estoque baixo", error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/produtos/{produto_id}/ajustar-estoque")
async def ajustar_estoque(
    produto_id: int,
    quantidade: float,
    observacoes: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Ajusta o estoque de um produto."""
    try:
        service = EstoqueService(db)
        resultado = await service.ajustar_estoque(produto_id, quantidade, observacoes)
        
        log_business_event(
            "estoque_ajustado",
            produto_id=produto_id,
            quantidade=quantidade,
            observacoes=observacoes
        )
        
        return resultado
        
    except Exception as e:
        logger.error("Erro ao ajustar estoque", produto_id=produto_id, error=str(e))
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
