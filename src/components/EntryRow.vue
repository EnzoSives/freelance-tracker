<template>
  <div class="entry-row">
    <div class="dot" :style="{ background: client?.color ?? '#555' }" />
    <div class="info">
      <span class="client-name">{{ client?.name ?? 'Cliente eliminado' }}</span>
      <span class="desc">{{ entry.desc || '—' }}</span>
    </div>
    <span class="date mono">{{ fmtDate(entry.date) }}</span>
    <div class="amounts">
      <span class="hours mono">{{ fmtHours(entry.hours) }}</span>
      <span class="amount mono">{{ fmtMoney(entry.amount, client?.currency) }}</span>
    </div>
    <button v-if="showDelete" class="del-btn" @click="$emit('delete', entry.id)">×</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTrackerStore } from '../stores/tracker.js'
import { useFormatters } from '../composables/useFormatters.js'

const props = defineProps({
  entry: { type: Object, required: true },
  showDelete: { type: Boolean, default: true },
})
defineEmits(['delete'])

const store = useTrackerStore()
const { fmtHours, fmtMoney, fmtDate } = useFormatters()

const client = computed(() => store.getClient(props.entry.clientId))
</script>

<style scoped>
.entry-row {
  display: grid;
  grid-template-columns: 10px 1fr auto auto auto;
  align-items: center;
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px solid var(--border);
  transition: background 0.15s;
}
.entry-row:last-child { border-bottom: none; }

.dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

.info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.client-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.desc {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.date { font-size: 12px; color: var(--text-tertiary); white-space: nowrap; }

.amounts { display: flex; flex-direction: column; align-items: flex-end; }
.hours { font-size: 13px; color: var(--text-secondary); }
.amount { font-size: 14px; color: var(--text-primary); font-weight: 500; }

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

.mono { font-family: var(--font-mono); }
</style>
