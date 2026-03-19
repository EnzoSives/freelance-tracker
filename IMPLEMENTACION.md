# 🚀 Guía de Implementación - Próximos Pasos

Tu proyecto ha sido **reestructurado correctamente**. Aquí está la guía para completar la migración.

## ✅ Lo que ya está hecho

- ✅ Estructura de carpetas organizada
- ✅ Path aliases configurados en `vite.config.js`
- ✅ Variables de entorno configuradas
- ✅ Documentación creada
- ✅ `.gitignore` configurado

## 🔄 Pasos para Migrar tu Código Existente

### Paso 1: Reorganizar Componentes

Mueve tus componentes Vue a la nueva estructura:

```bash
# Componentes de layout
src/components/layout/
  └── Sidebar.vue  (si lo extraes de App.vue)

# Componentes de features
src/components/features/
  ├── Clients.vue
  ├── Dashboard.vue
  ├── Entries.vue
  ├── EntryRow.vue
  └── LogHours.vue
```

### Paso 2: Actualizar Imports

Cambia los imports para usar **path aliases**:

❌ **Antigua forma**:
```javascript
import { useTimer } from '../../../composables/useTimer'
import { useTrackerStore } from '../../../stores/tracker'
```

✅ **Nueva forma**:
```javascript
import { useTimer } from '@/composables/useTimer'
import { useTrackerStore } from '@/stores/tracker'
```

### Paso 3: Crear Utilidades

Extraer funciones a `src/utils/`:

```javascript
// src/utils/constants.js
export const CURRENCY_SYMBOLS = {
  USD: '$',
  ARS: '$',
  EUR: '€', 
  GBP: '£'
}

export const COLORS = [
  '#c8f04a', '#4af0c8', '#f04a8a',
  '#f0c84a', '#4a8af0', '#c84af0', '#f07a4a'
]
```

```javascript
// src/utils/validators.js
export function validateClient(client) {
  if (!client.name?.trim()) return false
  if (!client.hourlyRate) return false
  return true
}
```

### Paso 4: Actualizar App.vue

Usa path aliases en App.vue:

```vue
<script setup>
import { ref } from 'vue'
import { useTrackerStore } from '@/stores/tracker'
import { useFormatters } from '@/composables/useFormatters'
// import Sidebar from '@/components/layout/Sidebar.vue'
</script>
```

### Paso 5: Limpiar Archivos Antiguos

Elimina el archivo antiguo (ya no se usa):
```bash
rm src/style.css
```

## 📋 Checklist de Migración

- [ ] Reorganizar componentes a `src/components/features/`
- [ ] Actualizar todos los imports a usar `@/`
- [ ] Crear `src/utils/constants.js` con constantes
- [ ] Crear `src/utils/validators.js` con validadores
- [ ] Eliminar `src/style.css`
- [ ] Probar en desarrollo: `npm run dev`
- [ ] Probar build: `npm run build`
- [ ] Verificar que no haya errores de import

## 🔗 Alias de Importación Disponibles

```javascript
// Imports con alias
import Component from '@/components/features/Clients.vue'
import { useTimer } from '@/composables/useTimer'
import { useTrackerStore } from '@/stores/tracker'
import { formatters } from '@/utils/formatters'
import '@/styles/global.css'
import logo from '@/assets/logo.png'
```

## 📝 Ejemplo Completo de Component Migrado

```vue
<template>
  <div class="clients-container">
    <h1>Clientes</h1>
    <p v-if="store.clients.length === 0" class="empty">
      No hay clientes aún
    </p>
    <ul v-else class="client-list">
      <li v-for="client in store.clients" :key="client.id">
        {{ client.name }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTrackerStore } from '@/stores/tracker'
import { useFormatters } from '@/composables/useFormatters'

// Composables
const store = useTrackerStore()
const { fmtMoney } = useFormatters()

// Computed
const totalEarnings = computed(() => {
  return store.clients.reduce((sum, c) => sum + c.earnings, 0)
})
</script>

<style scoped>
.clients-container {
  padding: var(--radius-md);
}

.client-list {
  list-style: none;
}

.client-list li {
  padding: var(--radius-sm);
  margin-bottom: var(--radius-sm);
  background: var(--bg-card);
  border-radius: var(--radius-sm);
}

.empty {
  color: var(--text-secondary);
  text-align: center;
  padding: 2rem;
}
</style>
```

## 🆘 Solución de Problemas

### Error: "Cannot find module '@/components/...'"

**Solución**: Verifica que el path en `vite.config.js` sea correcto y reinicia el servidor dev.

```bash
npm run dev
```

### Componentes no se actualizan

**Solución**: Limpia y reinicia:
```bash
rm -rf node_modules/.vite
npm run dev
```

### Build falla con errores de import

**Solución**: Asegúrate que las rutas dentro de alias inicien con `/`:

❌ `'src/components'`  ← Mal
✅ `'src/components/'` ← Bien

## 📚 Recursos Útiles

- [Documentación Vite Path Alias](https://vitejs.dev/config/shared-options.html#resolve-alias)
- [Vue 3 SFC Spec](https://vuejs.org/guide/scaling-up/sfc.html)
- [Pinia Store Documentation](https://pinia.vuejs.org/)
- [CSS Variables MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)

## 🎉 ¡Listo!

Una vez completes estos pasos, tu proyecto tendrá:

✅ Estructura profesional y escalable
✅ Imports limpios y mantenibles
✅ Separación clara de responsabilidades
✅ Fácil de mantener y extender
✅ Listo para agregar tests y CI/CD

**¡Tu proyecto está bien estructurado! 🚀**
