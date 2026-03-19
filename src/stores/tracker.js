import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { trackerApi } from '@/services/trackerApi'

const COLORS = ['#c8f04a', '#4af0c8', '#f04a8a', '#f0c84a', '#4a8af0', '#c84af0', '#f07a4a']
const LEGACY_STORAGE_KEY = import.meta.env.VITE_STORAGE_KEY || 'freelance_tracker_v2'

export const useTrackerStore = defineStore('tracker', () => {
  const clients = ref([])
  const entries = ref([])
  const loading = ref(false)
  const initialized = ref(false)
  const error = ref('')

  function loadLegacyLocalData() {
    const saved = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!saved) return null
    try {
      const data = JSON.parse(saved)
      return {
        clients: Array.isArray(data.clients) ? data.clients : [],
        entries: Array.isArray(data.entries) ? data.entries : [],
      }
    } catch (_error) {
      return null
    }
  }

  async function initialize() {
    if (initialized.value || loading.value) return
    loading.value = true
    error.value = ''

    try {
      let data = await trackerApi.bootstrap()

      const legacy = loadLegacyLocalData()
      if (legacy && data.clients.length === 0 && data.entries.length === 0) {
        await trackerApi.importData(legacy)
        data = await trackerApi.bootstrap()
      }

      clients.value = data.clients
      entries.value = data.entries
      initialized.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'No se pudo conectar con la base de datos.'
      throw err
    } finally {
      loading.value = false
    }
  }

  // --- Clients ---
  async function addClient(payload) {
    error.value = ''
    const client = await trackerApi.addClient(payload)
    clients.value.unshift(client)
    return client
  }

  async function removeClient(id) {
    error.value = ''
    await trackerApi.removeClient(id)
    clients.value = clients.value.filter(c => c.id !== id)
  }

  function getClient(id) {
    return clients.value.find(c => c.id === id)
  }

  // --- Entries ---
  async function addEntry(payload) {
    error.value = ''
    const entry = await trackerApi.addEntry(payload)
    entries.value.unshift(entry)
    return entry
  }

  async function removeEntry(id) {
    error.value = ''
    await trackerApi.removeEntry(id)
    entries.value = entries.value.filter(e => e.id !== id)
  }

  // --- Computed ---
  const currentMonth = computed(() => {
    const n = new Date()
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`
  })

  const monthEntries = computed(() =>
    entries.value.filter(e => e.date.startsWith(currentMonth.value))
  )

  const totalMonthHours = computed(() =>
    monthEntries.value.reduce((s, e) => s + e.hours, 0)
  )

  const totalMonthEarnings = computed(() =>
    monthEntries.value.reduce((s, e) => s + e.amount, 0)
  )

  const totalEarnings = computed(() =>
    entries.value.reduce((s, e) => s + e.amount, 0)
  )

  const clientMonthStats = computed(() => {
    const map = {}
    monthEntries.value.forEach(e => {
      if (!map[e.clientId]) map[e.clientId] = { hours: 0, amount: 0 }
      map[e.clientId].hours += e.hours
      map[e.clientId].amount += e.amount
    })
    return Object.entries(map).map(([id, stats]) => ({
      client: getClient(id),
      ...stats,
    })).filter(s => s.client)
  })

  const availableColors = computed(() => COLORS)

  return {
    clients,
    entries,
    loading,
    initialized,
    error,
    initialize,
    addClient,
    removeClient,
    getClient,
    addEntry,
    removeEntry,
    currentMonth,
    monthEntries,
    totalMonthHours,
    totalMonthEarnings,
    totalEarnings,
    clientMonthStats,
    availableColors,
  }
})
