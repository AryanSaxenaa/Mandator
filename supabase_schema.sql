-- =============================================================
-- Mandator — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- =============================================================

-- 1. Pipelines
CREATE TABLE IF NOT EXISTS pipelines (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL DEFAULT 'Untitled Pipeline',
  nodes      JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges      JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Agents
CREATE TABLE IF NOT EXISTS agents (
  id                 TEXT PRIMARY KEY,
  name               TEXT NOT NULL,
  pipeline_id        TEXT REFERENCES pipelines(id) ON DELETE SET NULL,
  status             TEXT NOT NULL DEFAULT 'draft',
  vault_address      TEXT,
  last_run           TIMESTAMPTZ,
  daily_spent        TEXT DEFAULT '0',
  total_spent        TEXT DEFAULT '0',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  webhook_url        TEXT,
  webhook_secret     TEXT,
  last_known_balance TEXT
);

-- 3. Journal (transaction / execution log)
CREATE TABLE IF NOT EXISTS journal (
  id          TEXT PRIMARY KEY,
  agent_id    TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  pipeline_id TEXT,
  node_id     TEXT,
  node_type   TEXT,
  status      TEXT NOT NULL,
  tx_hash     TEXT,
  amount      TEXT,
  amount_wei  TEXT,
  "to"        TEXT,
  memo        TEXT,
  error       TEXT,
  result      JSONB,
  timestamp   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_journal_agent  ON journal(agent_id);
CREATE INDEX IF NOT EXISTS idx_journal_ts     ON journal(timestamp DESC);

-- 4. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id         TEXT PRIMARY KEY,
  agent_id   TEXT REFERENCES agents(id) ON DELETE CASCADE,
  type       TEXT NOT NULL DEFAULT 'info',
  title      TEXT,
  message    TEXT,
  read       BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notif_agent ON notifications(agent_id);

-- 5. Row Level Security — open for service_role, restrict anon
ALTER TABLE pipelines     ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents        ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal       ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow full access for the service role (backend server)
CREATE POLICY "service_all" ON pipelines     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all" ON agents        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all" ON journal       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all" ON notifications FOR ALL USING (true) WITH CHECK (true);
