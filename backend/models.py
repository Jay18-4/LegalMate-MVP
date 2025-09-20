from sqlalchemy import Integer, String, Column, Float, DateTime, ForeignKey
from datetime import datetime, timezone

from backend import database
from backend.database import Base


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, autoincrement=True)
    username =Column(String, nullable=False, unique=True)
    user_email = Column(String, nullable=False, unique=True)
    hashed_password = Column(String)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    notes = database.relationship('Note', back_populates = 'users')

class Note(Base):
    __tablename__ =  'notes'
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String)
    file_path = Column(String, nullable=False)
    file_size = Column(Float)
    file_type = Column(String)
    uploaded_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    uploaded_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    stored_filename = Column(String, nullable=False)
    


    users = database.relationship('User', back_populates = 'notes')
