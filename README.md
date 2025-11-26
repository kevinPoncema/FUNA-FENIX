# FUNA FENIX - Aplicación de Retroalimentación de Equipo 🔥

Esta es una aplicación web desarrollada para facilitar la retroalimentación del equipo FENIX de forma dinámica e interactiva. Permite a los miembros del equipo compartir feedback constructivo, reconocer logros y identificar áreas de crecimiento de manera colaborativa.

## 🎯 Propósito

La aplicación fue desarrollada específicamente para realizar actividades de retroalimentación del equipo FENIX de manera más eficiente y engajante, reemplazando métodos tradicionales con una plataforma digital interactiva que fomenta la participación activa de todos los miembros.

## ✨ Características

- **Retroalimentación en Tiempo Real**: Los comentarios y feedbacks se actualizan instantáneamente para todos los usuarios conectados
- **Sistema de Categorías**: Organización del feedback en logros, cualidades y potencial de crecimiento
- **Autenticación Segura**: Sistema de login con Laravel Sanctum para proteger la información del equipo
- **Interfaz Intuitiva**: Diseño moderno y fácil de usar tipo post-it notes
- **Gestión de Miembros**: Administración completa de los miembros del equipo

## 🏗️ Arquitectura del Sistema

### Frontend
- **React + Vite**: Interfaz de usuario moderna y reactiva
- **Laravel Echo**: Comunicación en tiempo real con WebSockets
- **Tailwind CSS**: Estilizado moderno y responsivo

### Backend
- **Laravel 11**: API REST robusta y segura
- **MySQL**: Base de datos relacional para persistencia
- **Laravel Sanctum**: Autenticación basada en tokens
- **Soketi**: Servidor WebSocket para eventos en tiempo real
- **Queue Worker**: Procesamiento asíncrono de eventos

### Infraestructura
- **Docker Compose**: Orquestación de servicios automatizada
- **Script de Inicio Automatizado**: Configuración y arranque de todos los servicios

## 🚀 Instalación y Uso

### Prerrequisitos
- Docker y Docker Compose instalados
- Git para clonar el repositorio

