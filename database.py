from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, relationship



engine = create_engine('sqlite:///mydatabase.db', echo=True)

session_local = sessionmaker(bind=engine, autoflush=False, autocommit= False)

Base = declarative_base()

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

# uvicorn backend.server:app --reload
