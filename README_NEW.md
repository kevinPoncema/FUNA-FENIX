# FUNA FENIX - Aplicación de Retroalimentación de Equipo 🔥

[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docs.docker.com/)
[![Laravel](https://img.shields.io/badge/Laravel-11-red.svg)](https://laravel.com/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![WebSocket](https://img.shields.io/badge/WebSocket-Soketi-green.svg)](https://soketi.app/)

Una aplicación web moderna y escalable desarrollada para facilitar la retroalimentación del equipo FENIX de forma dinámica e interactiva. Permite a los miembros del equipo compartir feedback constructivo, reconocer logros e identificar áreas de crecimiento mediante una plataforma digital colaborativa en tiempo real.

## 📋 Tabla de Contenidos

- [Propósito y Características](#-propósito-y-características)
- [Arquitectura del Sistema](#️-arquitectura-del-sistema)
- [Instalación Rápida](#-instalación-rápida)
- [Configuración Detallada](#️-configuración-detallada)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API y WebSocket](#-api-y-websocket)
- [Documentación Completa](#-documentación-completa)
- [Comandos de Desarrollo](#-comandos-de-desarrollo)
- [Verificación y Salud](#-verificación-y-salud)
- [Solución de Problemas](#️-solución-de-problemas)
- [Contribución](#-contribución)

## 🎯 Propósito y Características

### Propósito
Desarrollada específicamente para realizar actividades de retroalimentación del equipo FENIX de manera más eficiente y engajante, reemplazando métodos tradicionales con una plataforma digital interactiva que fomenta la participación activa de todos los miembros.

### ✨ Características Principales

- **🔄 Retroalimentación en Tiempo Real**: Actualizaciones instantáneas vía WebSockets
- **📊 Sistema de Categorías**: Logros, cualidades y potencial de crecimiento
- **🔐 Autenticación Segura**: Laravel Sanctum con control de roles
- **🎨 Interfaz Intuitiva**: Diseño moderno tipo post-it notes con Tailwind CSS
- **👥 Gestión de Miembros**: Administración completa del equipo
- **📱 Diseño Responsivo**: Optimizado para todos los dispositivos
- **⚡ Alta Performance**: Optimizaciones de frontend y backend
- **🔍 API REST Completa**: Endpoints documentados y versionados
- **🏗️ Arquitectura Modular**: Separación clara de responsabilidades
- **🐳 Despliegue con Docker**: Configuración lista para producción

## 🏗️ Arquitectura del Sistema

### Tecnologías Core

**🌐 Frontend**
- **React 18** + **Vite**: SPA moderna con hot reload
- **Laravel Echo**: Cliente WebSocket para tiempo real
- **Tailwind CSS**: Framework CSS utility-first
- **Axios**: Cliente HTTP con interceptores

**⚙️ Backend** 
- **Laravel 11**: Framework PHP robusto
- **MySQL 8**: Base de datos relacional
- **Laravel Sanctum**: Autenticación stateless
- **Soketi**: Servidor WebSocket compatible con Pusher
- **Queue Worker**: Procesamiento asíncrono

**🚀 Infraestructura**
- **Docker Compose**: Orquestación multi-contenedor
- **Alpine Linux**: Imágenes optimizadas
- **Scripts Automatizados**: Inicialización y salud

### Flujo de Datos
```
Usuario → Frontend (React) → API (Laravel) → Database (MySQL)
                ↓              ↓
             WebSocket ← Soketi ← Queue Worker
```

## 🚀 Instalación Rápida

### Prerrequisitos
- **Docker Engine** 20.10+ y **Docker Compose** 2.0+
- **Git** para clonar el repositorio  
- **4GB RAM** mínimo y puertos 3306, 5173, 6001, 8000 disponibles

### Instalación en 2 Pasos

1. **Clonar y configurar**
   ```bash
   git clone https://github.com/kevinPoncema/FUNA-FENIX.git
   cd FUNA-FENIX
   ```

2. **Levantar servicios**
   ```bash
   docker compose up --build
   ```

### Acceso Inmediato
- 🌐 **Frontend**: http://localhost:5173
- 🔧 **API Backend**: http://localhost:8000
- 📡 **WebSocket**: http://localhost:6001  
- 🗃️ **MySQL**: localhost:3306

### Credenciales por Defecto
- **Email**: admin@admin.com
- **Password**: admin
- **Rol**: Administrador (puede gestionar miembros y ver/eliminar todos los feedbacks)

> ⏱️ **Tiempo de inicio**: ~2-3 minutos en primera ejecución (descarga imágenes + build)

## ⚙️ Configuración Detallada

### Variables de Entorno

#### Archivo .env Principal (Raíz)
```bash
# Base de datos  
DB_ROOT_PASSWORD=secure_root_password
DB_DATABASE=fenix_feedback
DB_USERNAME=fenix_user
DB_PASSWORD=secure_password

# WebSocket/Broadcasting
PUSHER_APP_ID=local-app
PUSHER_APP_KEY=local-key  
PUSHER_APP_SECRET=local-secret

# URLs de servicios
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
```

#### Backend .env (./backend/src/.env)
```bash
# Aplicación Laravel
APP_NAME=FunaFenix
APP_ENV=production
APP_DEBUG=false
APP_URL=http://localhost:8000

# Base de datos
DB_CONNECTION=mysql
DB_HOST=database
DB_PORT=3306
DB_DATABASE=fenix_feedback
DB_USERNAME=fenix_user
DB_PASSWORD=fenix_password

# Broadcasting con Soketi
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=local-app
PUSHER_APP_KEY=local-key
PUSHER_APP_SECRET=local-secret
PUSHER_HOST=127.0.0.1
PUSHER_PORT=6001
PUSHER_SCHEME=http

# Laravel Sanctum
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:5173,127.0.0.1,::1

# Cola de trabajos
QUEUE_CONNECTION=database
QUEUE_WORKER=true
```

### Arquitectura de Servicios

| Servicio | Puerto | Función | Estado |
|----------|--------|---------|--------|
| **frontend** | 5173 | React SPA con Vite | ✅ Activo |
| **backend** | 8000 | Laravel API + WebSocket | ✅ Activo |
| **database** | 3306 | MySQL 8.0 | ✅ Activo |
| **soketi** | 6001 | Servidor WebSocket | ✅ Activo |

### Configuración WebSocket (Soketi)

**Archivo: soketi-config.json**
```json
{
  "debug": true,
  "port": 6001,
  "appManager": {
    "driver": "array",
    "array": {
      "apps": [
        {
          "id": "local-app",
          "key": "local-key", 
          "secret": "local-secret",
          "maxConnections": 100,
          "enableClientMessages": true
        }
      ]
    }
  },
  "cors": {
    "credentials": true,
    "origin": ["http://localhost:5173"],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  }
}
```

## 📋 Funcionalidades Principales

### ✅ Funcionalidades Implementadas

**🔐 Autenticación y Autorización**
- Login seguro con Laravel Sanctum
- Control de roles: admin, owner, member
- Logout desde cualquier dispositivo
- Persistencia de sesión

**💬 Gestión de Feedback**
- Creación de feedback por categorías (Logros, Cualidades, Crecimiento)
- Visualización en tiempo real vía WebSocket
- Eliminación solo por owner/admin
- Interfaz tipo post-it interactiva

**👥 Gestión de Miembros**
- CRUD completo de miembros del equipo
- Asignación de roles y permisos
- Vista de feedback por miembro

**⚡ Tiempo Real**
- Actualizaciones instantáneas sin refresh
- Notificaciones de cambios
- Estado de conexión visible

**🎨 Interfaz de Usuario**
- Diseño responsivo con Tailwind CSS
- Animaciones suaves y transiciones
- Modo claro/oscuro
- Experiencia móvil optimizada

### 🛠️ Tecnologías Utilizadas

**🌟 Frontend Stack**
- **React 18**: Hooks, Context API, Componentes funcionales
- **Vite**: Build tool ultra rápido con HMR
- **Tailwind CSS**: Framework CSS utility-first
- **Laravel Echo**: Cliente WebSocket tiempo real
- **Axios**: Cliente HTTP con interceptores

**⚙️ Backend Stack** 
- **Laravel 11**: Framework PHP moderno
- **PHP 8.2**: Últimas características del lenguaje
- **MySQL 8**: Base de datos relacional optimizada
- **Laravel Sanctum**: Autenticación SPA
- **Soketi**: WebSocket server compatible Pusher
- **Eloquent ORM**: Mapeo objeto-relacional

**🐳 DevOps & Infraestructura**
- **Docker Compose**: Orquestación multi-contenedor
- **Alpine Linux**: Imágenes optimizadas y ligeras
- **Scripts de automatización**: start.sh para inicialización
- **Health checks**: Monitoreo de servicios

## 📁 Estructura del Proyecto

```
FUNA-FENIX/
├── 📄 docker-compose.yml           # Orquestación de servicios
├── 📄 soketi-config.json          # Configuración WebSocket
├── 📄 README.md                    # Esta documentación
├── 📁 docs/                        # Documentación completa
│   ├── 📄 CONF_GENERAL.md         # Docker y despliegue
│   ├── 📄 WEBSOCKET_SETUP.md      # Configuración WebSocket
│   ├── 📁 backend/                 # Documentación backend
│   │   ├── 📄 API_DOCUMENTATION.md      # Endpoints y ejemplos
│   │   ├── 📄 ARCHITECTURE.md           # Arquitectura Laravel
│   │   └── 📄 CONFIGURATION.md          # Variables y configuración
│   └── 📁 frontend/                # Documentación frontend  
│       ├── 📄 STRUCTURE_CONFIGURATION.md # Estructura y configuración
│       ├── 📄 COMPONENTS_STATE.md       # Componentes y estado
│       └── 📄 API_WEBSOCKET.md           # API y WebSocket cliente
├── 📁 backend/                      # Aplicación Laravel
│   ├── 📄 dockerfile              # Imagen PHP/Laravel
│   ├── 📄 start.sh                # Script de inicio automatizado
│   └── 📁 src/                     # Código fuente Laravel
│       ├── 📁 app/
│       │   ├── 📁 Events/         # Eventos WebSocket
│       │   │   ├── FeedbackCreated.php
│       │   │   ├── FeedbackUpdated.php
│       │   │   └── FeedbackDeleted.php
│       │   ├── 📁 Http/
│       │   │   ├── 📁 Controllers/    # Controladores API
│       │   │   ├── 📁 Middleware/     # Middleware personalizado
│       │   │   └── 📁 Services/       # Servicios de negocio
│       │   ├── 📁 Models/         # Modelos Eloquent
│       │   │   ├── User.php
│       │   │   ├── Feedback.php
│       │   │   └── TeamMember.php
│       │   └── 📁 Repositories/   # Patrón Repository
│       ├── 📁 config/             # Configuración Laravel
│       │   ├── broadcasting.php   # WebSocket config
│       │   ├── database.php       # DB config
│       │   └── sanctum.php        # Auth config
│       ├── 📁 database/
│       │   ├── 📁 migrations/     # Esquemas de BD
│       │   ├── 📁 seeders/        # Datos de prueba
│       │   └── 📁 factories/      # Generadores de datos
│       └── 📁 routes/
│           ├── api.php            # Rutas API REST
│           ├── channels.php       # Canales WebSocket
│           └── web.php            # Rutas web
└── 📁 frontend/                    # Aplicación React
    ├── 📄 dockerfile              # Imagen Node.js/React
    ├── 📄 package.json            # Dependencias y scripts
    ├── 📄 vite.config.js          # Configuración Vite
    └── 📁 src/                     # Código fuente React
        ├── 📁 api/                # Servicios API
        │   ├── apiService.js      # Cliente HTTP principal
        │   ├── constants.js       # Constantes y URLs
        │   ├── echo.js            # Configuración WebSocket
        │   └── useAPI.js          # Hooks personalizados
        ├── 📁 components/         # Componentes React
        │   ├── AuthenticationModal.jsx
        │   ├── FeedbackFormModal.jsx
        │   ├── Header.jsx
        │   ├── MainBoard.jsx      # Tablero principal
        │   ├── PostItNote.jsx     # Notas de feedback
        │   └── index.js           # Exportaciones
        ├── App.jsx                # Componente raíz
        └── main.jsx               # Punto de entrada
```

## 🔌 API y WebSocket

### Endpoints Principales

**🔐 Autenticación**
```bash
POST   /api/auth/login           # Iniciar sesión
POST   /api/auth/logout          # Cerrar sesión
GET    /api/auth/user            # Usuario actual
```

**💬 Feedbacks**
```bash
GET    /api/feedbacks            # Listar todos los feedbacks
POST   /api/feedbacks            # Crear nuevo feedback
PUT    /api/feedbacks/{id}       # Actualizar feedback  
DELETE /api/feedbacks/{id}       # Eliminar feedback (solo owner/admin)
```

**👥 Miembros**
```bash
GET    /api/team-members         # Listar miembros del equipo
POST   /api/team-members         # Crear nuevo miembro (solo admin)
PUT    /api/team-members/{id}    # Actualizar miembro (solo admin)
DELETE /api/team-members/{id}    # Eliminar miembro (solo admin)
```

### Eventos WebSocket

**Canal**: `feedback-updates`
- `feedback.created` - Nuevo feedback creado
- `feedback.updated` - Feedback actualizado  
- `feedback.deleted` - Feedback eliminado

**Canal**: `team-updates`
- `team-member.created` - Nuevo miembro agregado
- `team-member.updated` - Miembro actualizado
- `team-member.deleted` - Miembro eliminado

### Ejemplo de Uso WebSocket (Frontend)
```javascript
import Echo from 'laravel-echo';

// Escuchar cambios en feedbacks
Echo.channel('feedback-updates')
    .listen('.feedback.created', (e) => {
        console.log('Nuevo feedback:', e.feedback);
        // Actualizar estado local
    })
    .listen('.feedback.deleted', (e) => {
        console.log('Feedback eliminado:', e.feedback);
        // Remover del estado local
    });
```

## 📚 Documentación Completa

La documentación del proyecto está organizada por áreas de especialización:

### 📖 Documentación General
- **[📄 Configuración Docker](./docs/CONF_GENERAL.md)**: Guía completa de Docker, docker-compose.yml, Dockerfiles y despliegue
- **[📄 WebSocket Setup](./docs/WEBSOCKET_SETUP.md)**: Configuración detallada de Soketi y eventos en tiempo real

### ⚙️ Backend (Laravel)
- **[📄 API Documentation](./docs/backend/API_DOCUMENTATION.md)**: Todos los endpoints, ejemplos de requests/responses, validaciones y broadcasting
- **[📄 Configuration](./docs/backend/CONFIGURATION.md)**: Variables de entorno, .env, broadcasting, colas, CORS y troubleshooting  
- **[📄 Architecture](./docs/backend/ARCHITECTURE.md)**: Arquitectura, directorios, patrones, modelos, servicios, eventos y testing

### 🌐 Frontend (React)
- **[📄 Structure & Config](./docs/frontend/STRUCTURE_CONFIGURATION.md)**: Estructura de carpetas, Vite, ESLint, HTML, CSS y optimizaciones
- **[📄 Components & State](./docs/frontend/COMPONENTS_STATE.md)**: Jerarquía de componentes, hooks, estado global y patrones
- **[📄 API & WebSocket](./docs/frontend/API_WEBSOCKET.md)**: apiService, echo.js, constantes, flujo de datos y manejo de errores

### 📋 Documentos Técnicos Adicionales
Cada documento incluye:
- ✅ **Ejemplos de código** funcionales
- ✅ **Diagramas de arquitectura** cuando aplique
- ✅ **Troubleshooting** específico por área
- ✅ **Mejores prácticas** y patrones
- ✅ **Referencias** a documentación oficial

## 🔧 Comandos de Desarrollo

### Docker y Servicios
```bash
# Levantar todo el proyecto
docker compose up --build

# Solo backend + database
docker compose up database backend --build

# Solo frontend (necesita backend externo)
docker compose up frontend --build

# Ver logs en tiempo real
docker compose logs -f backend

# Reiniciar servicio específico
docker compose restart backend

# Limpiar y empezar desde cero
docker compose down -v && docker compose up --build
```

### Backend (Laravel)
```bash
# Ejecutar comandos Artisan
docker compose exec backend php artisan migrate
docker compose exec backend php artisan db:seed
docker compose exec backend php artisan cache:clear

# Ver logs de Laravel
docker compose exec backend tail -f storage/logs/laravel.log

# Acceso directo al contenedor
docker compose exec backend bash
```

### Frontend (React)  
```bash
# Instalar nuevas dependencias
docker compose exec frontend npm install package-name

# Ejecutar tests
docker compose exec frontend npm run test

# Build para producción
docker compose exec frontend npm run build

# Acceso directo al contenedor  
docker compose exec frontend sh
```

### Base de Datos
```bash
# Acceso a MySQL
docker compose exec database mysql -u fenix_user -p fenix_feedback

# Backup de base de datos
docker compose exec database mysqldump -u fenix_user -p fenix_feedback > backup.sql

# Restaurar backup
docker compose exec database mysql -u fenix_user -p fenix_feedback < backup.sql
```

## 🔍 Verificación y Salud

### HealthChecks Rápidos
```bash
# Verificar todos los servicios
curl -s http://localhost:8000/api/health && echo " ✅ Backend OK"
curl -s http://localhost:5173 > /dev/null && echo " ✅ Frontend OK"  
curl -s http://localhost:6001 > /dev/null && echo " ✅ WebSocket OK"

# Estado de contenedores
docker compose ps

# Uso de recursos
docker stats --no-stream
```

### Tests de Conectividad
```bash
# Test API con autenticación
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin"}'

# Test WebSocket
curl http://localhost:6001/usage | jq .

# Test CORS
curl -X OPTIONS http://localhost:8000/api/health \
  -H "Origin: http://localhost:5173"
```

## ⚠️ Solución de Problemas

### Problemas Comunes y Soluciones

#### 🔌 WebSocket no funciona
```bash
# 1. Verificar Soketi corriendo
curl http://localhost:6001/
# Si falla: docker compose restart backend

# 2. Verificar Queue Worker activo  
docker compose exec backend ps aux | grep queue
# Si no aparece: docker compose exec backend php artisan queue:work &

# 3. Verificar configuración broadcasting
docker compose exec backend php artisan config:show broadcasting
# Debe mostrar driver: pusher

# 4. Test desde browser console
echo.connector.pusher.connection.state
// Debe devolver: 'connected'
```

#### 🗃️ Base de datos no conecta
```bash
# 1. Verificar container MySQL
docker compose ps database
# Estado debe ser: running

# 2. Test conexión directa
docker compose exec database mysql -u fenix_user -p
# Password: fenix_password

# 3. Verificar variables backend
docker compose exec backend env | grep DB_

# 4. Reiniciar con health check
docker compose restart database
docker compose logs database
```

#### 🌐 API devuelve 401/403
```bash
# 1. Verificar CORS
curl -X OPTIONS http://localhost:8000/api/health \
  -H "Origin: http://localhost:5173" -v

# 2. Test login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin"}' | jq

# 3. Verificar Sanctum config
docker compose exec backend php artisan config:show sanctum
```

#### 🐳 Docker no inicia
```bash
# 1. Verificar puertos libres
netstat -tuln | grep -E '(3306|5173|6001|8000)'
# Debe estar vacío

# 2. Limpiar Docker cache
docker system prune -af
docker compose down -v

# 3. Verificar permisos
chmod +x ./backend/start.sh

# 4. Revisar logs completos
docker compose up --no-detach
```

#### ⚡ Frontend no carga
```bash
# 1. Verificar puerto Vite
curl http://localhost:5173

# 2. Revisar logs frontend
docker compose logs frontend

# 3. Verificar dependencias
docker compose exec frontend npm ls

# 4. Reconstruir imagen
docker compose build frontend --no-cache
```

### Comandos de Diagnóstico

#### Estado General del Sistema
```bash
#!/bin/bash
echo "=== FUNA FENIX HEALTH CHECK ==="
echo ""

# Contenedores
echo "📦 CONTENEDORES:"
docker compose ps

echo ""
echo "🌐 SERVICIOS:"
curl -s http://localhost:8000/api/health > /dev/null && echo " ✅ Backend API" || echo " ❌ Backend API"
curl -s http://localhost:5173 > /dev/null && echo " ✅ Frontend" || echo " ❌ Frontend"  
curl -s http://localhost:6001 > /dev/null && echo " ✅ WebSocket" || echo " ❌ WebSocket"

echo ""
echo "🔧 PROCESOS BACKEND:"
docker compose exec backend ps aux | grep -E "(queue|soketi|php)" | head -5

echo ""  
echo "📊 RECURSOS:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

echo ""
echo "📝 LOGS RECIENTES:"
docker compose logs --tail=3 backend frontend database
```

### Enlaces de Referencia Rápida

| Problema | Comando de Verificación | Solución Rápida |
|----------|-------------------------|-----------------|
| **WebSocket** | `curl localhost:6001` | `docker compose restart backend` |
| **Base de Datos** | `docker compose exec database mysql --version` | `docker compose up database -d` |
| **API 401** | `curl localhost:8000/api/health` | Verificar CORS en config |
| **Puerto ocupado** | `lsof -ti:8000` | `kill -9 $(lsof -ti:8000)` |
| **Sin logs** | `docker compose logs backend` | `docker compose restart backend` |

## 🤝 Contribución y Desarrollo

### Preparar Entorno de Desarrollo
```bash
# 1. Fork y clonar
git clone https://github.com/tu-usuario/FUNA-FENIX.git
cd FUNA-FENIX

# 2. Levantar en modo desarrollo
docker compose up --build

# 3. Acceso directo a contenedores
docker compose exec backend bash
docker compose exec frontend sh
```

### Estructura de Commits
```
feat: nueva funcionalidad
fix: corrección de bug  
docs: cambios en documentación
style: formateo, sin cambios de código
refactor: cambio de código sin nueva funcionalidad
test: añadir tests
chore: cambios de build, herramientas, etc
```

### Testing
```bash
# Backend tests
docker compose exec backend php artisan test

# Frontend tests  
docker compose exec frontend npm test

# E2E tests
docker compose exec frontend npm run test:e2e
```

## 🎯 Desarrollado Para Equipo FENIX

Esta aplicación fue desarrollada específicamente para mejorar las dinámicas de retroalimentación del equipo FENIX, facilitando un ambiente de comunicación abierta y constructiva que promueve el crecimiento profesional y personal de todos los miembros del equipo.

### Características Específicas del Equipo
- **Categorización personalizada**: Logros, Cualidades y Potencial de Crecimiento
- **Control de roles**: Admin para gestión, miembros para participación
- **Persistencia de datos**: Historial completo de feedback del equipo
- **Escalabilidad**: Preparado para equipos de 5-50 miembros

---

**📧 Soporte**: Para problemas técnicos, crear un issue en GitHub  
**🔧 Mantenimiento**: Revisar documentación en `/docs/` para detalles técnicos  
**🚀 Actualizaciones**: Seguir el changelog en releases de GitHub

---
*Última actualización: Noviembre 2024 | Versión: 1.0*
