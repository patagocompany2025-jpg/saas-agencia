"""
Serviço de gerenciamento de estoque.

Este módulo contém a lógica de negócio para estoque.
"""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload

from src.core.logging import get_logger, log_business_event
from src.models.estoque import Produto, Estoque, MovimentacaoEstoque, TipoMovimentacao, StatusProduto
from src.schemas.estoque import ProdutoCreate, ProdutoUpdate, MovimentacaoEstoqueCreate

logger = get_logger("estoque_service")


class EstoqueService:
    """Serviço para gerenciamento de estoque."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def listar_produtos(
        self,
        skip: int = 0,
        limit: int = 100,
        categoria: Optional[str] = None,
        ativo: Optional[bool] = None
    ) -> Tuple[List[Produto], int]:
        """Lista produtos com filtros."""
        try:
            # Query base
            query = select(Produto)
            
            # Aplicar filtros
            conditions = []
            if categoria:
                conditions.append(Produto.categoria == categoria)
            if ativo is not None:
                conditions.append(Produto.ativo == ativo)
            
            if conditions:
                query = query.where(and_(*conditions))
            
            # Contar total
            count_query = select(func.count(Produto.id))
            if conditions:
                count_query = count_query.where(and_(*conditions))
            
            total_result = await self.db.execute(count_query)
            total = total_result.scalar()
            
            # Aplicar paginação e ordenação
            query = query.order_by(Produto.nome.asc()).offset(skip).limit(limit)
            
            result = await self.db.execute(query)
            produtos = result.scalars().all()
            
            return list(produtos), total
            
        except Exception as e:
            logger.error("Erro ao listar produtos", error=str(e))
            raise
    
    async def obter_produto(self, produto_id: int) -> Optional[Produto]:
        """Obtém um produto específico."""
        try:
            query = select(Produto).where(Produto.id == produto_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
            
        except Exception as e:
            logger.error("Erro ao obter produto", produto_id=produto_id, error=str(e))
            raise
    
    async def criar_produto(self, produto_data: ProdutoCreate) -> Produto:
        """Cria um novo produto."""
        try:
            produto = Produto(
                codigo=produto_data.codigo,
                codigo_barras=produto_data.codigo_barras,
                nome=produto_data.nome,
                descricao=produto_data.descricao,
                categoria=produto_data.categoria,
                marca=produto_data.marca,
                preco_custo=produto_data.preco_custo,
                preco_venda=produto_data.preco_venda,
                estoque_minimo=produto_data.estoque_minimo or 0,
                estoque_maximo=produto_data.estoque_maximo or 0,
                unidade_medida=produto_data.unidade_medida,
                ncm=produto_data.ncm,
                cfop=produto_data.cfop,
                origem=produto_data.origem,
                status=StatusProduto.ATIVO,
                ativo=True
            )
            
            self.db.add(produto)
            await self.db.commit()
            await self.db.refresh(produto)
            
            # Criar registro de estoque
            estoque = Estoque(
                produto_id=produto.id,
                localizacao="principal",
                quantidade_atual=0,
                quantidade_reservada=0,
                quantidade_disponivel=0,
                estoque_minimo=produto.estoque_minimo,
                estoque_maximo=produto.estoque_maximo
            )
            
            self.db.add(estoque)
            await self.db.commit()
            
            return produto
            
        except Exception as e:
            await self.db.rollback()
            logger.error("Erro ao criar produto", error=str(e))
            raise
    
    async def atualizar_produto(self, produto_id: int, produto_data: ProdutoUpdate) -> Optional[Produto]:
        """Atualiza um produto existente."""
        try:
            produto = await self.obter_produto(produto_id)
            if not produto:
                return None
            
            # Atualizar campos fornecidos
            update_data = produto_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(produto, field, value)
            
            produto.data_atualizacao = datetime.utcnow()
            
            await self.db.commit()
            await self.db.refresh(produto)
            
            return produto
            
        except Exception as e:
            await self.db.rollback()
            logger.error("Erro ao atualizar produto", produto_id=produto_id, error=str(e))
            raise
    
    async def obter_estoque_produto(self, produto_id: int) -> List[Estoque]:
        """Obtém o estoque de um produto."""
        try:
            query = select(Estoque).where(Estoque.produto_id == produto_id)
            result = await self.db.execute(query)
            return list(result.scalars().all())
            
        except Exception as e:
            logger.error("Erro ao obter estoque do produto", produto_id=produto_id, error=str(e))
            raise
    
    async def criar_movimentacao(self, movimentacao_data: MovimentacaoEstoqueCreate) -> MovimentacaoEstoque:
        """Cria uma movimentação de estoque."""
        try:
            # Obter estoque atual
            estoque_query = select(Estoque).where(Estoque.produto_id == movimentacao_data.produto_id)
            estoque_result = await self.db.execute(estoque_query)
            estoque = estoque_result.scalar_one_or_none()
            
            if not estoque:
                raise ValueError("Estoque não encontrado para o produto")
            
            quantidade_anterior = estoque.quantidade_atual
            
            # Calcular nova quantidade
            if movimentacao_data.tipo in [TipoMovimentacao.ENTRADA, TipoMovimentacao.AJUSTE]:
                quantidade_posterior = quantidade_anterior + movimentacao_data.quantidade
            else:  # SAIDA, PERDA, DEVOLUCAO
                quantidade_posterior = quantidade_anterior - movimentacao_data.quantidade
            
            if quantidade_posterior < 0:
                raise ValueError("Quantidade em estoque insuficiente")
            
            # Criar movimentação
            movimentacao = MovimentacaoEstoque(
                produto_id=movimentacao_data.produto_id,
                tipo=movimentacao_data.tipo,
                quantidade=movimentacao_data.quantidade,
                quantidade_anterior=quantidade_anterior,
                quantidade_posterior=quantidade_posterior,
                origem_tipo=movimentacao_data.origem_tipo,
                origem_id=movimentacao_data.origem_id,
                localizacao_origem=movimentacao_data.localizacao_origem,
                localizacao_destino=movimentacao_data.localizacao_destino,
                observacoes=movimentacao_data.observacoes,
                usuario=movimentacao_data.usuario
            )
            
            self.db.add(movimentacao)
            
            # Atualizar estoque
            estoque.quantidade_atual = quantidade_posterior
            estoque.quantidade_disponivel = quantidade_posterior - estoque.quantidade_reservada
            estoque.data_ultima_movimentacao = datetime.utcnow()
            
            await self.db.commit()
            await self.db.refresh(movimentacao)
            
            return movimentacao
            
        except Exception as e:
            await self.db.rollback()
            logger.error("Erro ao criar movimentação", error=str(e))
            raise
    
    async def listar_movimentacoes(
        self,
        produto_id: Optional[int] = None,
        tipo: Optional[TipoMovimentacao] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[MovimentacaoEstoque]:
        """Lista movimentações de estoque."""
        try:
            query = select(MovimentacaoEstoque)
            
            conditions = []
            if produto_id:
                conditions.append(MovimentacaoEstoque.produto_id == produto_id)
            if tipo:
                conditions.append(MovimentacaoEstoque.tipo == tipo)
            
            if conditions:
                query = query.where(and_(*conditions))
            
            query = query.order_by(MovimentacaoEstoque.data_movimentacao.desc()).offset(skip).limit(limit)
            
            result = await self.db.execute(query)
            return list(result.scalars().all())
            
        except Exception as e:
            logger.error("Erro ao listar movimentações", error=str(e))
            raise
    
    async def verificar_estoque_baixo(self) -> List[dict]:
        """Verifica produtos com estoque baixo."""
        try:
            query = select(Produto).where(
                and_(
                    Produto.ativo == True,
                    Produto.estoque_atual <= Produto.estoque_minimo
                )
            )
            
            result = await self.db.execute(query)
            produtos = result.scalars().all()
            
            alertas = []
            for produto in produtos:
                percentual = (produto.estoque_atual / produto.estoque_minimo * 100) if produto.estoque_minimo > 0 else 0
                alertas.append({
                    "produto_id": produto.id,
                    "codigo": produto.codigo,
                    "nome": produto.nome,
                    "estoque_atual": float(produto.estoque_atual),
                    "estoque_minimo": float(produto.estoque_minimo),
                    "percentual": float(percentual)
                })
            
            return alertas
            
        except Exception as e:
            logger.error("Erro ao verificar estoque baixo", error=str(e))
            raise
    
    async def ajustar_estoque(self, produto_id: int, quantidade: float, observacoes: Optional[str] = None) -> dict:
        """Ajusta o estoque de um produto."""
        try:
            produto = await self.obter_produto(produto_id)
            if not produto:
                raise ValueError("Produto não encontrado")
            
            # Criar movimentação de ajuste
            movimentacao_data = MovimentacaoEstoqueCreate(
                produto_id=produto_id,
                tipo=TipoMovimentacao.AJUSTE,
                quantidade=Decimal(str(quantidade)),
                observacoes=observacoes or "Ajuste manual de estoque"
            )
            
            movimentacao = await self.criar_movimentacao(movimentacao_data)
            
            return {
                "produto_id": produto_id,
                "quantidade_anterior": float(movimentacao.quantidade_anterior),
                "quantidade_posterior": float(movimentacao.quantidade_posterior),
                "quantidade_ajustada": float(quantidade),
                "movimentacao_id": movimentacao.id
            }
            
        except Exception as e:
            logger.error("Erro ao ajustar estoque", produto_id=produto_id, error=str(e))
            raise
