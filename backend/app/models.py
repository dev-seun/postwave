from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    clerk_id = Column(String, unique=True, index=True)
    apps = relationship("App", back_populates="owner")

class App(Base):
    __tablename__ = "apps"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="apps")
    is_active = Column(Boolean, default=False)
    platform_connections = relationship("PlatformConnection", back_populates="app")
    posts = relationship("Post", back_populates="app")

class PlatformConnection(Base):
    __tablename__ = "platform_connections"
    id = Column(Integer, primary_key=True, index=True)
    app_id = Column(Integer, ForeignKey("apps.id"))
    platform = Column(String, index=True)  # x, linkedin, facebook, discord
    credentials = Column(Text)  # Store all keys/tokens as JSON string
    platform_username = Column(String)
    followers = Column(Integer, default=0)  # Store all keys/tokens as JSON string
    posts = Column(Integer, default=0)  # Store all keys/tokens as JSON string
    connected = Column(Text)  # Store all keys/tokens as JSON string
    engagements = Column(Integer, default=0)  # Store all keys/tokens as JSON string
    auto_publish_post = Column(Boolean, default=False)
    failure_notification = Column(Boolean, default=False)
    app = relationship("App", back_populates="platform_connections")

class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    app_id = Column(Integer, ForeignKey("apps.id")) 
    # post details
    content = Column(Text)
    x_post_id = Column(Text)
    status = Column(String, default="draft")  # draft, scheduled, posted
    scheduled_time = Column(DateTime, nullable=True)
    publishedAt = Column(DateTime, nullable=True)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    platform = Column(String, index=True)
    reach = Column(Integer, default=0)
    # end post details
    created_at = Column(DateTime, default=datetime.utcnow)
    app = relationship("App", back_populates="posts")
     