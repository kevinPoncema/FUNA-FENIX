# ⚙️ Configuration Guide - FUNA FENIX Backend

## Descripción General

Esta guía detalla todas las configuraciones necesarias para el funcionamiento del backend de FUNA FENIX, incluyendo variables de entorno, broadcasting, y configuraciones específicas de Laravel.

## Variables de Entorno (.env)

### Archivo .env Principal

El backend utiliza un archivo `.env` que debe ser configurado correctamente para que la aplicación funcione. Las variables más importantes son:

```bash
# ========================================
# CONFIGURACIÓN BÁSICA DE LA APLICACIÓN
# ========================================

# Nombre de la aplicación
APP_NAME="FUNA FENIX Backend"

# Entorno (local, staging, production)
APP_ENV=local

# Clave de encriptación de Laravel (generada automáticamente)
APP_KEY=base64:GENERATED_APP_KEY_HERE

# Modo debug (true solo en desarrollo)
APP_DEBUG=true

# URL base de la aplicación
APP_URL=http://localhost:8000

# Configuración de idioma
APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

# ========================================
# CONFIGURACIÓN DE BASE DE DATOS
# ========================================

# Tipo de conexión a BD
DB_CONNECTION=mysql

# Host de la base de datos
DB_HOST=${DB_HOST}

# Puerto de MySQL
DB_PORT=3306

# Nombre de la base de datos
DB_DATABASE=${DB_DATABASE}

# Usuario de la base de datos
DB_USERNAME=${DB_USERNAME}

# Contraseña de la base de datos
DB_PASSWORD=${DB_PASSWORD}

# ========================================
# CONFIGURACIÓN DE BROADCASTING (WEBSOCKETS)
# ========================================

# Driver de broadcasting (pusher para Soketi)
BROADCAST_DRIVER=pusher

# Configuración de Pusher/Soketi
PUSHER_APP_ID=local-app
PUSHER_APP_KEY=local-key
PUSHER_APP_SECRET=local-secret
PUSHER_HOST=127.0.0.1
PUSHER_PORT=6001
PUSHER_SCHEME=http

# ========================================
# CONFIGURACIÓN DE COLAS
# ========================================

# Driver de colas (database para usar la BD)
QUEUE_CONNECTION=database

# ========================================
# CONFIGURACIÓN DE CACHÉ
# ========================================

# Driver de caché
CACHE_STORE=database

# ========================================
# CONFIGURACIÓN DE SESIONES
# ========================================

# Driver de sesiones
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

# ========================================
# CONFIGURACIÓN DE LOGS
# ========================================

# Canal de logs
LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

# ========================================
# CONFIGURACIÓN DE CORREO
# ========================================

# Driver de correo (log para desarrollo)
MAIL_MAILER=log
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

# ========================================
# CONFIGURACIÓN DE REDIS (OPCIONAL)
# ========================================

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

### Variables de Entorno para Docker

Adicionalmente, existe un archivo `.env` en la raíz del proyecto que contiene variables utilizadas por Docker Compose:

```bash
# Variables para Docker Compose
DB_HOST=mysql
DB_DATABASE=laravel
DB_USERNAME=laravel
DB_PASSWORD=secret
```

## Configuración de Broadcasting

### Archivo config/broadcasting.php

La configuración de broadcasting es crucial para el funcionamiento de WebSockets en tiempo real:

```php
<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Default Broadcaster
    |--------------------------------------------------------------------------
    |
    | Driver por defecto para broadcasting. Para Soketi usamos "pusher"
    |
    */
    'default' => env('BROADCAST_DRIVER', 'pusher'),

    /*
    |--------------------------------------------------------------------------
    | Broadcast Connections
    |--------------------------------------------------------------------------
    |
    | Configuraciones para diferentes drivers de broadcasting
    |
    */
    'connections' => [
        'pusher' => [
            'driver' => 'pusher',
            'key' => env('PUSHER_APP_KEY'),
            'secret' => env('PUSHER_APP_SECRET'),
            'app_id' => env('PUSHER_APP_ID'),
            'options' => [
                // Host y puerto para Soketi
                'host' => env('PUSHER_HOST', '127.0.0.1'),
                'port' => env('PUSHER_PORT', 6001),
                'scheme' => env('PUSHER_SCHEME', 'http'),
                
                // Configuración de seguridad
                'encrypted' => false,
                'useTLS' => false,
                
                // Configuración específica para Soketi
                'cluster' => env('PUSHER_APP_CLUSTER'),
                'curl_options' => [
                    CURLOPT_SSL_VERIFYPEER => false,
                ],
            ],
            'client_options' => [
                // Configuración adicional del cliente
            ],
        ],

        'log' => [
            'driver' => 'log',
        ],

        'null' => [
            'driver' => 'null',
        ],
    ],
];
```

### Configuración de Soketi

El archivo `soketi-config.json` en la raíz del proyecto configura el servidor WebSocket:

```json
{
  "debug": true,
  "port": 6001,
  "host": "0.0.0.0",
  "metrics": {
    "enabled": true,
    "port": 9601
  },
  "app_manager": {
    "driver": "array",
    "array": {
      "apps": [
        {
          "id": "local-app",
          "key": "local-key", 
          "secret": "local-secret",
          "max_connections": 100,
          "enable_client_messages": false,
          "enabled": true,
          "max_backend_events_per_minute": 1000,
          "max_client_events_per_minute": 1000,
          "max_read_requests_per_minute": 1000
        }
      ]
    }
  }
}
```

**Parámetros importantes:**
- `id`, `key`, `secret`: Deben coincidir exactamente con las variables PUSHER_* en .env
- `port`: Puerto donde corre Soketi (6001)
- `max_connections`: Límite de conexiones simultáneas
- `enable_client_messages`: Deshabilitado para mayor seguridad
- `metrics.port`: Puerto para métricas de monitoreo (9601)

## Configuración de Sanctum

### Archivo config/sanctum.php

Laravel Sanctum se usa para autenticación API:

```php
<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Stateful Domains
    |--------------------------------------------------------------------------
    |
    | Dominios que pueden hacer requests stateful a la API
    |
    */
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 
        'localhost,localhost:3000,localhost:5173,127.0.0.1,127.0.0.1:8000,::1'
    )),

    /*
    |--------------------------------------------------------------------------
    | Guards
    |--------------------------------------------------------------------------
    |
    | Guards que Sanctum utilizará para autenticar usuarios
    |
    */
    'guard' => ['web'],

    /*
    |--------------------------------------------------------------------------
    | Expiration Minutes
    |--------------------------------------------------------------------------
    |
    | Tiempo de expiración de tokens (null = sin expiración)
    |
    */
    'expiration' => null,

    /*
    |--------------------------------------------------------------------------
    | Middleware
    |--------------------------------------------------------------------------
    |
    | Middleware que Sanctum añadirá automáticamente
    |
    */
    'middleware' => [
        'verify_csrf_token' => App\Http\Middleware\VerifyCsrfToken::class,
        'encrypt_cookies' => App\Http\Middleware\EncryptCookies::class,
    ],
];
```

## Configuración de Base de Datos

### Archivo config/database.php

Configuración de la conexión a MySQL:

```php
<?php

