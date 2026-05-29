"""create people tables

Revision ID: 20260529_0001
Revises:
Create Date: 2026-05-29
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "20260529_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "people",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("display_name", sa.String(length=255), nullable=False),
        sa.Column("role_label", sa.String(length=120), nullable=False, server_default="Artist"),
        sa.Column("discipline", sa.String(length=120), nullable=False, server_default="Generalist"),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("phone", sa.String(length=80), nullable=True),
        sa.Column("engagement_status", sa.String(length=40), nullable=False, server_default="unknown"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("is_bot", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("permission_level", sa.String(length=40), nullable=False, server_default="Artist"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_table(
        "person_permissions",
        sa.Column("person_id", sa.String(length=64), sa.ForeignKey("people.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("view_id", sa.String(length=80), primary_key=True),
        sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.false()),
    )


def downgrade() -> None:
    op.drop_table("person_permissions")
    op.drop_table("people")
