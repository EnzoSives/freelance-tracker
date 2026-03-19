import { ref, computed, onUnmounted } from 'vue'

export function useTimer() {
  const running = ref(false)
  const elapsed = ref(0) // seconds
  let interval = null
  let startedAt = null

  function start() {
    if (running.value) return
    running.value = true
    startedAt = Date.now() - elapsed.value * 1000
    interval = setInterval(() => {
      elapsed.value = Math.floor((Date.now() - startedAt) / 1000)
    }, 1000)
  }

  function pause() {
    if (!running.value) return
    running.value = false
    clearInterval(interval)
  }

  function toggle() {
    running.value ? pause() : start()
  }

  function reset() {
    pause()
    elapsed.value = 0
  }

  const display = computed(() => {
    const h = Math.floor(elapsed.value / 3600)
    const m = Math.floor((elapsed.value % 3600) / 60)
    const s = elapsed.value % 60
    return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
  })

  const hours = computed(() => elapsed.value / 3600)

  onUnmounted(() => clearInterval(interval))

  return { running, elapsed, display, hours, toggle, reset, start, pause }
}
