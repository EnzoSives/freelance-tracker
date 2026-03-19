<template>
  <div class="log-view">

    <!-- TIMER -->
    <div class="card">
      <h3 class="card-title">Cronómetro</h3>
      <div class="timer-display mono" :class="{ running: timer.running.value }">
        {{ timer.display.value }}
      </div>
      <div class="timer-controls">
        <button class="btn btn-accent" @click="timer.toggle()">
          {{ timer.running.value ? 'Pausar' : timer.elapsed.value > 0 ? 'Continuar' : 'Iniciar' }}
        </button>
        <button class="btn" @click="timer.reset()" :disabled="timer.elapsed.value === 0">
          Resetear
        </button>
      </div>
      <div class="form-fields">
        <div class="form-group">
          <label>Cliente</label>
          <select v-model="timerClientId">
            <option value="" disabled>Seleccioná un cliente</option>
            <option v-for="c in store.clients" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Descripción</label>
          <input v-model="timerDesc" type="text" placeholder="Ej: desarrollo feature X, reunión..." />
        </div>
      </div>
      <div class="form-footer">
        <span v-if="timerClientId && timer.elapsed.value > 0" class="preview mono">
          = {{ fmtMoney(timer.hours.value * (store.getClient(timerClientId)?.rate ?? 0), store.getClient(timerClientId)?.currency) }}
        </span>
        <button class="btn btn-primary" @click="saveTimer">Guardar sesión</button>
      </div>
      <p v-if="timerError" class="error">{{ timerError }}</p>
    </div>

    <!-- MANUAL -->
    <div class="card">
      <h3 class="card-title">Carga manual</h3>
      <div class="form-grid-2">
        <div class="form-group">
          <label>Cliente</label>
          <select v-model="manualClientId">
            <option value="" disabled>Seleccioná un cliente</option>
            <option v-for="c in store.clients" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Fecha</label>
          <input v-model="manualDate" type="date" />
        </div>
      </div>

      <div class="divider-label">Horario (opcional)</div>

      <div class="form-grid-3">
        <div class="form-group">
          <label>Inicio</label>
          <input v-model="manualStart" type="time" @change="calcFromTime" />
        </div>
        <div class="form-group">
          <label>Fin</label>
          <input v-model="manualEnd" type="time" @change="calcFromTime" />
        </div>
        <div class="form-group">
          <label>Horas totales</label>
          <input v-model.number="manualHours" type="number" placeholder="2.5" min="0" step="0.25" />
        </div>
      </div>

      <div class="form-group">
        <label>Descripción</label>
        <input v-model="manualDesc" type="text" placeholder="Descripción del trabajo" />
      </div>

      <div class="form-footer">
        <span v-if="manualClientId && manualHours > 0" class="preview mono">
          {{ fmtHours(manualHours) }} = {{ fmtMoney(manualHours * (store.getClient(manualClientId)?.rate ?? 0), store.getClient(manualClientId)?.currency) }}
        </span>
        <button class="btn btn-primary" @click="saveManual">Guardar entrada</button>
      </div>
      <p v-if="manualError" class="error">{{ manualError }}</p>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTrackerStore } from '../stores/tracker.js'
import { useTimer } from '../composables/useTimer.js'
import { useFormatters } from '../composables/useFormatters.js'

const store = useTrackerStore()
const timer = useTimer()
const { fmtHours, fmtMoney, todayStr } = useFormatters()

// Timer form
const timerClientId = ref('')
const timerDesc = ref('')
const timerError = ref('')

async function saveTimer() {
  timerError.value = ''
  if (timer.elapsed.value < 60) { timerError.value = 'Iniciá el cronómetro primero (mín. 1 minuto).'; return }
  if (!timerClientId.value) { timerError.value = 'Seleccioná un cliente.'; return }
  try {
    await store.addEntry({
      clientId: timerClientId.value,
      date: todayStr(),
      hours: timer.hours.value,
      desc: timerDesc.value || 'Sesión de trabajo',
    })
    timer.reset()
    timerDesc.value = ''
  } catch (err) {
    timerError.value = err instanceof Error ? err.message : 'No se pudo guardar la sesión.'
  }
}

// Manual form
const manualClientId = ref('')
const manualDate = ref(todayStr())
const manualStart = ref('')
const manualEnd = ref('')
const manualHours = ref(null)
const manualDesc = ref('')
const manualError = ref('')

function calcFromTime() {
  if (!manualStart.value || !manualEnd.value) return
  const [sh, sm] = manualStart.value.split(':').map(Number)
  const [eh, em] = manualEnd.value.split(':').map(Number)
  const h = (eh * 60 + em - sh * 60 - sm) / 60
  if (h > 0) manualHours.value = Math.round(h * 100) / 100
}

async function saveManual() {
  manualError.value = ''
  if (!manualClientId.value) { manualError.value = 'Seleccioná un cliente.'; return }
  if (!manualDate.value) { manualError.value = 'Ingresá una fecha.'; return }
  if (!manualHours.value || manualHours.value <= 0) { manualError.value = 'Ingresá las horas trabajadas.'; return }
  try {
    await store.addEntry({
      clientId: manualClientId.value,
      date: manualDate.value,
      hours: manualHours.value,
      desc: manualDesc.value,
    })
    manualHours.value = null
    manualStart.value = ''
    manualEnd.value = ''
    manualDesc.value = ''
    manualDate.value = todayStr()
  } catch (err) {
    manualError.value = err instanceof Error ? err.message : 'No se pudo guardar la entrada.'
  }
}
</script>

<style scoped>
.log-view { display: flex; flex-direction: column; gap: 1.25rem; }

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

.timer-display {
  font-size: 52px;
  font-weight: 300;
  letter-spacing: -0.02em;
  color: var(--text-secondary);
  text-align: center;
  padding: 0.5rem 0 1rem;
  transition: color 0.3s;
}
.timer-display.running { color: var(--accent); }

.timer-controls {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.form-fields { display: flex; flex-direction: column; gap: 10px; }

.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
.form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 10px; }

.divider-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-tertiary);
  margin: 1rem 0 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
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
.form-group input:focus,
.form-group select:focus { border-color: var(--border-focus); }

.form-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 1rem;
}

.preview { font-size: 13px; color: var(--accent); }

.btn {
  padding: 8px 18px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-primary);
  transition: background 0.15s, border-color 0.15s;
}
.btn:hover { background: var(--bg-hover); border-color: var(--border-focus); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-accent { border-color: var(--accent); color: var(--accent); }
.btn-accent:hover { background: var(--accent-dim); }
.btn-primary { background: var(--accent); color: var(--accent-text); border-color: var(--accent); font-weight: 500; }
.btn-primary:hover { opacity: 0.88; }

.error { font-size: 12px; color: var(--danger); margin-top: 8px; }

.mono { font-family: var(--font-mono); }

@media (max-width: 600px) {
  .form-grid-2, .form-grid-3 { grid-template-columns: 1fr; }
}
</style>