return [
    'default' => env('DB_CONNECTION', 'mysql'),

    'connections' => [
        'mysql' => [
            'driver' => 'mysql',
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', '3306'),
            'database' => env('DB_DATABASE', 'forge'),
            'username' => env('DB_USERNAME', 'forge'),
            'password' => env('DB_PASSWORD', ''),
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'prefix_indexes' => true,
            'strict' => true,
            'engine' => null,
            'options' => extension_loaded('pdo_mysql') ? array_filter([
                PDO::MYSQL_ATTR_SSL_CA => env('MYSQL_ATTR_SSL_CA'),
            ]) : [],
        ],

        // Configuración para colas usando database
        'queue_database' => [
            'driver' => 'mysql',
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', '3306'),
            'database' => env('DB_DATABASE', 'forge'),
            'username' => env('DB_USERNAME', 'forge'),
            'password' => env('DB_PASSWORD', ''),
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
        ],
    ],
];
```

## Configuración de Colas

### Archivo config/queue.php

Las colas se usan para procesar eventos de broadcasting en segundo plano:

```php
<?php

return [
    'default' => env('QUEUE_CONNECTION', 'database'),

    'connections' => [
        'database' => [
            'driver' => 'database',
            'table' => 'jobs',
            'queue' => 'default',
            'retry_after' => 90,
            'after_commit' => false,
        ],

        'sync' => [
            'driver' => 'sync',
        ],
    ],

    'failed' => [
        'driver' => env('QUEUE_FAILED_DRIVER', 'database-uuids'),
        'database' => env('DB_CONNECTION', 'mysql'),
        'table' => 'failed_jobs',
    ],
];
```

## Middleware Personalizado

### IsAdmin Middleware

Middleware para verificar permisos de administrador:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Access denied. Admin privileges required.'
            ], 403);
        }

        return $next($request);
    }
}
```

