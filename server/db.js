import fs from 'node:fs'
import path from 'node:path'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

const DATA_DIR = process.env.DATA_DIR || path.resolve('server/data')
const DB_FILE = path.join(DATA_DIR, 'tracker.db')

let dbPromise

async function init(db) {
  await db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      rate REAL NOT NULL,
      currency TEXT NOT NULL,
      color TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY,
      client_id TEXT,
      date TEXT NOT NULL,
      hours REAL NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      amount REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
    );
  `)
}

export async function getDb() {
  if (!dbPromise) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
    dbPromise = open({
      filename: DB_FILE,
      driver: sqlite3.Database,
    }).then(async (db) => {
      await init(db)
      return db
    })
  }

  return dbPromise
}
