<template>
  <div class="layout">

    <aside class="sidebar">
      <div class="brand">
        <span class="brand-icon mono">⏱</span>
        <span class="brand-name">hours</span>
      </div>

      <nav class="nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="nav-item"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <span class="nav-icon">{{ tab.icon }}</span>
          <span class="nav-label">{{ tab.label }}</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <div class="quick-stats">
          <span class="qs-label">Este mes</span>
          <span class="qs-value mono">{{ fmtHours(store.totalMonthHours) }}</span>
          <span class="qs-earn mono">{{ fmtMoney(store.totalMonthEarnings) }}</span>
        </div>
      </div>
    </aside>

    <main class="main">
      <div class="page-header">
        <h1 class="page-title">{{ currentTab.label }}</h1>
      </div>

      <div class="page-content">
        <div v-if="store.loading" class="status-card">Conectando con la base de datos...</div>
        <div v-else-if="store.error" class="status-card status-error">{{ store.error }}</div>
        <component v-else :is="currentTab.component" />
      </div>
    </main>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTrackerStore } from './stores/tracker.js'
import { useFormatters } from './composables/useFormatters.js'
import Dashboard from './components/Dashboard.vue'
import LogHours from './components/LogHours.vue'
import Entries from './components/Entries.vue'
import Clients from './components/Clients.vue'

const store = useTrackerStore()
const { fmtHours, fmtMoney } = useFormatters()

const tabs = [
  { id: 'dashboard', label: 'Resumen',       icon: '▦', component: Dashboard },
  { id: 'log',       label: 'Registrar',      icon: '◉', component: LogHours },
  { id: 'entries',   label: 'Entradas',       icon: '≡', component: Entries },
  { id: 'clients',   label: 'Clientes',       icon: '◈', component: Clients },
]

const activeTab = ref('dashboard')
const currentTab = computed(() => tabs.find(t => t.id === activeTab.value))

onMounted(() => {
  store.initialize().catch(() => {
    // El mensaje ya se setea en el store.
  })
})
</script>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  min-height: 100vh;
}

.sidebar {
  background: var(--bg-card);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0;
  position: sticky;
  top: 0;
  height: 100vh;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 1rem;
}
.brand-icon { font-size: 16px; }
.brand-name {
  font-size: 17px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--text-primary);
  font-family: var(--font-mono);
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 8px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 16px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  text-align: left;
  transition: background 0.15s, color 0.15s;
  width: 100%;
}
.nav-item:hover { background: var(--bg-hover); color: var(--text-primary); }
.nav-item.active { background: var(--accent-dim); color: var(--accent); }

.nav-icon { font-size: 14px; width: 16px; text-align: center; }
.nav-label { font-weight: 400; }

.sidebar-footer {
  padding: 1.25rem;
  border-top: 1px solid var(--border);
  margin-top: auto;
}

.quick-stats {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.qs-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-tertiary); }
.qs-value { font-size: 18px; font-weight: 300; color: var(--text-primary); }
.qs-earn { font-size: 13px; color: var(--accent); }

.main {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.page-header {
  padding: 1.5rem 2rem 0;
  border-bottom: 1px solid var(--border);
  padding-bottom: 1rem;
  margin-bottom: 0;
}
.page-title {
  font-size: 20px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--text-primary);
}

.page-content {
  padding: 1.5rem 2rem;
  flex: 1;
  max-width: 900px;
}

.status-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  padding: 1rem 1.25rem;
}

.status-error {
  border-color: var(--danger);
  color: var(--danger);
}

.mono { font-family: var(--font-mono); }

@media (max-width: 640px) {
  .layout { grid-template-columns: 1fr; }
  .sidebar {
    position: static;
    height: auto;
    flex-direction: row;
    padding: 0;
    border-right: none;
    border-bottom: 1px solid var(--border);
    overflow-x: auto;
  }
  .brand { display: none; }
  .nav { flex-direction: row; padding: 8px; gap: 4px; flex: unset; }
  .sidebar-footer { display: none; }
  .nav-label { display: none; }
  .nav-item { padding: 8px 12px; }
  .page-content { padding: 1rem; }
}
</style>
