-- Executar com: npx wrangler d1 migrations apply or-marketing-db --remote
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS users (
 id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_salt TEXT NOT NULL,
 password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('admin','staff','client')),
 client_id TEXT, must_change_password INTEGER NOT NULL DEFAULT 1,
 created_at INTEGER NOT NULL, disabled_at INTEGER,
 FOREIGN KEY(client_id) REFERENCES clients(id)
);
CREATE TABLE IF NOT EXISTS sessions (
 token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at INTEGER NOT NULL,
 created_at INTEGER NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS sessions_expires ON sessions(expires_at);
CREATE TABLE IF NOT EXISTS clients (
 id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL DEFAULT '',
 whatsapp TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'novo',
 data_json TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS clients_updated ON clients(updated_at DESC);
CREATE TABLE IF NOT EXISTS briefings (
 id TEXT PRIMARY KEY, client_id TEXT NOT NULL, data_json TEXT NOT NULL,
 received_at INTEGER NOT NULL, source TEXT NOT NULL DEFAULT 'public',
 FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS briefings_client ON briefings(client_id,received_at DESC);
CREATE TABLE IF NOT EXISTS posts (
 client_id TEXT NOT NULL, id TEXT NOT NULL, front_id TEXT,
 title TEXT NOT NULL DEFAULT '', caption TEXT NOT NULL DEFAULT '',
 body TEXT NOT NULL DEFAULT '', format TEXT NOT NULL DEFAULT '',
 scheduled_for TEXT, status TEXT NOT NULL DEFAULT 'Ideia',
 art_json TEXT NOT NULL DEFAULT '{}', data_json TEXT NOT NULL,
 updated_at INTEGER NOT NULL, PRIMARY KEY(client_id,id),
 FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS posts_calendar ON posts(client_id,scheduled_for,status);
CREATE TABLE IF NOT EXISTS brand_identities (
 client_id TEXT PRIMARY KEY, profile_json TEXT NOT NULL DEFAULT '{}',
 logo_asset_key TEXT, updated_at INTEGER NOT NULL,
 FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS assets (
 client_id TEXT NOT NULL, asset_id TEXT NOT NULL,
 r2_key TEXT NOT NULL, mime_type TEXT NOT NULL, size_bytes INTEGER NOT NULL,
 created_at INTEGER NOT NULL, PRIMARY KEY(client_id,asset_id),
 FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS rate_limits (
 key TEXT PRIMARY KEY, count INTEGER NOT NULL, reset_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS audit_log (
 id TEXT PRIMARY KEY, actor_id TEXT, action TEXT NOT NULL,
 target_id TEXT, created_at INTEGER NOT NULL,
 FOREIGN KEY(actor_id) REFERENCES users(id)
);