### Pasos para Ejecutar

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/kevinPoncema/FUNA-FENIX.git
   cd FUNA-FENIX
   ```

2. **Levantar los servicios**
   ```bash
   docker compose up --build
   ```

3. **Acceder a la aplicación**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

### Credenciales por Defecto
- **Email**: admin@admin.com
- **Password**: admin

## 🔧 Servicios Activos

| Servicio | Puerto | URL |
|----------|--------|-----|
| Frontend React | 5173 | http://localhost:5173 |
| Backend Laravel | 8000 | http://localhost:8000 |
| MySQL Database | 3306 | localhost:3306 |
| Soketi WebSocket | 6001 | localhost:6001 |

## 📋 Funcionalidades Principales

- ✅ **Autenticación de usuarios**
- ✅ **Creación y gestión de feedback**
- ✅ **Actualizaciones en tiempo real**
- ✅ **Gestión de miembros del equipo**
- ✅ **Categorización de comentarios**
- ✅ **Interfaz responsiva**
- ✅ **API REST completa**

## 🛠️ Tecnologías Utilizadas

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- Laravel Echo
- Pusher.js

**Backend:**
- Laravel 11
- PHP 8.2
- MySQL 8
- Laravel Sanctum
- Laravel Broadcasting

**DevOps:**
- Docker
- Docker Compose
- Soketi WebSocket Server

## 🤝 Desarrollado Para

Esta aplicación fue desarrollada específicamente para mejorar las dinámicas de retroalimentación del equipo FENIX, facilitando un ambiente de comunicación abierta y constructiva que promueve el crecimiento profesional y personal de todos los miembros del equipo.

## 📁 Estructura del Proyecto

### Backend (Laravel)
```
backend/
├── src/                           # Código fuente principal
│   ├── app/
│   │   ├── Events/               # Eventos para broadcasting
│   │   │   ├── FeedbackCreated.php
│   │   │   ├── FeedbackUpdated.php
│   │   │   ├── FeedbackDeleted.php
│   │   │   ├── TeamMemberCreated.php
│   │   │   ├── TeamMemberUpdated.php
│   │   │   └── TeamMemberDeleted.php
│   │   ├── Http/
│   │   │   ├── Controllers/      # Controladores de API
│   │   │   ├── Middleware/       # Middleware personalizado
│   │   │   └── Requests/         # Validaciones de requests
│   │   ├── Models/               # Modelos Eloquent
│   │   │   ├── User.php
│   │   │   ├── Feedback.php
│   │   │   └── TeamMember.php
│   │   ├── Repositories/         # Patrón Repository
│   │   │   ├── FeedbackRepository.php
│   │   │   └── UserRepository.php
│   │   └── Providers/            # Service Providers
│   ├── config/
│   │   ├── broadcasting.php      # Configuración de WebSockets
│   │   ├── database.php          # Configuración de BD
│   │   └── sanctum.php           # Configuración de autenticación
│   ├── database/
│   │   ├── migrations/           # Migraciones de BD
│   │   ├── seeders/              # Datos de prueba
│   │   └── factories/            # Factories para testing
│   ├── routes/
│   │   ├── api.php               # Rutas de API
│   │   ├── channels.php          # Canales de broadcasting
│   │   └── web.php               # Rutas web
│   └── storage/                  # Logs y cache
├── dockerfile                    # Configuración Docker
└── start.sh                     # Script de inicio automatizado
```

### Frontend (React)
```
frontend/
├── src/
│   ├── api/                      # Servicios de API
│   │   ├── apiService.js         # Cliente HTTP principal
│   │   ├── constants.js          # Constantes de API
│   │   ├── echo.js               # Configuración Laravel Echo
│   │   └── useAPI.js             # Hook personalizado
│   ├── components/               # Componentes React
│   │   ├── AuthenticationModal.jsx
│   │   ├── FeedbackFormModal.jsx
│   │   ├── Header.jsx
│   │   ├── MainBoard.jsx
│   │   ├── MemberManagementModal.jsx
│   │   ├── PostItNote.jsx
│   │   └── index.js
│   ├── assets/                   # Recursos estáticos
│   ├── App.jsx                   # Componente principal
│   └── main.jsx                  # Punto de entrada
├── public/                       # Archivos públicos
├── package.json                  # Dependencias Node.js
├── vite.config.js               # Configuración Vite
└── dockerfile                   # Configuración Docker
```

## ⚙️ Configuración de Servicios

### 🐘 Base de Datos MySQL
**Configuración Automática:**
- Puerto: `3306`
- Base de datos: `fenix_feedback`
- Usuario: `fenix_user`
- Password: `fenix_password`

**Migraciones incluidas:**
- Tabla `users` con roles y autenticación
- Tabla `feedbacks` con categorización
- Tabla `personal_access_tokens` para Sanctum

### 🔐 Laravel Sanctum (Autenticación)
**Configuración:**
```php
// config/sanctum.php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1')),
'guard' => ['web'],
'expiration' => null, // Tokens sin expiración
```

**Middleware aplicado:**
- `auth:sanctum` en todas las rutas API
- CORS configurado para frontend

### 🔄 Sistema de Colas (Queue Worker)
**Configuración:**
- Driver: `database`
- Procesamiento automático en `start.sh`
- Manejo de eventos de broadcasting

**Trabajos procesados:**
- Broadcasting de eventos en tiempo real
- Notificaciones de cambios en la aplicación

### 📡 WebSocket (Soketi) - Configuración Completa

#### Instalación y Configuración
**1. Dependencias Backend:**
```bash
composer require pusher/pusher-php-server
```

**2. Configuración Laravel (.env):**
```env
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=local-app
PUSHER_APP_KEY=local-key
PUSHER_APP_SECRET=local-secret
PUSHER_HOST=127.0.0.1
PUSHER_PORT=6001
PUSHER_SCHEME=http
```

**3. Configuración Broadcasting (config/broadcasting.php):**
```php
'pusher' => [
    'driver' => 'pusher',
    'key' => env('PUSHER_APP_KEY'),
    'secret' => env('PUSHER_APP_SECRET'),
    'app_id' => env('PUSHER_APP_ID'),
    'options' => [
        'host' => env('PUSHER_HOST', '127.0.0.1'),
        'port' => env('PUSHER_PORT', 6001),
        'scheme' => env('PUSHER_SCHEME', 'http'),
        'encrypted' => false,
        'useTLS' => false,
    ],
],
```

**4. Configuración Frontend (echo.js):**
```javascript
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'pusher',
    key: 'local-key',
    wsHost: 'localhost',
    wsPort: 6001,
    wssPort: 6001,
    forceTLS: false,
    encrypted: false,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
});
```

#### Eventos Implementados
**Estructura de Eventos:**
```php
// Ejemplo: FeedbackCreated.php
class FeedbackCreated implements ShouldBroadcast
{
    public function __construct(public Feedback $feedback) {}
    
