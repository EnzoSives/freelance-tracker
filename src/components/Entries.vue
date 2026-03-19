<template>
  <div class="entries-view">
    <div class="filters">
      <select v-model="filterClient" class="filter-select">
        <option value="">Todos los clientes</option>
        <option v-for="c in store.clients" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <select v-model="filterMonth" class="filter-select">
        <option value="">Todos los meses</option>
        <option v-for="m in availableMonths" :key="m" :value="m">{{ monthLabel(m) }}</option>
      </select>
      <div class="filters-summary" v-if="filtered.length">
        <span class="mono">{{ fmtHours(totalHours) }}</span>
        <span class="sep">·</span>
        <span class="mono accent">{{ fmtMoney(totalAmount) }}</span>
      </div>
    </div>

    <div class="card">
      <div v-if="!filtered.length" class="empty">
        {{ store.entries.length ? 'Sin entradas para este filtro.' : 'Todavía no hay entradas registradas.' }}
      </div>
      <div v-else class="list">
        <EntryRow
          v-for="entry in filtered"
          :key="entry.id"
          :entry="entry"
          @delete="handleDelete"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTrackerStore } from '../stores/tracker.js'
import { useFormatters } from '../composables/useFormatters.js'
import EntryRow from './EntryRow.vue'

const store = useTrackerStore()
const { fmtHours, fmtMoney, monthLabel, getMonthStr } = useFormatters()

const filterClient = ref('')
const filterMonth = ref('')

const availableMonths = computed(() => {
  const months = [...new Set(store.entries.map(e => getMonthStr(e.date)))]
  return months.sort().reverse()
})

const filtered = computed(() => {
  return store.entries.filter(e => {
    const clientOk = !filterClient.value || e.clientId === filterClient.value
    const monthOk = !filterMonth.value || getMonthStr(e.date) === filterMonth.value
    return clientOk && monthOk
  })
})

const totalHours = computed(() => filtered.value.reduce((s, e) => s + e.hours, 0))
const totalAmount = computed(() => filtered.value.reduce((s, e) => s + e.amount, 0))

async function handleDelete(id) {
  try {
    await store.removeEntry(id)
  } catch (_err) {
    // Evita romper la UI si falla la API.
  }
}
</script>

<style scoped>
.entries-view { display: flex; flex-direction: column; gap: 1rem; }

.filters {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 7px 10px;
  color: var(--text-primary);
  outline: none;
  font-size: 13px;
  transition: border-color 0.15s;
}
.filter-select:focus { border-color: var(--border-focus); }

.filters-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  font-size: 13px;
  color: var(--text-secondary);
}
.sep { color: var(--text-tertiary); }
.accent { color: var(--accent); }

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 0.5rem 1.25rem;
}

.empty { color: var(--text-tertiary); font-size: 14px; padding: 1.5rem 0; }
.list { display: flex; flex-direction: column; }
.mono { font-family: var(--font-mono); }
</style>
