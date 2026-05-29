from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


class Person(Base):
    __tablename__ = "people"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    display_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role_label: Mapped[str] = mapped_column(String(120), nullable=False, default="Artist")
    discipline: Mapped[str] = mapped_column(String(120), nullable=False, default="Generalist")
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    engagement_status: Mapped[str] = mapped_column(String(40), nullable=False, default="unknown")
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_bot: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    permission_level: Mapped[str] = mapped_column(String(40), nullable=False, default="Artist")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    archived_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    permissions: Mapped[List["PersonPermission"]] = relationship(
        back_populates="person",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def archive(self) -> None:
        self.archived_at = datetime.now(timezone.utc)


class PersonPermission(Base):
    __tablename__ = "person_permissions"

    person_id: Mapped[str] = mapped_column(ForeignKey("people.id", ondelete="CASCADE"), primary_key=True)
    view_id: Mapped[str] = mapped_column(String(80), primary_key=True)
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    person: Mapped[Person] = relationship(back_populates="permissions")
