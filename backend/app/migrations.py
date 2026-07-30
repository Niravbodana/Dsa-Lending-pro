"""SQLite-safe column migrations for existing databases."""

from sqlalchemy import inspect, text

from app.database import engine


def run_schema_patches() -> None:
    if not str(engine.url).startswith("sqlite"):
        return

    inspector = inspect(engine)
    with engine.begin() as conn:
        if "leads" in inspector.get_table_names():
            existing = {col["name"] for col in inspector.get_columns("leads")}
            lead_patches = {
                "date_of_birth": "ALTER TABLE leads ADD COLUMN date_of_birth VARCHAR(10)",
                "email": "ALTER TABLE leads ADD COLUMN email VARCHAR(120)",
                "pincode": "ALTER TABLE leads ADD COLUMN pincode VARCHAR(6)",
                "gender": "ALTER TABLE leads ADD COLUMN gender VARCHAR(20)",
                "preferred_partner_slug": "ALTER TABLE leads ADD COLUMN preferred_partner_slug VARCHAR(80)",
            }
            for column, sql in lead_patches.items():
                if column not in existing:
                    conn.execute(text(sql))

        if "lending_partners" in inspector.get_table_names():
            partner_cols = {col["name"] for col in inspector.get_columns("lending_partners")}
            partner_patches = {
                "application_endpoint_path": "ALTER TABLE lending_partners ADD COLUMN application_endpoint_path VARCHAR(120)",
                "external_lending_url": "ALTER TABLE lending_partners ADD COLUMN external_lending_url VARCHAR(1000)",
                "workflow_mode": "ALTER TABLE lending_partners ADD COLUMN workflow_mode VARCHAR(30) DEFAULT 'internal'",
                "partner_ref_code": "ALTER TABLE lending_partners ADD COLUMN partner_ref_code VARCHAR(120)",
                "external_lead_source": "ALTER TABLE lending_partners ADD COLUMN external_lead_source VARCHAR(120)",
            }
            for column, sql in partner_patches.items():
                if column not in partner_cols:
                    conn.execute(text(sql))
