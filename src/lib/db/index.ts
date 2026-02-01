import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

// Ensure data directory exists
const dataDir = join(process.cwd(), "data");
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const dbPath = join(dataDir, "dincharya.db");

// Global to store the database instance
const globalForDb = globalThis as unknown as {
  db: BetterSQLite3Database<typeof schema> | undefined;
  sqlite: Database.Database | undefined;
};

function createDatabase() {
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("busy_timeout = 5000");

  // Initialize tables
  const initSQL = `
CREATE TABLE IF NOT EXISTS returns (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  orientation TEXT NOT NULL,
  feeling TEXT CHECK(feeling IN ('clear', 'neutral', 'heavy')),
  reflection TEXT,
  hour_of_day INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL,
  weather_code INTEGER,
  temperature REAL
);

CREATE TABLE IF NOT EXISTS alignments (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  scheduled_for TEXT NOT NULL CHECK(scheduled_for IN ('12:00', '18:00')),
  instruction TEXT NOT NULL,
  context TEXT,
  viewed_at INTEGER,
  completed_at INTEGER
);

CREATE TABLE IF NOT EXISTS user_context (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  latitude REAL,
  longitude REAL,
  timezone TEXT DEFAULT 'America/Los_Angeles',
  updated_at INTEGER
);

INSERT OR IGNORE INTO user_context (id, timezone) VALUES (1, 'America/Los_Angeles');
`;

  try {
    sqlite.exec(initSQL);
  } catch {
    // Ignore initialization errors during parallel builds
  }

  return { sqlite, db: drizzle(sqlite, { schema }) };
}

// In development, reuse the same instance across hot reloads
// In production, create a new instance
export const db = globalForDb.db ?? createDatabase().db;

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}
