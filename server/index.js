import crypto from 'node:crypto'
import express from 'express'
import cors from 'cors'
import { getDb } from './db.js'

const app = express()
const PORT = Number(process.env.PORT || 3001)

app.use(cors())
app.use(express.json())

function toClient(row) {
  return {
    id: row.id,
    name: row.name,
    rate: row.rate,
    currency: row.currency,
    color: row.color,
  }
}

function toEntry(row) {
  return {
    id: row.id,
    clientId: row.client_id,
    date: row.date,
    hours: row.hours,
    desc: row.description,
    amount: row.amount,
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/bootstrap', async (_req, res, next) => {
  try {
    const db = await getDb()
    const clients = await db.all('SELECT * FROM clients ORDER BY created_at DESC')
    const entries = await db.all('SELECT * FROM entries ORDER BY date DESC, created_at DESC')
    res.json({
      clients: clients.map(toClient),
      entries: entries.map(toEntry),
    })
  } catch (error) {
    next(error)
  }
})

app.post('/api/clients', async (req, res, next) => {
  try {
    const db = await getDb()
    const { id, name, rate, currency, color } = req.body || {}

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'El nombre del cliente es obligatorio.' })
    }

    const safeRate = Number(rate)
    if (!Number.isFinite(safeRate) || safeRate <= 0) {
      return res.status(400).json({ message: 'La tarifa del cliente debe ser mayor a cero.' })
    }

    const client = {
      id: id || crypto.randomUUID(),
      name: String(name).trim(),
      rate: safeRate,
      currency: currency || 'USD',
      color: color || '#c8f04a',
    }

    await db.run(
      'INSERT INTO clients (id, name, rate, currency, color) VALUES (?, ?, ?, ?, ?)',
      client.id,
      client.name,
      client.rate,
      client.currency,
      client.color,
    )

    return res.status(201).json(client)
  } catch (error) {
    next(error)
  }
})

app.delete('/api/clients/:id', async (req, res, next) => {
  try {
    const db = await getDb()
    await db.run('DELETE FROM clients WHERE id = ?', req.params.id)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.post('/api/entries', async (req, res, next) => {
  try {
    const db = await getDb()
    const { id, clientId, date, hours, desc, amount } = req.body || {}

    if (!clientId) {
      return res.status(400).json({ message: 'El cliente es obligatorio.' })
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'La fecha debe tener formato YYYY-MM-DD.' })
    }

    const safeHours = Number(hours)
    if (!Number.isFinite(safeHours) || safeHours <= 0) {
      return res.status(400).json({ message: 'Las horas deben ser mayores a cero.' })
    }

    const client = await db.get('SELECT rate FROM clients WHERE id = ?', clientId)
    if (!client) {
      return res.status(404).json({ message: 'No se encontró el cliente seleccionado.' })
    }

    const safeAmount = Number.isFinite(Number(amount)) ? Number(amount) : safeHours * Number(client.rate || 0)

    const entry = {
      id: id || crypto.randomUUID(),
      clientId,
      date,
      hours: safeHours,
      desc: desc || '',
      amount: Math.round(safeAmount * 100) / 100,
    }

    await db.run(
      'INSERT INTO entries (id, client_id, date, hours, description, amount) VALUES (?, ?, ?, ?, ?, ?)',
      entry.id,
      entry.clientId,
      entry.date,
      entry.hours,
      entry.desc,
      entry.amount,
    )

    return res.status(201).json(entry)
  } catch (error) {
    next(error)
  }
})

app.delete('/api/entries/:id', async (req, res, next) => {
  try {
    const db = await getDb()
    await db.run('DELETE FROM entries WHERE id = ?', req.params.id)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.post('/api/import', async (req, res, next) => {
  try {
    const db = await getDb()
    const clients = Array.isArray(req.body?.clients) ? req.body.clients : []
    const entries = Array.isArray(req.body?.entries) ? req.body.entries : []

    await db.exec('BEGIN')
    try {
      for (const rawClient of clients) {
        const client = {
          id: rawClient.id || crypto.randomUUID(),
          name: String(rawClient.name || '').trim(),
          rate: Number(rawClient.rate || 0),
          currency: rawClient.currency || 'USD',
          color: rawClient.color || '#c8f04a',
        }

        if (!client.name || client.rate <= 0) {
          continue
        }

        await db.run(
          'INSERT OR IGNORE INTO clients (id, name, rate, currency, color) VALUES (?, ?, ?, ?, ?)',
          client.id,
          client.name,
          client.rate,
          client.currency,
          client.color,
        )
      }

      for (const rawEntry of entries) {
        const entry = {
          id: rawEntry.id || crypto.randomUUID(),
          clientId: rawEntry.clientId,
          date: rawEntry.date,
          hours: Number(rawEntry.hours || 0),
          desc: rawEntry.desc || '',
          amount: Number(rawEntry.amount || 0),
        }

        if (!entry.clientId || !entry.date || entry.hours <= 0) {
          continue
        }

        await db.run(
          'INSERT OR IGNORE INTO entries (id, client_id, date, hours, description, amount) VALUES (?, ?, ?, ?, ?, ?)',
          entry.id,
          entry.clientId,
          entry.date,
          entry.hours,
          entry.desc,
          entry.amount,
        )
      }

      await db.exec('COMMIT')
    } catch (error) {
      await db.exec('ROLLBACK')
      throw error
    }

    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ message: 'Error interno del servidor.' })
})

app.listen(PORT, () => {
  console.log(`API de Freelance Tracker corriendo en http://localhost:${PORT}`)
})
