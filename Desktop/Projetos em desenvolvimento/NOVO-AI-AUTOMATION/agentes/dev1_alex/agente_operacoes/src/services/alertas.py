"""
Serviço de gerenciamento de alertas.

Este módulo contém a lógica de negócio para alertas.
"""

from datetime import datetime, timedelta
from decimal import Decimal
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload

from src.core.logging import get_logger, log_business_event
from src.models.alerta import Alerta, TipoAlerta, PrioridadeAlerta, StatusAlerta, CanalNotificacao
from src.schemas.alerta import AlertaCreate, AlertaUpdate

logger = get_logger("alertas_service")


class AlertaService:
    """Serviço para gerenciamento de alertas."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def listar_alertas(
        self,
        skip: int = 0,
        limit: int = 100,
        tipo: Optional[TipoAlerta] = None,
        prioridade: Optional[PrioridadeAlerta] = None,
        status: Optional[StatusAlerta] = None,
        ativo: Optional[bool] = None
    ) -> Tuple[List[Alerta], int]:
        """Lista alertas com filtros."""
        try:
            # Query base
            query = select(Alerta)
            
            # Aplicar filtros
            conditions = []
            if tipo:
                conditions.append(Alerta.tipo == tipo)
            if prioridade:
                conditions.append(Alerta.prioridade == prioridade)
            if status:
                conditions.append(Alerta.status == status)
            if ativo is not None:
                conditions.append(Alerta.ativo == ativo)
            
            if conditions:
                query = query.where(and_(*conditions))
            
            # Contar total
            count_query = select(func.count(Alerta.id))
            if conditions:
                count_query = count_query.where(and_(*conditions))
            
            total_result = await self.db.execute(count_query)
            total = total_result.scalar()
            
            # Aplicar paginação e ordenação
            query = query.order_by(Alerta.data_criacao.desc()).offset(skip).limit(limit)
            
            result = await self.db.execute(query)
            alertas = result.scalars().all()
            
            return list(alertas), total
            
        except Exception as e:
            logger.error("Erro ao listar alertas", error=str(e))
            raise
    
    async def obter_alerta(self, alerta_id: int) -> Optional[Alerta]:
        """Obtém um alerta específico."""
        try:
            query = select(Alerta).where(Alerta.id == alerta_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
            
        except Exception as e:
            logger.error("Erro ao obter alerta", alerta_id=alerta_id, error=str(e))
            raise
    
    async def criar_alerta(self, alerta_data: AlertaCreate) -> Alerta:
        """Cria um novo alerta."""
        try:
            # Gerar código do alerta
            codigo = await self._gerar_codigo_alerta()
            
            # Definir canais de notificação padrão se não especificados
            canais = alerta_data.canais_notificacao or [CanalNotificacao.SISTEMA]
            
            # Definir destinatários padrão se não especificados
            destinatarios = alerta_data.destinatarios or ["admin@empresa.com"]
            
            alerta = Alerta(
                codigo=codigo,
                tipo=alerta_data.tipo,
                prioridade=alerta_data.prioridade,
                titulo=alerta_data.titulo,
                mensagem=alerta_data.mensagem,
                descricao=alerta_data.descricao,
                entidade_tipo=alerta_data.entidade_tipo,
                entidade_id=alerta_data.entidade_id,
                pedido_id=alerta_data.pedido_id,
                produto_id=alerta_data.produto_id,
                nfe_id=alerta_data.nfe_id,
                dados_extras=alerta_data.dados_extras,
                canais_notificacao=[canal.value for canal in canais],
                destinatarios=destinatarios,
                max_tentativas=alerta_data.max_tentativas,
                data_expiracao=alerta_data.data_expiracao,
                requer_acao_manual=alerta_data.requer_acao_manual,
                status=StatusAlerta.PENDENTE,
                proximo_envio=datetime.utcnow()
            )
            
            self.db.add(alerta)
            await self.db.commit()
            await self.db.refresh(alerta)
            
            return alerta
            
        except Exception as e:
            await self.db.rollback()
            logger.error("Erro ao criar alerta", error=str(e))
            raise
    
    async def atualizar_alerta(self, alerta_id: int, alerta_data: AlertaUpdate) -> Optional[Alerta]:
        """Atualiza um alerta existente."""
        try:
            alerta = await self.obter_alerta(alerta_id)
            if not alerta:
                return None
            
            # Atualizar campos fornecidos
            update_data = alerta_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                if field == "canais_notificacao" and value:
                    setattr(alerta, field, [canal.value for canal in value])
                else:
                    setattr(alerta, field, value)
            
            alerta.data_atualizacao = datetime.utcnow()
            
            await self.db.commit()
            await self.db.refresh(alerta)
            
            return alerta
            
        except Exception as e:
            await self.db.rollback()
            logger.error("Erro ao atualizar alerta", alerta_id=alerta_id, error=str(e))
            raise
    
    async def marcar_lido(self, alerta_id: int) -> Optional[Alerta]:
        """Marca um alerta como lido."""
        try:
            alerta = await self.obter_alerta(alerta_id)
            if not alerta:
                return None
            
            alerta.status = StatusAlerta.LIDO
            alerta.data_leitura = datetime.utcnow()
            alerta.data_atualizacao = datetime.utcnow()
            
            await self.db.commit()
            await self.db.refresh(alerta)
            
            return alerta
            
        except Exception as e:
            await self.db.rollback()
            logger.error("Erro ao marcar alerta como lido", alerta_id=alerta_id, error=str(e))
            raise
    
    async def resolver_alerta(self, alerta_id: int, observacoes: Optional[str] = None) -> Optional[Alerta]:
        """Resolve um alerta."""
        try:
            alerta = await self.obter_alerta(alerta_id)
            if not alerta:
                return None
            
            alerta.status = StatusAlerta.RESOLVIDO
            alerta.data_resolucao = datetime.utcnow()
            alerta.data_atualizacao = datetime.utcnow()
            
            if observacoes:
                alerta.observacoes = f"{alerta.observacoes or ''}\nResolvido: {observacoes}".strip()
            
            await self.db.commit()
            await self.db.refresh(alerta)
            
            return alerta
            
        except Exception as e:
            await self.db.rollback()
            logger.error("Erro ao resolver alerta", alerta_id=alerta_id, error=str(e))
            raise
    
    async def ignorar_alerta(self, alerta_id: int, motivo: Optional[str] = None) -> Optional[Alerta]:
        """Ignora um alerta."""
        try:
            alerta = await self.obter_alerta(alerta_id)
            if not alerta:
                return None
            
            alerta.status = StatusAlerta.IGNORADO
            alerta.data_atualizacao = datetime.utcnow()
            
            if motivo:
                alerta.observacoes = f"{alerta.observacoes or ''}\nIgnorado: {motivo}".strip()
            
            await self.db.commit()
            await self.db.refresh(alerta)
            
            return alerta
            
        except Exception as e:
            await self.db.rollback()
            logger.error("Erro ao ignorar alerta", alerta_id=alerta_id, error=str(e))
            raise
    
    async def obter_resumo_alertas(self) -> Dict[str, Any]:
        """Obtém resumo dos alertas para dashboard."""
        try:
            # Contar alertas por status
            status_query = select(Alerta.status, func.count(Alerta.id)).group_by(Alerta.status)
            status_result = await self.db.execute(status_query)
            status_counts = {row[0].value: row[1] for row in status_result}
            
            # Contar alertas por tipo
            tipo_query = select(Alerta.tipo, func.count(Alerta.id)).group_by(Alerta.tipo)
            tipo_result = await self.db.execute(tipo_query)
            tipo_counts = {row[0].value: row[1] for row in tipo_result}
            
            # Contar alertas por prioridade
            prioridade_query = select(Alerta.prioridade, func.count(Alerta.id)).group_by(Alerta.prioridade)
            prioridade_result = await self.db.execute(prioridade_query)
            prioridade_counts = {row[0].value: row[1] for row in prioridade_result}
            
            # Obter últimos alertas
            ultimos_query = select(Alerta).order_by(Alerta.data_criacao.desc()).limit(5)
            ultimos_result = await self.db.execute(ultimos_query)
            ultimos_alertas = list(ultimos_result.scalars().all())
            
            return {
                "total_alertas": sum(status_counts.values()),
                "alertas_pendentes": status_counts.get(StatusAlerta.PENDENTE.value, 0),
                "alertas_enviados": status_counts.get(StatusAlerta.ENVIADO.value, 0),
                "alertas_lidos": status_counts.get(StatusAlerta.LIDO.value, 0),
                "alertas_resolvidos": status_counts.get(StatusAlerta.RESOLVIDO.value, 0),
                "alertas_ignorados": status_counts.get(StatusAlerta.IGNORADO.value, 0),
                "alertas_expirados": status_counts.get(StatusAlerta.EXPIRADO.value, 0),
                "alertas_por_tipo": tipo_counts,
                "alertas_por_prioridade": prioridade_counts,
                "alertas_por_status": status_counts,
                "ultimos_alertas": ultimos_alertas
            }
            
        except Exception as e:
            logger.error("Erro ao obter resumo de alertas", error=str(e))
            raise
    
    async def processar_alertas_pendentes(self) -> Dict[str, int]:
        """Processa alertas pendentes de envio."""
        try:
            # Buscar alertas pendentes
            query = select(Alerta).where(
                and_(
                    Alerta.status == StatusAlerta.PENDENTE,
                    Alerta.ativo == True,
                    or_(
                        Alerta.proximo_envio.is_(None),
                        Alerta.proximo_envio <= datetime.utcnow()
                    )
                )
            )
            
            result = await self.db.execute(query)
            alertas = result.scalars().all()
            
            sucessos = 0
            erros = 0
            
            for alerta in alertas:
                try:
                    # Simular envio de notificação
                    await self._enviar_notificacao(alerta)
                    
                    alerta.status = StatusAlerta.ENVIADO
                    alerta.data_ultimo_envio = datetime.utcnow()
                    alerta.tentativas_envio += 1
                    alerta.data_atualizacao = datetime.utcnow()
                    
                    sucessos += 1
                    
                except Exception as e:
                    logger.error(f"Erro ao processar alerta {alerta.id}: {e}")
                    alerta.tentativas_envio += 1
                    alerta.data_atualizacao = datetime.utcnow()
                    
                    # Se excedeu o máximo de tentativas, marcar como erro
                    if alerta.tentativas_envio >= alerta.max_tentativas:
                        alerta.status = StatusAlerta.EXPIRADO
                    
                    erros += 1
            
            await self.db.commit()
            
            return {
                "total_processados": len(alertas),
                "sucessos": sucessos,
                "erros": erros
            }
            
        except Exception as e:
            await self.db.rollback()
            logger.error("Erro ao processar alertas pendentes", error=str(e))
            raise
    
    async def _gerar_codigo_alerta(self) -> str:
        """Gera um código único para o alerta."""
        try:
            # Buscar o último ID de alerta
            query = select(func.max(Alerta.id))
            result = await self.db.execute(query)
            last_id = result.scalar() or 0
            
            # Gerar código baseado no ID + timestamp
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            codigo = f"ALT{timestamp}{last_id + 1:06d}"
            
            return codigo
            
        except Exception as e:
            logger.error("Erro ao gerar código do alerta", error=str(e))
            raise
    
    async def _enviar_notificacao(self, alerta: Alerta) -> None:
        """Simula o envio de notificação."""
        try:
            # Aqui seria implementado o envio real de notificações
            # Por enquanto, apenas logamos
            logger.info(
                "Notificação enviada",
                alerta_id=alerta.id,
                tipo=alerta.tipo.value,
                prioridade=alerta.prioridade.value,
                canais=alerta.canais_notificacao,
                destinatarios=alerta.destinatarios
            )
            
            # Simular delay de envio
            import asyncio
            await asyncio.sleep(0.1)
            
        except Exception as e:
            logger.error(f"Erro ao enviar notificação para alerta {alerta.id}: {e}")
            raise
