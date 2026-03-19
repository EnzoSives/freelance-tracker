export function useFormatters() {
  const CURRENCY_SYMBOLS = { USD: '$', ARS: '$', EUR: '€', GBP: '£' }

  function fmtHours(h) {
    const hh = Math.floor(h)
    const mm = Math.round((h - hh) * 60)
    if (hh === 0) return `${mm}m`
    return mm > 0 ? `${hh}h ${mm}m` : `${hh}h`
  }

  function fmtMoney(amount, currency = 'USD') {
    const sym = CURRENCY_SYMBOLS[currency] || '$'
    return `${sym}${amount.toFixed(2).replace(/\.00$/, '')}`
  }

  function fmtDate(dateStr) {
    const [y, m, d] = dateStr.split('-')
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
    return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`
  }

  function monthLabel(monthStr) {
    const [y, m] = monthStr.split('-')
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    return `${months[parseInt(m) - 1]} ${y}`
  }

  function getMonthStr(dateStr) {
    return dateStr.substring(0, 7)
  }

  function todayStr() {
    return new Date().toISOString().split('T')[0]
  }

  return { fmtHours, fmtMoney, fmtDate, monthLabel, getMonthStr, todayStr }
}
