# Guía de Estructura y Organización

## 📂 Organización de Archivos

### Componentes

#### `src/components/layout/`
Componentes para la estructura general de la página (no cambian frecuentemente):
- `Sidebar.vue` - Sidebar de navegación
- `Header.vue` - Encabezado
- `Navigation.vue` - Menú de navegación

**Uso**: Importa desde App.vue directamente
```vue
import Sidebar from '@components/layout/Sidebar.vue'
```

#### `src/components/features/`
Componentes específicos de features/páginas:
- `Clients.vue` - Componente de clientes
- `Dashboard.vue` - Panel de control
- `Entries.vue` - Registro de horas
- `LogHours.vue` - Formulario de registro
- `EntryRow.vue` - Fila de entrada

**Estructura recomendada**:
```
features/
├── clients/
│   ├── Clients.vue
│   ├── ClientList.vue
│   └── ClientForm.vue
├── entries/
│   ├── Entries.vue
│   ├── EntryRow.vue
│   └── EntryForm.vue
└── dashboard/
    └── Dashboard.vue
```

### Composables

Lógica reutilizable que puede compartirse entre componentes:

- `useTimer.js` - Lógica del cronómetro
- `useFormatters.js` - Funciones de formateo
- `useStorage.js` - Gestión de localStorage
- `useFetch.js` - Llamadas HTTP (si se necesita)

**Uso en componentes**:
```vue
<script setup>
import { useTimer } from '@/composables/useTimer'
const { running, display, toggle } = useTimer()
</script>
```

### Stores

Estado global con Pinia:

- `tracker.js` - Store principal con clientes y entradas

**Estructura recomendada**:
```
stores/
├── tracker.js
├── ui.js (para estado de UI)
└── settings.js (para configuración)
```

### Utils

Funciones utilitarias puras:

- `formatters.js` - Funciones de formateo
- `validators.js` - Validación de datos
- `constants.js` - Constantes de la app
- `helpers.js` - Funciones auxiliares

### Styles

Estilos CSS globales:

- `global.css` - Variables CSS, resets y estilos base
- `variables.css` - (opcional) Variables CSS separ adas
- `components.css` - (opcional) Estilos de componentes reutilizables

## 🎯 Mejores Prácticas

### 1. Imports usando Aliases

❌ **Mal**:
```javascript
import { useTimer } from '../../../composables/useTimer'
```

✅ **Bien**:
```javascript
import { useTimer } from '@/composables/useTimer'
```

### 2. Nombres de Archivos

- **Componentes**: `PascalCase.vue` (ej: `LogHours.vue`)
- **Composables**: camelCase con prefijo `use` (ej: `useTimer.js`)
- **Stores**: camelCase (ej: `tracker.js`)
- **Utils**: camelCase (ej: `formatters.js`)

### 3. Estructura de Componentes Vue 3

```vue
<template>
  <!-- Template aquí -->
</template>

<script setup>
// Imports
import { ref, computed } from 'vue'
import { useStore } from '@/stores/tracker'
import { useTimer } from '@/composables/useTimer'

// Reactive state
const store = useStore()
const { display } = useTimer()

// Methods
const handleClick = () => { }
</script>

<style scoped>
/* Estilos específicos del componente */
</style>
```

### 4. Variable de Entorno

```bash
# .env.local (no incluir en git)
VITE_STORAGE_KEY=freelance_tracker_v2
VITE_APP_TITLE=Freelance Tracker
```

Acceso en código:
```javascript
const storageKey = import.meta.env.VITE_STORAGE_KEY
```

## 🔄 Próximos Pasos

1. **Mover componentes a sus carpetas**:
   - `clients/`, `entries/`, `dashboard/` en `components/features/`

2. **Extraer lógica a composables**:
   - Formatos → `useFormatters.js` ✓
   - Cronómetro → `useTimer.js` ✓
   - CRUD de clientes/entradas → `useRecords.js`

3. **Migrar a Store Pinia**:
   - Mantienen estado en `tracker.js` ✓

4. **Agregar validaciones**:
   - Crear `utils/validators.js`
   - Crear `composables/useValidation.js`

5. **Mejorar estilos**:
   - Separar estilos por componentes
   - Usar CSS Modules si se necesita mayor aislamiento

## Alias Disponibles

```javascript
@ → src/
@components → src/components/
@composables → src/composables/
@stores → src/stores/
@utils → src/utils/
@styles → src/styles/
@assets → src/assets/
```
