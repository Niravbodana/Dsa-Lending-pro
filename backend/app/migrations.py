"""SQLite-safe column migrations for existing databases."""

from sqlalchemy import inspect, text

from app.database import engine


def run_schema_patches() -> None:
    if not str(engine.url).startswith("sqlite"):
        return

    inspector = inspect(engine)
    if "leads" in inspector.get_table_names():
        existing = {col["name"] for col in inspector.get_columns("leads")}
        patches = {
            "date_of_birth": "ALTER TABLE leads ADD COLUMN date_of_birth VARCHAR(10)",
            "email": "ALTER TABLE leads ADD COLUMN email VARCHAR(120)",
            "pincode": "ALTER TABLE leads ADD COLUMN pincode VARCHAR(6)",
            "gender": "ALTER TABLE leads ADD COLUMN gender VARCHAR(20)",
        }
        with engine.begin() as conn:
            for column, sql in patches.items():
                if column not in existing:
                    conn.execute(text(sql))
