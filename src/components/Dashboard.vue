<template>
  <div class="dashboard">
    <div class="metrics">
      <div class="metric">
        <span class="metric-label">Horas este mes</span>
        <span class="metric-value mono">{{ fmtHours(store.totalMonthHours) }}</span>
      </div>
      <div class="metric accent">
        <span class="metric-label">Ingresos del mes</span>
        <span class="metric-value mono">{{ fmtMoney(store.totalMonthEarnings) }}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Total histórico</span>
        <span class="metric-value mono">{{ fmtMoney(store.totalEarnings) }}</span>
      </div>
    </div>

    <div class="card" v-if="store.clientMonthStats.length">
      <h3 class="card-title">Por cliente — este mes</h3>
      <div class="client-stats">
        <div
          v-for="stat in store.clientMonthStats"
          :key="stat.client.id"
          class="client-stat-row"
        >
          <div class="client-dot" :style="{ background: stat.client.color }" />
          <span class="client-stat-name">{{ stat.client.name }}</span>
          <span class="client-stat-hours mono">{{ fmtHours(stat.hours) }}</span>
          <span class="client-stat-amount mono">{{ fmtMoney(stat.amount, stat.client.currency) }}</span>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 class="card-title">Últimas entradas</h3>
      <div v-if="!store.entries.length" class="empty">
        Todavía no hay entradas registradas.
      </div>
      <div v-else class="entries-preview">
        <EntryRow
          v-for="entry in store.entries.slice(0, 6)"
          :key="entry.id"
          :entry="entry"
          :show-delete="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTrackerStore } from '../stores/tracker.js'
import { useFormatters } from '../composables/useFormatters.js'
import EntryRow from './EntryRow.vue'

const store = useTrackerStore()
const { fmtHours, fmtMoney } = useFormatters()
</script>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: 1.25rem; }

.metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.metric {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1rem 1.125rem;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.metric.accent {
  border-color: var(--accent);
  background: var(--accent-dim);
}

.metric-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
}

.metric-value {
  font-size: 24px;
  font-weight: 500;
  color: var(--text-primary);
}

.metric.accent .metric-value {
  color: var(--accent);
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
}

.card-title {
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.client-stats { display: flex; flex-direction: column; gap: 4px; }

.client-stat-row {
  display: grid;
  grid-template-columns: 10px 1fr auto auto;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}
.client-stat-row:last-child { border-bottom: none; }

.client-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.client-stat-name { font-size: 14px; color: var(--text-primary); }
.client-stat-hours { font-size: 13px; color: var(--text-secondary); }
.client-stat-amount { font-size: 14px; color: var(--text-primary); min-width: 80px; text-align: right; }

.empty { color: var(--text-tertiary); font-size: 14px; padding: 1rem 0; }

.entries-preview { display: flex; flex-direction: column; gap: 4px; }

.mono { font-family: var(--font-mono); }

@media (max-width: 600px) {
  .metrics { grid-template-columns: 1fr; }
}
</style>