**Registro en bootstrap/app.php:**
```php
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'isAdmin' => App\Http\Middleware\IsAdmin::class,
        ]);
    })
    ->create();
```

## Configuración de CORS

### CORS para API

En `config/cors.php` (si existe) o manejado por Laravel Sanctum:

```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:5173', 'http://127.0.0.1:5173'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

## Configuración de Providers

### En bootstrap/providers.php:

```php
<?php

return [
    App\Providers\AppServiceProvider::class,
    App\Providers\BroadcastServiceProvider::class, // Importante para WebSockets
];
```

### BroadcastServiceProvider

Asegúrate de que esté descomentado en `bootstrap/providers.php` para habilitar broadcasting:

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class BroadcastServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Broadcast::routes();
        
        require base_path('routes/channels.php');
    }
}
```

## Configuración de Canales de Broadcasting

### Archivo routes/channels.php

Define los canales públicos y privados:

```php
<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Aquí puedes registrar todos los canales de broadcasting para tu aplicación
|
*/

// Canal público para actualizaciones de feedbacks
Broadcast::channel('feedback-updates', function () {
    return true; // Canal público, cualquier usuario autenticado puede escuchar
});

// Canal público para actualizaciones de team members
Broadcast::channel('team-updates', function () {
    return true; // Canal público, cualquier usuario autenticado puede escuchar
});

// Ejemplo de canal privado (no usado actualmente)
Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});
```

## Scripts de Inicialización

### start.sh

Script que inicializa todos los servicios:

```bash
#!/bin/bash
set -e

echo "🔥 Iniciando servicios FUNA FENIX..."

# Verificar dependencias
if ! command -v composer &> /dev/null; then
    echo "❌ Composer no encontrado"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js no encontrado"
    exit 1
fi

echo "📦 Instalando dependencias de Composer..."
composer install --no-dev --optimize-autoloader --no-interaction

echo "📦 Instalando dependencias de Node.js..."
npm install

echo "⚙️ Configurando aplicación Laravel..."

# Copiar .env si no existe
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📁 Archivo .env creado desde .env.example"
fi

# Generar clave de aplicación
php artisan key:generate --force

# Limpiar y optimizar configuración
php artisan config:clear
php artisan config:cache
php artisan route:cache

echo "🗄️ Configurando base de datos..."
# Esperar a que MySQL esté disponible
until mysql -h"$DB_HOST" -u"$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE" -e 'select 1' &>/dev/null; do
    echo "⏳ Esperando conexión a MySQL..."
    sleep 2
done

echo "🔄 Ejecutando migraciones..."
php artisan migrate --force

echo "🌱 Ejecutando seeders..."
php artisan db:seed --force

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

# Función de limpieza para manejar señales de terminación
cleanup() {
    echo "🛑 Deteniendo servicios..."
    kill $QUEUE_PID $SOKETI_PID $LARAVEL_PID 2>/dev/null || true
    echo "✅ Servicios detenidos correctamente"
    exit 0
}

# Registrar función de limpieza para señales de terminación
trap cleanup SIGINT SIGTERM

echo "✅ Todos los servicios iniciados correctamente"
echo "📡 API disponible en: http://localhost:8000"
echo "📊 Métricas Soketi en: http://localhost:9601"

# Mantener el script corriendo
wait
```

## Troubleshooting Común

### Error de Broadcasting
**Problema**: Los eventos no se transmiten en tiempo real.
**Solución**: 
1. Verificar que Soketi esté corriendo en puerto 6001
2. Confirmar que Queue Worker esté procesando trabajos
3. Verificar configuración de broadcasting en `.env`

### Error de Base de Datos
**Problema**: Error de conexión a MySQL.
**Solución**:
1. Verificar variables DB_* en `.env`
2. Confirmar que MySQL esté corriendo
3. Verificar permisos de usuario de BD

### Error de Tokens
**Problema**: Tokens Sanctum no funcionan.
**Solución**:
1. Verificar configuración de dominios en `sanctum.php`
2. Confirmar que middleware `auth:sanctum` esté aplicado
3. Verificar CORS si hay problemas de frontend

### Error de Permisos
**Problema**: Errores de escritura en storage.
**Solución**:
```bash
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```
