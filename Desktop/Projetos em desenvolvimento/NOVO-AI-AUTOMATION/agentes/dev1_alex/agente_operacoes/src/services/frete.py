"""
Serviço de gerenciamento de frete.

Este módulo contém a lógica de negócio para frete.
"""

from datetime import datetime, timedelta
from decimal import Decimal
from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload

from src.core.logging import get_logger, log_business_event
from src.models.frete import CotacaoFrete, Transportadora, StatusCotacao, TipoServico
from src.schemas.frete import CotacaoFreteCreate, TransportadoraCreate

logger = get_logger("frete_service")


class FreteService:
    """Serviço para gerenciamento de frete."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def cotar_frete(self, cotacao_data: CotacaoFreteCreate) -> List[CotacaoFrete]:
        """Cota frete com todas as transportadoras disponíveis."""
        try:
            # Buscar transportadoras ativas
            transportadoras_query = select(Transportadora).where(
                and_(
                    Transportadora.ativo == True,
                    Transportadora.disponivel == True
                )
            )
            transportadoras_result = await self.db.execute(transportadoras_query)
            transportadoras = transportadoras_result.scalars().all()
            
            cotacoes = []
            
            for transportadora in transportadoras:
                try:
                    # Simular cotação (aqui seria feita a integração real com a API da transportadora)
                    cotacao = await self._simular_cotacao(transportadora, cotacao_data)
                    cotacoes.append(cotacao)
                except Exception as e:
                    logger.warning(f"Erro ao cotar com {transportadora.nome}: {e}")
                    continue
            
            return cotacoes
            
        except Exception as e:
            logger.error("Erro ao cotar frete", error=str(e))
            raise
    
    async def listar_cotacoes(
        self,
        skip: int = 0,
        limit: int = 100,
        status: Optional[StatusCotacao] = None,
        pedido_id: Optional[int] = None,
        transportadora_id: Optional[int] = None
    ) -> Tuple[List[CotacaoFrete], int]:
        """Lista cotações de frete com filtros."""
        try:
            # Query base
            query = select(CotacaoFrete).options(selectinload(CotacaoFrete.transportadora))
            
            # Aplicar filtros
            conditions = []
            if status:
                conditions.append(CotacaoFrete.status == status)
            if pedido_id:
                conditions.append(CotacaoFrete.pedido_id == pedido_id)
            if transportadora_id:
                conditions.append(CotacaoFrete.transportadora_id == transportadora_id)
            
            if conditions:
                query = query.where(and_(*conditions))
            
            # Contar total
            count_query = select(func.count(CotacaoFrete.id))
            if conditions:
                count_query = count_query.where(and_(*conditions))
            
            total_result = await self.db.execute(count_query)
            total = total_result.scalar()
            
            # Aplicar paginação e ordenação
            query = query.order_by(CotacaoFrete.data_cotacao.desc()).offset(skip).limit(limit)
            
            result = await self.db.execute(query)
            cotacoes = result.scalars().all()
            
            return list(cotacoes), total
            
        except Exception as e:
            logger.error("Erro ao listar cotações", error=str(e))
            raise
    
    async def obter_cotacao(self, cotacao_id: int) -> Optional[CotacaoFrete]:
        """Obtém uma cotação específica."""
        try:
            query = select(CotacaoFrete).options(selectinload(CotacaoFrete.transportadora)).where(CotacaoFrete.id == cotacao_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
            
        except Exception as e:
            logger.error("Erro ao obter cotação", cotacao_id=cotacao_id, error=str(e))
            raise
    
    async def selecionar_cotacao(self, cotacao_id: int) -> Optional[CotacaoFrete]:
        """Seleciona uma cotação de frete."""
        try:
            cotacao = await self.obter_cotacao(cotacao_id)
            if not cotacao:
                return None
            
            if cotacao.status != StatusCotacao.COTADA:
                raise ValueError(f"Cotação não pode ser selecionada. Status atual: {cotacao.status}")
            
            # Desmarcar outras cotações do mesmo pedido
            if cotacao.pedido_id:
                outras_cotacoes_query = select(CotacaoFrete).where(
                    and_(
                        CotacaoFrete.pedido_id == cotacao.pedido_id,
                        CotacaoFrete.id != cotacao_id,
                        CotacaoFrete.selecionada == True
                    )
                )
                outras_cotacoes_result = await self.db.execute(outras_cotacoes_query)
                outras_cotacoes = outras_cotacoes_result.scalars().all()
                
                for outra_cotacao in outras_cotacoes:
                    outra_cotacao.selecionada = False
            
            # Marcar cotação como selecionada
            cotacao.selecionada = True
            cotacao.status = StatusCotacao.SELECIONADA
            cotacao.data_atualizacao = datetime.utcnow()
            
            await self.db.commit()
            await self.db.refresh(cotacao)
            
            return cotacao
            
        except Exception as e:
            await self.db.rollback()
            logger.error("Erro ao selecionar cotação", cotacao_id=cotacao_id, error=str(e))
            raise
    
    async def confirmar_cotacao(self, cotacao_id: int) -> Optional[CotacaoFrete]:
        """Confirma uma cotação de frete."""
        try:
            cotacao = await self.obter_cotacao(cotacao_id)
            if not cotacao:
                return None
            
            if cotacao.status not in [StatusCotacao.SELECIONADA, StatusCotacao.COTADA]:
                raise ValueError(f"Cotação não pode ser confirmada. Status atual: {cotacao.status}")
            
            # Aqui seria feita a confirmação real com a transportadora
            # Por enquanto, apenas mudamos o status
            cotacao.status = StatusCotacao.CONFIRMADA
            cotacao.confirmada = True
            cotacao.codigo_rastreamento = f"TRK{cotacao.id:010d}"
            cotacao.url_rastreamento = f"https://rastreamento.example.com/{cotacao.codigo_rastreamento}"
            cotacao.data_confirmacao = datetime.utcnow()
            cotacao.data_atualizacao = datetime.utcnow()
            
            await self.db.commit()
            await self.db.refresh(cotacao)
            
            return cotacao
            
        except Exception as e:
            await self.db.rollback()
            logger.error("Erro ao confirmar cotação", cotacao_id=cotacao_id, error=str(e))
            raise
    
    async def listar_transportadoras(
        self,
        skip: int = 0,
        limit: int = 100,
        ativo: Optional[bool] = None
    ) -> Tuple[List[Transportadora], int]:
        """Lista transportadoras com filtros."""
        try:
            # Query base
            query = select(Transportadora)
            
            # Aplicar filtros
            conditions = []
            if ativo is not None:
                conditions.append(Transportadora.ativo == ativo)
            
            if conditions:
                query = query.where(and_(*conditions))
            
            # Contar total
            count_query = select(func.count(Transportadora.id))
            if conditions:
                count_query = count_query.where(and_(*conditions))
            
            total_result = await self.db.execute(count_query)
            total = total_result.scalar()
            
            # Aplicar paginação e ordenação
            query = query.order_by(Transportadora.nome.asc()).offset(skip).limit(limit)
            
            result = await self.db.execute(query)
            transportadoras = result.scalars().all()
            
            return list(transportadoras), total
            
        except Exception as e:
            logger.error("Erro ao listar transportadoras", error=str(e))
            raise
    
    async def criar_transportadora(self, transportadora_data: TransportadoraCreate) -> Transportadora:
        """Cria uma nova transportadora."""
        try:
            transportadora = Transportadora(
                codigo=transportadora_data.codigo,
                nome=transportadora_data.nome,
                nome_fantasia=transportadora_data.nome_fantasia,
                cnpj=transportadora_data.cnpj,
                inscricao_estadual=transportadora_data.inscricao_estadual,
                email=transportadora_data.email,
                telefone=transportadora_data.telefone,
                site=transportadora_data.site,
                cep=transportadora_data.cep,
                logradouro=transportadora_data.logradouro,
                numero=transportadora_data.numero,
                complemento=transportadora_data.complemento,
                bairro=transportadora_data.bairro,
                cidade=transportadora_data.cidade,
                estado=transportadora_data.estado,
                pais=transportadora_data.pais,
                prazo_entrega_padrao=transportadora_data.prazo_entrega_padrao,
                valor_minimo=transportadora_data.valor_minimo,
                valor_maximo=transportadora_data.valor_maximo,
                peso_maximo=transportadora_data.peso_maximo,
                volume_maximo=transportadora_data.volume_maximo,
                ativo=transportadora_data.ativo,
                disponivel=transportadora_data.disponivel
            )
            
            self.db.add(transportadora)
            await self.db.commit()
            await self.db.refresh(transportadora)
            
            return transportadora
            
        except Exception as e:
            await self.db.rollback()
            logger.error("Erro ao criar transportadora", error=str(e))
            raise
    
    async def obter_transportadora(self, transportadora_id: int) -> Optional[Transportadora]:
        """Obtém uma transportadora específica."""
        try:
            query = select(Transportadora).where(Transportadora.id == transportadora_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
            
        except Exception as e:
            logger.error("Erro ao obter transportadora", transportadora_id=transportadora_id, error=str(e))
            raise
    
    async def obter_rastreamento(self, cotacao_id: int) -> Optional[dict]:
        """Obtém informações de rastreamento de uma cotação."""
        try:
            cotacao = await self.obter_cotacao(cotacao_id)
            if not cotacao or not cotacao.codigo_rastreamento:
                return None
            
            # Aqui seria feita a consulta real de rastreamento
            # Por enquanto, retornamos dados simulados
            return {
                "codigo_rastreamento": cotacao.codigo_rastreamento,
                "status": "Em trânsito",
                "localizacao_atual": "Centro de Distribuição - São Paulo/SP",
                "data_ultima_atualizacao": datetime.utcnow().isoformat(),
                "historico": [
                    {
                        "data": datetime.utcnow().isoformat(),
                        "status": "Coletado",
                        "localizacao": "Origem - São Paulo/SP"
                    },
                    {
                        "data": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
                        "status": "Em trânsito",
                        "localizacao": "Centro de Distribuição - São Paulo/SP"
                    }
                ],
                "previsao_entrega": (datetime.utcnow() + timedelta(days=cotacao.prazo_entrega)).isoformat()
            }
            
        except Exception as e:
            logger.error("Erro ao obter rastreamento", cotacao_id=cotacao_id, error=str(e))
            raise
    
    async def _simular_cotacao(self, transportadora: Transportadora, cotacao_data: CotacaoFreteCreate) -> CotacaoFrete:
        """Simula uma cotação de frete."""
        try:
            # Gerar código da cotação
            codigo_cotacao = f"COT{datetime.now().strftime('%Y%m%d%H%M%S')}{transportadora.id:03d}"
            
            # Simular cálculo de frete baseado no peso e distância
            peso_kg = float(cotacao_data.peso_total)
            distancia_km = 100  # Simulado
            
            # Calcular valor base
            valor_base = Decimal(str(peso_kg * 2.5 + distancia_km * 0.8))
            
            # Aplicar margem da transportadora
            margem = Decimal("1.2")  # 20% de margem
            valor_frete = valor_base * margem
            
            # Aplicar valor mínimo
            if valor_frete < transportadora.valor_minimo:
                valor_frete = transportadora.valor_minimo
            
            # Aplicar valor máximo se definido
            if transportadora.valor_maximo and valor_frete > transportadora.valor_maximo:
                valor_frete = transportadora.valor_maximo
            
            # Calcular prazo baseado na distância
            prazo_base = transportadora.prazo_entrega_padrao
            prazo_adicional = max(0, int(distancia_km / 500))  # 1 dia a cada 500km
            prazo_entrega = prazo_base + prazo_adicional
            
            # Criar cotação
            cotacao = CotacaoFrete(
                codigo_cotacao=codigo_cotacao,
                pedido_id=cotacao_data.pedido_id,
                transportadora_id=transportadora.id,
                tipo_servico=cotacao_data.tipo_servico,
                codigo_servico=f"SVC{transportadora.id:03d}",
                nome_servico=f"{transportadora.nome} - {cotacao_data.tipo_servico.value.upper()}",
                valor_frete=valor_frete,
                valor_seguro=cotacao_data.valor_seguro,
                valor_declarado=cotacao_data.valor_declarado,
                valor_total=valor_frete + cotacao_data.valor_seguro,
                prazo_entrega=prazo_entrega,
                prazo_entrega_minimo=max(1, prazo_entrega - 1),
                prazo_entrega_maximo=prazo_entrega + 2,
                peso_total=cotacao_data.peso_total,
                volume_total=cotacao_data.volume_total,
                quantidade_caixas=cotacao_data.quantidade_caixas,
                cep_origem=cotacao_data.cep_origem,
                cep_destino=cotacao_data.cep_destino,
                cidade_origem=cotacao_data.cidade_origem,
                cidade_destino=cotacao_data.cidade_destino,
                estado_origem=cotacao_data.estado_origem,
                estado_destino=cotacao_data.estado_destino,
                entrega_domicilio=cotacao_data.entrega_domicilio,
                entrega_sabado=cotacao_data.entrega_sabado,
                entrega_feriado=cotacao_data.entrega_feriado,
                coleta_agendada=cotacao_data.coleta_agendada,
                observacoes=cotacao_data.observacoes,
                status=StatusCotacao.COTADA,
                data_expiracao=datetime.utcnow() + timedelta(hours=24)
            )
            
            self.db.add(cotacao)
            await self.db.commit()
            await self.db.refresh(cotacao)
            
            return cotacao
            
        except Exception as e:
            await self.db.rollback()
            logger.error("Erro ao simular cotação", error=str(e))
            raise
