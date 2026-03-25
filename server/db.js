import pg from 'pg'

const { Pool } = pg

let pool

// Convert SQLite-style ? placeholders to PostgreSQL $1, $2, ...
function toPositional(sql) {
  let i = 0
  return sql.replace(/\?/g, () => `$${++i}`)
}

async function init(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      rate DOUBLE PRECISION NOT NULL,
      currency TEXT NOT NULL,
      color TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY,
      client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
      date TEXT NOT NULL,
      hours DOUBLE PRECISION NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      amount DOUBLE PRECISION NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `)
}

export async function getDb() {
  if (!pool) {
    pool = new Pool({
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT || 5432),
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      connectionString: process.env.DATABASE_URL || undefined,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })
    const client = await pool.connect()
    try {
      await init(client)
    } finally {
      client.release()
    }
  }

  return {
    all: (sql, ...params) => pool.query(toPositional(sql), params).then(r => r.rows),
    get: (sql, ...params) => pool.query(toPositional(sql), params).then(r => r.rows[0] ?? null),
    run: (sql, ...params) => pool.query(toPositional(sql), params),
    exec: (sql) => pool.query(sql),
    transaction: async (fn) => {
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        await fn({
          run: (sql, ...params) => client.query(toPositional(sql), params),
        })
        await client.query('COMMIT')
      } catch (err) {
        await client.query('ROLLBACK')
        throw err
      } finally {
        client.release()
      }
    },
  }
}
