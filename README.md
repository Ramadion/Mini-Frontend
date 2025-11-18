# 🚀 Mini Kanban - Gestor de Tareas Colaborativo

[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Sistema de gestión de tareas tipo Kanban con equipos colaborativos, comentarios, etiquetas y seguimiento de historial de estados.

![Dashboard Preview](https://via.placeholder.com/800x400?text=Mini+Kanban+Dashboard)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [Componentes Principales](#-componentes-principales)
- [Resolución de Problemas](#-resolución-de-problemas)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

---

## ✨ Características

### 🎯 Gestión de Tareas
- **Tablero Kanban** con 4 estados: Pendiente, En Curso, Finalizada, Cancelada
- **Prioridades** visuales: Alta, Media, Baja
- **Fechas límite** con alertas automáticas para tareas vencidas o próximas a vencer
- **Drag & Drop** para cambiar estados (próximamente)
- **Filtrado** por equipo y etiquetas
- **Ordenamiento** por prioridad o fecha de creación

### 👥 Trabajo en Equipo
- **Equipos colaborativos** con roles (Propietario/Miembro)
- **Gestión de miembros**: agregar, eliminar y cambiar roles
- **Permisos por rol**: solo propietarios pueden gestionar el equipo
- **Vista de tareas por equipo**

### 🏷️ Sistema de Etiquetas
- **Etiquetas personalizables** con colores
- **Creación rápida** de etiquetas desde cualquier lugar
- **Filtrado por etiquetas** en el tablero Kanban
- **Múltiples etiquetas** por tarea

### 💬 Comentarios y Colaboración
- **Sistema de comentarios** en cada tarea
- **Historial de estados** con registro de cambios
- **Notificaciones visuales** de actualizaciones
- **Eliminación de comentarios** (solo autor)

### 🔐 Autenticación y Seguridad
- **Login seguro** con JWT
- **Rutas protegidas** con sistema de guards
- **Sesión persistente** con localStorage
- **Logout automático** en caso de token expirado

---

## 🛠️ Tecnologías

### Frontend
- **React 19.2.0** - Biblioteca de UI
- **TypeScript 4.9.5** - Tipado estático
- **React Router DOM 7.9.5** - Navegación
- **Axios 1.13.2** - Cliente HTTP
- **Context API** - Manejo de estado global

### Herramientas de Desarrollo
- **React Scripts 5.0.1** - Configuración de build
- **Testing Library** - Pruebas unitarias
- **ESLint** - Linter de código

### Backend (Requerido)
- **NestJS** - Framework de Node.js
- **PostgreSQL** - Base de datos
- **TypeORM** - ORM
- **JWT** - Autenticación

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 14.x (recomendado 18.x o superior)
- **npm** >= 6.x o **yarn** >= 1.22.x
- **Backend de Mini Kanban** corriendo en `http://localhost:3000`

### Verificar instalación:
```bash
node --version
npm --version
```

---

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/mini-frontend-con-rama.git
cd mini-frontend-con-rama
```

### 2. Instalar dependencias
```bash
npm install
```

**Si encuentras errores, prueba con:**
```bash
# Limpiar caché
npm cache clean --force

# Reinstalar
rm -rf node_modules package-lock.json
npm install
```

### 3. Verificar instalación
```bash
# Debe existir la carpeta node_modules
ls node_modules

# Verificar react-scripts
npm list react-scripts
```

---

## ⚙️ Configuración

### Configurar URL del Backend

Edita el archivo `src/services/api.ts`:

```typescript
// Cambiar según tu configuración
const API_BASE_URL = 'http://localhost:3000'; // URL del backend

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});
```

### Variables de Entorno (Opcional)

Crea un archivo `.env` en la raíz del proyecto:

```env
REACT_APP_API_URL=http://localhost:3000
REACT_APP_TIMEOUT=10000
```

Y actualiza `api.ts`:

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
```

---

## 🎮 Uso

### Iniciar el servidor de desarrollo

```bash
npm start
```

La aplicación se abrirá automáticamente en [http://localhost:3001](http://localhost:3001)

### Otros comandos disponibles

```bash
# Ejecutar tests
npm test

# Crear build de producción
npm run build

# Analizar el bundle
npm run build
npx source-map-explorer 'build/static/js/*.js'
```

---

## 📱 Uso de la Aplicación

### 1. Inicio de Sesión

**Usuario de prueba por defecto:**
```
Email: admin@example.com
Password: admin123
```

### 2. Crear un Equipo
1. Ve a la pestaña **"Equipos"**
2. Haz clic en **"Crear Equipo"**
3. Ingresa el nombre del equipo
4. Haz clic en **"Crear"**

### 3. Agregar Miembros al Equipo
1. En la tarjeta del equipo, haz clic en **"Agregar Usuario"**
2. Selecciona el usuario de la lista
3. Elige el rol (Propietario/Miembro)
4. Haz clic en **"Agregar Usuario"**

### 4. Crear una Tarea
1. Ve a la pestaña **"Crear Tarea"**
2. Completa el formulario:
   - Título (obligatorio)
   - Descripción
   - Prioridad (Alta/Media/Baja)
   - Fecha límite
   - Equipo (obligatorio)
   - Etiquetas (opcional)
3. Haz clic en **"Crear Tarea"**

### 5. Gestionar Tareas en el Kanban
1. Ve a la pestaña **"Tablero Kanban"**
2. Filtra por equipo o etiqueta
3. Cambia el estado de una tarea con el selector
4. Haz clic en **"Ver Detalles"** para:
   - Editar información
   - Agregar comentarios
   - Ver historial de cambios

### 6. Gestionar Etiquetas
1. En el tablero Kanban, haz clic en **"Gestionar Etiquetas"** en cualquier tarea
2. Selecciona etiquetas existentes o crea nuevas
3. Personaliza el color de las etiquetas
4. Guarda los cambios

---

## 📁 Estructura del Proyecto

```
mini-frontend/
├── public/                      # Archivos estáticos
│   ├── index.html              # HTML principal
│   ├── favicon.ico             # Ícono de la app
│   └── manifest.json           # Configuración PWA
│
├── src/
│   ├── components/             # Componentes reutilizables
│   │   ├── AsignarEtiquetasModal.tsx    # Modal para gestionar etiquetas
│   │   ├── KanbanBoard.tsx              # Tablero Kanban principal
│   │   ├── ProtectedRoute.tsx           # Guard de rutas protegidas
│   │   ├── TaskDetailsModal.tsx         # Modal con detalles de tarea
│   │   ├── TaskForm.tsx                 # Formulario para crear tareas
│   │   └── TeamManagement.tsx           # Gestión de equipos
│   │
│   ├── contexts/               # Context API para estado global
│   │   └── AuthContext.tsx     # Contexto de autenticación
│   │
│   ├── pages/                  # Páginas principales
│   │   ├── Dashboard.tsx       # Dashboard principal
│   │   └── Login.tsx           # Página de login
│   │
│   ├── services/               # Servicios de API
│   │   ├── api.ts              # Configuración de Axios
│   │   ├── authService.ts      # Autenticación
│   │   ├── commentService.ts   # Comentarios
│   │   ├── etiquetaService.ts  # Etiquetas
│   │   ├── historialEstadoService.ts  # Historial
│   │   ├── membershipService.ts        # Membresías
│   │   ├── taskService.ts              # Tareas
│   │   ├── teamService.ts              # Equipos
│   │   ├── testService.ts              # Pruebas de conexión
│   │   └── userService.ts              # Usuarios
│   │
│   ├── types/                  # Definiciones de TypeScript
│   │   └── index.ts            # Interfaces y tipos
│   │
│   ├── utils/                  # Utilidades
│   │   └── dateUtils.ts        # Funciones de fechas
│   │
│   ├── App.tsx                 # Componente raíz
│   ├── App.css                 # Estilos globales
│   ├── index.tsx               # Punto de entrada
│   └── index.css               # Estilos base
│
├── .gitignore                  # Archivos ignorados por Git
├── package.json                # Dependencias y scripts
├── tsconfig.json               # Configuración de TypeScript
└── README.md                   # Este archivo
```

---

## 🔌 API Endpoints

### Autenticación
```typescript
POST   /auth/login              # Iniciar sesión
GET    /auth/profile            # Obtener perfil del usuario
```

### Tareas
```typescript
GET    /tasks/:userId           # Listar tareas del usuario
POST   /tasks                   # Crear tarea
PUT    /tasks/:id               # Actualizar tarea
DELETE /tasks/:id               # Eliminar tarea
PUT    /tareas/:id/estado       # Cambiar estado de tarea
GET    /tareas/:id/historial    # Obtener historial de estados
```

### Equipos
```typescript
GET    /teams                   # Listar todos los equipos
GET    /teams?userid=:id        # Listar equipos del usuario
GET    /teams/:id               # Obtener equipo por ID
POST   /teams                   # Crear equipo
PUT    /teams/:id               # Actualizar equipo
DELETE /teams/:id               # Eliminar equipo
```

### Miembros de Equipo
```typescript
GET    /teams/:id/miembros      # Listar miembros del equipo
POST   /teams/:id/miembros      # Agregar miembro al equipo
DELETE /teams/:id/miembros/:userId  # Eliminar miembro del equipo
PUT    /teams/:id/miembros/:userId  # Cambiar rol del miembro
```

### Comentarios
```typescript
GET    /tareas/:id/comentarios  # Listar comentarios de tarea
POST   /tareas/:id/comentarios  # Crear comentario
PUT    /comentarios/:id         # Actualizar comentario
DELETE /comentarios/:id         # Eliminar comentario
```

### Etiquetas
```typescript
GET    /etiquetas               # Listar todas las etiquetas
GET    /etiquetas/:id           # Obtener etiqueta por ID
POST   /etiquetas               # Crear etiqueta
PUT    /etiquetas/:id           # Actualizar etiqueta
DELETE /etiquetas/:id           # Eliminar etiqueta
PUT    /tareas/:id/etiquetas    # Asignar etiquetas a tarea
GET    /tareas/:id/etiquetas    # Obtener etiquetas de tarea
```

### Usuarios
```typescript
GET    /users                   # Listar todos los usuarios
GET    /users/:id               # Obtener usuario por ID
```

---

## 🧩 Componentes Principales

### KanbanBoard
Tablero principal tipo Kanban con 4 columnas de estado.

**Props:** Ninguna (usa Context API)

**Características:**
- Filtrado por equipo y etiqueta
- Ordenamiento por prioridad o fecha
- Cambio de estado drag & drop
- Alertas de fechas límite

### TaskDetailsModal
Modal con información completa de la tarea.

**Props:**
```typescript
interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onTaskUpdated: (updatedTask: Task) => void;
}
```

**Características:**
- Edición de tarea
- Sistema de comentarios
- Historial de cambios de estado
- 3 pestañas: Info, Comentarios, Historial

### AsignarEtiquetasModal
Modal para gestionar etiquetas de una tarea.

**Props:**
```typescript
interface AsignarEtiquetasModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onEtiquetasUpdated: (updatedTask: Task) => void;
}
```

**Características:**
- Selección múltiple de etiquetas
- Creación de nuevas etiquetas
- Personalización de colores
- Vista previa en tiempo real

### TeamManagement
Componente para gestionar equipos y miembros.

**Props:** Ninguna

**Características:**
- Crear equipos
- Agregar/eliminar miembros
- Cambiar roles
- Salir de equipos
- Vista de propietario/miembro

### TaskForm
Formulario para crear nuevas tareas.

**Props:** Ninguna

**Características:**
- Validación de campos
- Selección de equipo
- Asignación de etiquetas
- Selector de fecha límite
- Niveles de prioridad

---

## 🐛 Resolución de Problemas

### Error: "react-scripts no se reconoce como comando"

**Solución:**
```bash
# Eliminar node_modules y reinstalar
Remove-Item -Recurse -Force node_modules  # PowerShell
# O
rmdir /s /q node_m

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).