    public function broadcastOn(): array
    {
        return [new Channel('feedback-updates')];
    }
    
    public function broadcastAs(): string
    {
        return 'feedback.created';
    }
}
```

**Canales Configurados:**
- `feedback-updates`: Para cambios en feedbacks
- `team-updates`: Para cambios en miembros del equipo

### 🚀 Script de Inicio Automatizado

**Archivo: `backend/start.sh`**
```bash
#!/bin/bash
set -e

echo "🔥 Iniciando servicios FUNA FENIX..."

# Verificar dependencias
if ! command -v composer &> /dev/null; then
    echo "❌ Composer no encontrado"
    exit 1
fi

# Instalar dependencias
composer install --no-dev --optimize-autoloader

# Configurar aplicación
cp .env.example .env 2>/dev/null || echo "📁 .env ya existe"
php artisan key:generate --force
php artisan config:cache
php artisan route:cache

# Ejecutar migraciones
php artisan migrate --force

# Poblar base de datos
php artisan db:seed --force

# Iniciar servicios en segundo plano
echo "🚀 Iniciando Queue Worker..."
php artisan queue:work --daemon &
QUEUE_PID=$!

echo "📡 Iniciando Soketi WebSocket Server..."
npx soketi start \
    --config=/var/www/html/soketi-config.json \
    --port=6001 \
    --metrics-server-port=9601 &
SOKETI_PID=$!

echo "🌐 Iniciando Laravel Server..."
php artisan serve --host=0.0.0.0 --port=8000 &
LARAVEL_PID=$!

# Función de limpieza
cleanup() {
    echo "🛑 Deteniendo servicios..."
    kill $QUEUE_PID $SOKETI_PID $LARAVEL_PID 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

echo "✅ Todos los servicios iniciados correctamente"
wait
```

### 📋 Checklist para WebSocket

**Para que funcionen las actualizaciones en tiempo real:**

1. **✅ Soketi ejecutándose en puerto 6001**
2. **✅ Queue Worker procesando eventos**
3. **✅ Broadcasting configurado en Laravel**
4. **✅ Echo configurado en Frontend**
5. **✅ Eventos implementados con ShouldBroadcast**
6. **✅ Canales definidos en channels.php**

**Verificación de funcionamiento:**
```bash
# Verificar Soketi
curl http://localhost:6001/

# Verificar Queue Worker
docker compose logs backend | grep "queue"

# Verificar conexión Echo desde browser console
echo.connector.pusher.connection.state
```

## 🔧 Solución de Problemas

### WebSocket no funciona
1. Verificar que Soketi esté corriendo en puerto 6001
2. Confirmar configuración de broadcasting en Laravel
3. Revisar que Queue Worker esté procesando eventos
4. Verificar configuración de Echo en frontend

### API devuelve 401
1. Verificar token de autenticación válido
2. Confirmar middleware `auth:sanctum` en rutas
3. Revisar configuración CORS

### Docker no inicia
1. Verificar puertos no estén ocupados
2. Confirmar permisos del archivo `start.sh`
3. Revisar logs: `docker compose logs backend`

## 📚 Documentación Adicional

Para información detallada sobre los cambios y desarrollo, consulta la carpeta `docs/`:
- `DEVELOPMENT_LOG.md`: Registro completo de cambios realizados
- `API_DOCUMENTATION.md`: Documentación de endpoints
- `WEBSOCKET_SETUP.md`: Guía detallada de configuración WebSocket
