# Freelance Tracker

Aplicación web para rastrear horas de trabajo y ganancias en proyectos freelance.

## 🚀 Características

- ⏱️ Cronómetro integrado para registrar horas de trabajo
- 💰 Seguimiento de ingresos por cliente
- 📊 Estadísticas mensuales
- 🗄️ Almacenamiento persistente en base de datos SQLite
- 🔌 API REST con Express para clientes y entradas

## 📁 Estructura del Proyecto

```
src/
├── assets/              # Imágenes, fuentes y recursos estáticos
├── components/          # Componentes Vue reutilizables
│   ├── layout/         # Componentes de layout (Sidebar, Header)
│   └── features/       # Componentes específicos de features
├── composables/         # Composables (lógica reutilizable)
├── stores/             # Tiendas Pinia para estado global
├── styles/             # Estilos CSS globales
├── utils/              # Funciones utilitarias
├── App.vue             # Componente raíz
└── main.js             # Punto de entrada

server/
├── data/               # Archivo de base de datos SQLite
├── db.js               # Inicialización de SQLite y esquema
└── index.js            # API REST (Express)
```

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build

# Previsualizar build
npm run preview
```

## 📝 Scripts Disponibles

- `npm run dev` - Inicia frontend (Vite) + backend (Express) en paralelo
- `npm run dev:client` - Inicia solo frontend
- `npm run dev:server` - Inicia solo backend API
- `npm run build` - Compila para producción
- `npm run preview` - Previsualiza el build de producción
- `npm run start:server` - Inicia backend en modo normal

## 🔑 Variables de Entorno

Copia `.env.example` a `.env.local` para configurar variables locales:

```bash
cp .env.example .env.local
```

## 🔧 Tecnologías

- **Vue 3** - Framework de UI
- **Vite** - Build tool y dev server
- **Pinia** - Gestión de estado
- **Express** - API backend
- **SQLite** - Base de datos local
- **CSS3** - Estilos (sistema de variables CSS)

## 📦 Dependencias

- `vue@^3.4.0`
- `pinia@^2.1.7`

## 📄 Licencia

MIT
