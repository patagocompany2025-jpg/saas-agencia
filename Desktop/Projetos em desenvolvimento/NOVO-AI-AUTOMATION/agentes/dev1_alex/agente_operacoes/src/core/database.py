"""
Configuração do banco de dados para o Agente de Operações.

Este módulo gerencia a conexão e configuração do banco de dados.
"""

from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from src.core.config import settings
from src.core.logging import get_logger

logger = get_logger("database")

# Base para modelos SQLAlchemy
Base = declarative_base()

# Metadados para migrações
metadata = MetaData()

# Engine síncrono (para migrações)
sync_engine = create_engine(
    settings.DATABASE_URL,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    echo=settings.DEBUG
)

# Engine assíncrono (para aplicação)
# Para SQLite, usar aiofiles com sqlite+aiosqlite
if settings.DATABASE_URL.startswith("sqlite"):
    async_engine = create_async_engine(
        settings.DATABASE_URL.replace("sqlite://", "sqlite+aiosqlite://"),
        echo=settings.DEBUG
    )
else:
    async_engine = create_async_engine(
        settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://"),
        pool_size=settings.DATABASE_POOL_SIZE,
        max_overflow=settings.DATABASE_MAX_OVERFLOW,
        echo=settings.DEBUG
    )

# Session factory assíncrona
AsyncSessionLocal = sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)


async def init_database() -> None:
    """Inicializa o banco de dados."""
    try:
        logger.info("Inicializando banco de dados...")
        
        # Criar todas as tabelas
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        logger.info("Banco de dados inicializado com sucesso")
        
    except Exception as e:
        logger.error("Erro ao inicializar banco de dados", error=str(e))
        raise


async def get_db() -> AsyncSession:
    """Dependency para obter sessão do banco de dados."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            logger.error("Erro na sessão do banco", error=str(e))
            await session.rollback()
            raise
        finally:
            await session.close()


def get_sync_db():
    """Dependency para obter sessão síncrona do banco de dados."""
    from sqlalchemy.orm import sessionmaker
    
    SessionLocal = sessionmaker(bind=sync_engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
