<template>
  <div class="clients-view">

    <!-- ADD CLIENT FORM -->
    <div class="card">
      <h3 class="card-title">Nuevo cliente</h3>
      <div class="form-grid-2">
        <div class="form-group">
          <label>Nombre</label>
          <input v-model="form.name" type="text" placeholder="Ej: Acme Corp" />
        </div>
        <div class="form-group">
          <label>Tarifa por hora</label>
          <input v-model.number="form.rate" type="number" placeholder="50" min="0" step="0.5" />
        </div>
      </div>
      <div class="form-grid-2">
        <div class="form-group">
          <label>Moneda</label>
          <select v-model="form.currency">
            <option value="USD">USD — Dólar</option>
            <option value="ARS">ARS — Peso arg.</option>
            <option value="EUR">EUR — Euro</option>
            <option value="GBP">GBP — Libra</option>
          </select>
        </div>
        <div class="form-group">
          <label>Color identificador</label>
          <div class="color-picker">
            <button
              v-for="color in store.availableColors"
              :key="color"
              class="color-swatch"
              :class="{ selected: form.color === color }"
              :style="{ background: color }"
              @click="form.color = color"
            />
          </div>
        </div>
      </div>
      <div class="form-footer">
        <button class="btn btn-primary" @click="submit">Agregar cliente</button>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
    </div>

    <!-- CLIENT LIST -->
    <div class="card">
      <h3 class="card-title">Clientes registrados ({{ store.clients.length }})</h3>
      <div v-if="!store.clients.length" class="empty">
        Todavía no agregaste ningún cliente.
      </div>
      <div v-else class="client-list">
        <div v-for="c in store.clients" :key="c.id" class="client-row">
          <div class="client-color" :style="{ background: c.color }" />
          <div class="client-info">
            <span class="client-name">{{ c.name }}</span>
            <span class="client-rate mono">{{ fmtMoney(c.rate, c.currency) }}/h · {{ c.currency }}</span>
          </div>
          <div class="client-stats-inline">
            <span class="mono">{{ fmtHours(clientHours(c.id)) }}</span>
            <span class="mono accent">{{ fmtMoney(clientEarnings(c.id), c.currency) }}</span>
          </div>
          <button class="del-btn" @click="remove(c.id)">×</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTrackerStore } from '../stores/tracker.js'
import { useFormatters } from '../composables/useFormatters.js'

const store = useTrackerStore()
const { fmtMoney, fmtHours } = useFormatters()

const form = ref({
  name: '',
  rate: null,
  currency: 'USD',
  color: store.availableColors[0],
})
const error = ref('')

async function submit() {
  error.value = ''
  if (!form.value.name.trim()) { error.value = 'Ingresá el nombre del cliente.'; return }
  if (!form.value.rate || form.value.rate <= 0) { error.value = 'Ingresá una tarifa válida.'; return }
  try {
    await store.addClient({ ...form.value, name: form.value.name.trim() })
    form.value.name = ''
    form.value.rate = null
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'No se pudo guardar el cliente.'
  }
}

async function remove(id) {
  if (!confirm('¿Eliminar este cliente? Las entradas asociadas se mantendrán.')) return
  try {
    await store.removeClient(id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'No se pudo eliminar el cliente.'
  }
}

function clientHours(id) {
  return store.entries.filter(e => e.clientId === id).reduce((s, e) => s + e.hours, 0)
}

function clientEarnings(id) {
  return store.entries.filter(e => e.clientId === id).reduce((s, e) => s + e.amount, 0)
}
</script>

<style scoped>
.clients-view { display: flex; flex-direction: column; gap: 1.25rem; }

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
}

.card-title {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
  margin-bottom: 1.25rem;
}

.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }

.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-secondary);
}
.form-group input,
.form-group select {
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
}
.form-group input:focus, .form-group select:focus { border-color: var(--border-focus); }

.color-picker { display: flex; gap: 8px; align-items: center; padding: 4px 0; }
.color-swatch {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid transparent;
  transition: transform 0.15s, border-color 0.15s;
  outline: none;
}
.color-swatch:hover { transform: scale(1.15); }
.color-swatch.selected { border-color: var(--text-primary); transform: scale(1.2); }

.form-footer { display: flex; justify-content: flex-end; margin-top: 1rem; }

.btn {
  padding: 8px 18px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-primary);
  transition: background 0.15s;
}
.btn-primary { background: var(--accent); color: var(--accent-text); border-color: var(--accent); font-weight: 500; }
.btn-primary:hover { opacity: 0.88; }

.error { font-size: 12px; color: var(--danger); margin-top: 8px; }

.client-list { display: flex; flex-direction: column; }
.client-row {
  display: grid;
  grid-template-columns: 12px 1fr auto auto;
  align-items: center;
  gap: 12px;
  padding: 11px 0;
  border-bottom: 1px solid var(--border);
}
.client-row:last-child { border-bottom: none; }
.client-color { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.client-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.client-name { font-size: 14px; font-weight: 500; color: var(--text-primary); }
.client-rate { font-size: 12px; color: var(--text-secondary); }
.client-stats-inline { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; font-size: 12px; color: var(--text-secondary); }
.accent { color: var(--accent); }
.del-btn {
  background: none;
  border: none;
  color: var(--text-tertiary);
  font-size: 18px;
  line-height: 1;
  padding: 0 4px;
  transition: color 0.15s;
}
.del-btn:hover { color: var(--danger); }

.empty { color: var(--text-tertiary); font-size: 14px; padding: 0.5rem 0; }
.mono { font-family: var(--font-mono); }

@media (max-width: 600px) {
  .form-grid-2 { grid-template-columns: 1fr; }
}
</style>
