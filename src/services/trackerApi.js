const API_BASE = '/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    let message = 'No se pudo completar la operación con la API.'
    try {
      const data = await response.json()
      if (data?.message) {
        message = data.message
      }
    } catch (_error) {
      // ignored: cuerpo sin JSON
    }
    throw new Error(message)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export const trackerApi = {
  bootstrap() {
    return request('/bootstrap')
  },
  addClient(payload) {
    return request('/clients', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  removeClient(id) {
    return request(`/clients/${id}`, {
      method: 'DELETE',
    })
  },
  addEntry(payload) {
    return request('/entries', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  removeEntry(id) {
    return request(`/entries/${id}`, {
      method: 'DELETE',
    })
  },
  importData(payload) {
    return request('/import', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}
