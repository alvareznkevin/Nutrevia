"""create persistent meal entries

Revision ID: 9b8e2c3d4f50
Revises: 0146c9f69ca7
"""

from alembic import op
import sqlalchemy as sa

revision = "9b8e2c3d4f50"
down_revision = "0146c9f69ca7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "meal_entries",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("recorded_on", sa.Date(), nullable=False),
        sa.Column("meal_type", sa.String(length=20), nullable=False),
        sa.Column("source", sa.String(length=20), nullable=False),
        sa.Column("description", sa.String(length=500), nullable=False),
        sa.Column("calories", sa.Integer(), nullable=False),
        sa.Column("protein_grams", sa.Numeric(8, 1), nullable=False),
        sa.Column("carb_grams", sa.Numeric(8, 1), nullable=False),
        sa.Column("fat_grams", sa.Numeric(8, 1), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_meal_entries_user_id", "meal_entries", ["user_id"])
    op.create_index("ix_meal_entries_recorded_on", "meal_entries", ["recorded_on"])


def downgrade() -> None:
    op.drop_index("ix_meal_entries_recorded_on", table_name="meal_entries")
    op.drop_index("ix_meal_entries_user_id", table_name="meal_entries")
    op.drop_table("meal_entries")
