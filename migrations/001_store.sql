-- PostgreSQL persistent state. Every mutation SELECTs this row FOR UPDATE.
-- This serializes stock reservations, duplicate references and idempotency checks.
CREATE TABLE IF NOT EXISTS jaeger_store (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  data JSONB NOT NULL
);
