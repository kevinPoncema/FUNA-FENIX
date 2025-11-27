# Configuración General - Docker y Despliegue

Esta documentación explica en detalle cómo configurar y levantar el proyecto FUNA FENIX usando Docker, incluyendo todos los servicios necesarios y su configuración.

## 📋 Tabla de Contenidos

1. [Prerrequisitos](#prerrequisitos)
2. [Estructura de Docker](#estructura-de-docker)
3. [Archivo docker-compose.yml](#archivo-docker-composeyml)
4. [Dockerfiles Individuales](#dockerfiles-individuales)
5. [Variables de Entorno](#variables-de-entorno)
6. [Script de Inicio Automatizado](#script-de-inicio-automatizado)
7. [Levantamiento del Proyecto](#levantamiento-del-proyecto)
8. [Verificación de Servicios](#verificación-de-servicios)
9. [Solución de Problemas](#solución-de-problemas)
10. [Configuración de Red](#configuración-de-red)

## 🔧 Prerrequisitos

### Software Requerido
- **Docker Engine**: 20.10.0 o superior
- **Docker Compose**: 2.0.0 o superior
- **Git**: Para clonar el repositorio
- **Mínimo 4GB RAM**: Para ejecutar todos los servicios
- **Puertos libres**: 3306, 5173, 6001, 8000, 9601

### Verificación de Prerrequisitos
```bash
# Verificar Docker
docker --version
# Salida esperada: Docker version 20.10.x

# Verificar Docker Compose
docker compose version
# Salida esperada: Docker Compose version v2.x.x

# Verificar puertos disponibles
netstat -tuln | grep -E '(3306|5173|6001|8000|9601)'
# No debería mostrar salida (puertos libres)

# Verificar espacio en disco (mínimo 2GB)
df -h .
```

## 🏗️ Estructura de Docker

El proyecto está organizado en 4 servicios principales:

```
FUNA-FENIX/
├── docker-compose.yml          # Orquestación principal
├── soketi-config.json         # Configuración WebSocket
├── backend/
│   ├── dockerfile            # Imagen PHP/Laravel
│   └── start.sh              # Script de inicio backend
├── frontend/
│   └── dockerfile            # Imagen Node.js/React
└── docs/
    └── CONF_GENERAL.md       # Este documento
```

### Servicios Configurados

| Servicio | Imagen Base | Puerto | Función |
|----------|-------------|--------|---------|
| **backend** | php:8.2-fpm | 8000 | API Laravel + WebSocket |
| **frontend** | node:18-alpine | 5173 | Aplicación React |
| **database** | mysql:8.0 | 3306 | Base de datos MySQL |
| **soketi** | quay.io/soketi/soketi:latest-16-alpine | 6001 | Servidor WebSocket |

## 📄 Archivo docker-compose.yml

### Configuración Completa
```yaml
version: '3.8'

services:
  # Base de datos MySQL
  database:
    image: mysql:8.0
    container_name: fenix_database
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD:-root_password}
      MYSQL_DATABASE: ${DB_DATABASE:-fenix_feedback}
      MYSQL_USER: ${DB_USERNAME:-fenix_user}
      MYSQL_PASSWORD: ${DB_PASSWORD:-fenix_password}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - fenix-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  # Backend Laravel
  backend:
    build:
      context: ./backend
      dockerfile: dockerfile
    container_name: fenix_backend
    restart: unless-stopped
    ports:
      - "8000:8000"
    volumes:
      - ./backend/src:/var/www/html
      - ./soketi-config.json:/var/www/html/soketi-config.json:ro
    environment:
      - DB_CONNECTION=mysql
      - DB_HOST=database
      - DB_PORT=3306
      - DB_DATABASE=${DB_DATABASE:-fenix_feedback}
      - DB_USERNAME=${DB_USERNAME:-fenix_user}
      - DB_PASSWORD=${DB_PASSWORD:-fenix_password}
      - BROADCAST_DRIVER=pusher
      - PUSHER_APP_ID=${PUSHER_APP_ID:-local-app}
      - PUSHER_APP_KEY=${PUSHER_APP_KEY:-local-key}
      - PUSHER_APP_SECRET=${PUSHER_APP_SECRET:-local-secret}
      - PUSHER_HOST=127.0.0.1
      - PUSHER_PORT=6001
      - PUSHER_SCHEME=http
    depends_on:
      database:
        condition: service_healthy
    networks:
      - fenix-network

  # Frontend React
  frontend:
    build:
      context: ./frontend
      dockerfile: dockerfile
    container_name: fenix_frontend
    restart: unless-stopped
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:8000
      - VITE_WEBSOCKET_HOST=localhost
      - VITE_WEBSOCKET_PORT=6001
    depends_on:
      - backend
    networks:
      - fenix-network

volumes:
  mysql_data:
    driver: local

networks:
  fenix-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### Explicación de Servicios

#### 🗃️ Database (MySQL)
- **Propósito**: Base de datos principal del sistema
- **Persistencia**: Volume `mysql_data` para mantener datos
- **Healthcheck**: Verifica que MySQL esté listo antes de iniciar otros servicios
- **Variables**: Configurables vía `.env` o valores por defecto

#### 🔧 Backend (Laravel)
- **Propósito**: API REST, WebSocket y lógica de negocio
- **Dependencias**: Espera a que database esté saludable
- **Volumes**: Código fuente montado para desarrollo
- **Puertos**: 8000 para HTTP, internamente maneja WebSocket en 6001

#### 🌐 Frontend (React)
- **Propósito**: Interfaz de usuario interactiva
- **Hot Reload**: Habilitado para desarrollo
- **Proxy**: Vite configured para proxy API calls
- **Dependencias**: Requiere backend activo

#### 📡 Network Configuration
- **Red personalizada**: `fenix-network` con subnet 172.20.0.0/16
- **Resolución DNS**: Los servicios se comunican por nombre
- **Aislamiento**: Red privada para seguridad interna

## 🐳 Dockerfiles Individuales

### Backend Dockerfile
```dockerfile
# Ubicación: ./backend/dockerfile
FROM php:8.2-fpm

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    nodejs \
    npm \
    default-mysql-client

# Instalar extensiones PHP
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configurar directorio de trabajo
WORKDIR /var/www/html

# Copiar código fuente
COPY src/ .

# Instalar dependencias PHP
RUN composer install --no-dev --optimize-autoloader

# Instalar Node.js dependencies (para Soketi)
RUN npm install -g @soketi/soketi

# Hacer el script ejecutable
RUN chmod +x start.sh

# Exponer puerto
EXPOSE 8000

# Comando por defecto
CMD ["./start.sh"]
```

### Frontend Dockerfile
```dockerfile
# Ubicación: ./frontend/dockerfile
FROM node:18-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache git

# Configurar directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 5173

# Comando por defecto
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

## 🔐 Variables de Entorno

### Archivo .env Principal (Raíz del Proyecto)
```bash
# Base de datos
DB_ROOT_PASSWORD=secure_root_password
DB_DATABASE=fenix_feedback
DB_USERNAME=fenix_user
DB_PASSWORD=secure_user_password

# WebSocket/Broadcasting
PUSHER_APP_ID=local-app
PUSHER_APP_KEY=local-key
PUSHER_APP_SECRET=local-secret

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
```

### Backend .env (./backend/src/.env)
```bash
APP_NAME=FunaFenix
APP_ENV=production
APP_KEY=base64:generated_automatically
APP_DEBUG=false
APP_URL=http://localhost:8000

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

# Base de datos
DB_CONNECTION=mysql
DB_HOST=database
DB_PORT=3306
DB_DATABASE=fenix_feedback
DB_USERNAME=fenix_user
DB_PASSWORD=fenix_password

# Broadcasting / WebSocket
BROADCAST_DRIVER=pusher
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database
SESSION_DRIVER=file
SESSION_LIFETIME=120

# Pusher/Soketi Configuration
PUSHER_APP_ID=local-app
PUSHER_APP_KEY=local-key
PUSHER_APP_SECRET=local-secret
PUSHER_HOST=127.0.0.1
PUSHER_PORT=6001
PUSHER_SCHEME=http

# Laravel Sanctum
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1,localhost:5173

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Queue Worker
QUEUE_WORKER=true
QUEUE_CONNECTION=database
```

### Configuración Soketi (./soketi-config.json)
```json
{
  "debug": true,
  "port": 6001,
  "metrics": {
    "enabled": true,
    "port": 9601,
    "driver": "prometheus"
  },
  "appManager": {
    "driver": "array",
    "array": {
      "apps": [
        {
          "id": "local-app",
          "key": "local-key",
          "secret": "local-secret",
          "maxConnections": 100,
          "enableClientMessages": true,
          "enabled": true,
          "maxBackendEventsPerSecond": 100,
          "maxClientEventsPerSecond": 60,
          "maxReadRequestsPerSecond": 100
        }
      ]
    }
  },
  "cors": {
    "credentials": true,
    "origin": ["http://localhost:5173", "http://127.0.0.1:5173"],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allowedHeaders": ["Origin", "Content-Type", "X-Auth-Token", "Authorization", "Accept", "X-Requested-With", "X-CSRF-TOKEN"]
  },
  "ssl": {
    "enabled": false
  }
}
```

## 🚀 Script de Inicio Automatizado

### Backend start.sh
```bash
#!/bin/bash
set -e

echo "🔥 Iniciando servicios FUNA FENIX..."

# Colores para logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Función de limpieza
cleanup() {
    log_warning "Deteniendo servicios..."
    if [ ! -z "$QUEUE_PID" ]; then
        kill $QUEUE_PID 2>/dev/null || true
    fi
    if [ ! -z "$SOKETI_PID" ]; then
        kill $SOKETI_PID 2>/dev/null || true
    fi
    if [ ! -z "$LARAVEL_PID" ]; then
        kill $LARAVEL_PID 2>/dev/null || true
    fi
    log_info "Servicios detenidos"
    exit 0
}

# Capturar señales de terminación
trap cleanup SIGINT SIGTERM

# Verificar dependencias
log_info "Verificando dependencias..."

if ! command -v php &> /dev/null; then
    log_error "PHP no encontrado"
    exit 1
fi

if ! command -v composer &> /dev/null; then
    log_error "Composer no encontrado"
    exit 1
fi

if ! command -v node &> /dev/null; then
    log_error "Node.js no encontrado"
    exit 1
fi

log_success "Dependencias verificadas"

# Instalar dependencias PHP
log_info "Instalando dependencias PHP..."
composer install --no-dev --optimize-autoloader --quiet

# Configurar aplicación Laravel
log_info "Configurando aplicación Laravel..."

# Crear .env si no existe
if [ ! -f .env ]; then
    log_info "Creando archivo .env..."
    cp .env.example .env
fi

# Generar clave de aplicación
php artisan key:generate --force --quiet

# Limpiar y cachear configuración
php artisan config:clear --quiet
php artisan cache:clear --quiet
php artisan config:cache --quiet
php artisan route:cache --quiet

log_success "Laravel configurado"

# Esperar a que la base de datos esté lista
log_info "Esperando conexión a base de datos..."
until php artisan migrate:status &> /dev/null; do
    log_warning "Base de datos no disponible, esperando..."
    sleep 5
done

log_success "Base de datos conectada"

# Ejecutar migraciones
log_info "Ejecutando migraciones..."
php artisan migrate --force --quiet

# Poblar base de datos
log_info "Poblando base de datos..."
php artisan db:seed --force --quiet

log_success "Base de datos inicializada"

# Iniciar Queue Worker
log_info "Iniciando Queue Worker..."
php artisan queue:work --daemon --quiet &
QUEUE_PID=$!

if [ $? -eq 0 ]; then
    log_success "Queue Worker iniciado (PID: $QUEUE_PID)"
else
    log_error "Error iniciando Queue Worker"
    exit 1
fi

# Iniciar Soketi WebSocket Server
log_info "Iniciando Soketi WebSocket Server..."
npx soketi start \
    --config=/var/www/html/soketi-config.json \
    --port=6001 \
    --metrics-server-port=9601 \
    --quiet &
SOKETI_PID=$!

if [ $? -eq 0 ]; then
    log_success "Soketi iniciado (PID: $SOKETI_PID)"
else
    log_error "Error iniciando Soketi"
    exit 1
fi

# Esperar a que Soketi esté listo
sleep 3

# Verificar que Soketi esté corriendo
if ! curl -f http://localhost:6001/ &> /dev/null; then
    log_warning "Soketi no responde inmediatamente, continuando..."
fi

# Iniciar Laravel Server
log_info "Iniciando Laravel Server..."
php artisan serve --host=0.0.0.0 --port=8000 --quiet &
LARAVEL_PID=$!

if [ $? -eq 0 ]; then
    log_success "Laravel Server iniciado (PID: $LARAVEL_PID)"
else
    log_error "Error iniciando Laravel Server"
    exit 1
fi

# Mensaje de éxito
echo ""
log_success "🔥 ¡Todos los servicios FUNA FENIX iniciados correctamente!"
echo ""
log_info "📋 Estado de servicios:"
log_info "   🌐 Laravel API: http://localhost:8000"
log_info "   📡 Soketi WebSocket: http://localhost:6001"
log_info "   ⚡ Queue Worker: Activo (PID: $QUEUE_PID)"
log_info "   📊 Métricas Soketi: http://localhost:9601/metrics"
echo ""
log_info "Presiona Ctrl+C para detener todos los servicios"

# Mantener el script corriendo
wait
```

## 🏃‍♂️ Levantamiento del Proyecto

### Opción 1: Un Solo Comando (Recomendado)
```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/FUNA-FENIX.git
cd FUNA-FENIX

# Levantar todos los servicios
docker compose up --build

# Para ejecutar en segundo plano
docker compose up --build -d
```

### Opción 2: Paso a Paso
```bash
# 1. Preparar el entorno
git clone https://github.com/tu-usuario/FUNA-FENIX.git
cd FUNA-FENIX

# 2. Configurar variables de entorno (opcional)
cp .env.example .env
# Editar .env según necesidades

# 3. Construir imágenes
docker compose build

# 4. Iniciar base de datos primero
docker compose up database -d

# 5. Esperar a que esté lista (30-60 segundos)
docker compose logs database -f

# 6. Iniciar backend
docker compose up backend -d

# 7. Iniciar frontend
docker compose up frontend -d

# 8. Verificar servicios
docker compose ps
```

### Opción 3: Solo Backend o Frontend
```bash
# Solo backend + base de datos
docker compose up database backend --build

# Solo frontend (requiere backend externo)
docker compose up frontend --build
```

## ✅ Verificación de Servicios

### 1. Verificar Estado de Contenedores
```bash
# Ver todos los servicios
docker compose ps

# Salida esperada:
# NAME              COMMAND                  SERVICE    STATUS     PORTS
# fenix_backend     "./start.sh"             backend    running    0.0.0.0:8000->8000/tcp
# fenix_database    "docker-entrypoint.s…"   database   running    0.0.0.0:3306->3306/tcp
# fenix_frontend    "docker-entrypoint.s…"   frontend   running    0.0.0.0:5173->5173/tcp
```

### 2. Verificar Conectividad de Servicios
```bash
# Base de datos
docker compose exec database mysql -u fenix_user -p fenix_feedback
# Contraseña: fenix_password

# Backend API
curl http://localhost:8000/api/health || echo "Backend no responde"

# Frontend
curl http://localhost:5173 || echo "Frontend no responde"

# WebSocket Soketi
curl http://localhost:6001 || echo "Soketi no responde"
```

### 3. Verificar Logs
```bash
# Logs de todos los servicios
docker compose logs

# Logs de servicio específico
docker compose logs backend
docker compose logs frontend
docker compose logs database

# Logs en tiempo real
docker compose logs -f backend

# Últimas 50 líneas
docker compose logs --tail=50 backend
```

### 4. Verificar Procesos Internos
```bash
# Procesos en backend
docker compose exec backend ps aux

# Verificar Queue Worker
docker compose exec backend ps aux | grep queue

# Verificar Soketi
docker compose exec backend ps aux | grep soketi

# Verificar Laravel
docker compose exec backend ps aux | grep php
```

### 5. Verificar Red y Comunicación
```bash
# Probar comunicación entre servicios
docker compose exec backend ping database
docker compose exec frontend ping backend

# Verificar puertos internos
docker compose exec backend netstat -tuln
```

### 6. Tests de Funcionalidad

#### Test API Backend
```bash
# Health check
curl -X GET http://localhost:8000/api/health

# Login test (debe devolver 422 por datos faltantes)
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin"}'

# CORS test
curl -X OPTIONS http://localhost:8000/api/health \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET"
```

#### Test WebSocket
```bash
# Verificar Soketi stats
curl http://localhost:6001/usage | jq .

# Verificar métricas
curl http://localhost:9601/metrics
```

#### Test Frontend
```bash
# Verificar assets
curl http://localhost:5173/src/main.jsx

# Verificar configuración de desarrollo
curl http://localhost:5173/@vite/client
```

## 🔧 Solución de Problemas

### Problemas Comunes

#### 1. Puerto Ocupado
```bash
# Error: bind: address already in use
# Solución: Encontrar y terminar proceso

# Identificar proceso en puerto 8000
lsof -ti:8000

# Terminar proceso
kill -9 $(lsof -ti:8000)

# O cambiar puerto en docker-compose.yml
ports:
  - "8001:8000"  # Puerto externo modificado
```

#### 2. Base de Datos No Conecta
```bash
# Verificar que MySQL esté corriendo
docker compose logs database

# Verificar health check
docker compose exec database mysqladmin ping

# Reiniciar solo base de datos
docker compose restart database

# Verificar variables de entorno
docker compose exec backend printenv | grep DB_
```

#### 3. WebSocket No Funciona
```bash
# Verificar Soketi
docker compose exec backend curl http://localhost:6001/

# Verificar configuración
docker compose exec backend cat soketi-config.json

# Verificar Queue Worker
docker compose exec backend ps aux | grep queue

# Reiniciar Queue Worker
docker compose exec backend php artisan queue:restart
```

#### 4. Frontend No Carga
```bash
# Verificar logs
docker compose logs frontend

# Verificar puerto interno
docker compose exec frontend netstat -tuln | grep 5173

# Verificar variables de entorno
docker compose exec frontend printenv | grep VITE_

# Reconstruir
docker compose build frontend --no-cache
```

#### 5. Permisos de Archivos
```bash
# En sistemas Linux/Mac
sudo chown -R $USER:$USER ./backend/src/storage
sudo chmod -R 775 ./backend/src/storage

# Dentro del contenedor
docker compose exec backend chmod -R 775 /var/www/html/storage
```

#### 6. Memoria Insuficiente
```bash
# Verificar uso de memoria
docker stats

# Aumentar límites en docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
```

#### 7. Limpiar y Reiniciar Completamente
```bash
# Detener todo
docker compose down

# Limpiar volúmenes (¡CUIDADO! Elimina datos)
docker compose down -v

# Limpiar imágenes
docker compose down --rmi all

# Limpiar caché de Docker
docker system prune -af

# Reiniciar desde cero
docker compose up --build --force-recreate
```

### Comandos de Diagnóstico

#### Estado General
```bash
# Resumen completo
./scripts/health-check.sh  # Si existe

# O manual:
echo "=== DOCKER COMPOSE STATUS ==="
docker compose ps

echo -e "\n=== SERVICIOS ACTIVOS ==="
curl -s http://localhost:8000/api/health && echo " - Backend OK" || echo " - Backend FAIL"
curl -s http://localhost:5173 >/dev/null && echo " - Frontend OK" || echo " - Frontend FAIL"
curl -s http://localhost:6001 >/dev/null && echo " - WebSocket OK" || echo " - WebSocket FAIL"

echo -e "\n=== LOGS RECIENTES ==="
docker compose logs --tail=5 backend frontend database
```

#### Monitoreo en Tiempo Real
```bash
# Logs en tiempo real de todos los servicios
docker compose logs -f

# Monitoreo de recursos
watch docker stats

# Monitoreo de red
docker compose exec backend netstat -tuln
```

### Configuración de Red

#### Red Interna
- **Subnet**: 172.20.0.0/16
- **Gateway**: 172.20.0.1
- **DNS**: Resolución automática por nombre de servicio

#### Comunicación Entre Servicios
```yaml
# Backend se conecta a database usando:
DB_HOST=database  # Nombre del servicio, no localhost

# Frontend se conecta a backend usando:
VITE_API_URL=http://localhost:8000  # Desde el navegador (host)

# Backend interno usa:
APP_URL=http://backend:8000  # Para comunicación interna si fuera necesario
```

#### Puertos Expuestos
| Puerto | Servicio | Propósito |
|--------|----------|-----------|
| 3306 | MySQL | Base de datos (desarrollo) |
| 5173 | Vite | Frontend React |
| 6001 | Soketi | WebSocket server |
| 8000 | Laravel | API backend |
| 9601 | Soketi | Métricas (opcional) |

## 📚 Recursos Adicionales

### Documentación Relacionada
- [Backend Configuration](./backend/CONFIGURATION.md)
- [Frontend Structure](./frontend/STRUCTURE_CONFIGURATION.md)
- [API Documentation](./backend/API_DOCUMENTATION.md)
- [WebSocket Setup](./WEBSOCKET_SETUP.md)

### Enlaces Útiles
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Laravel Docker Guide](https://laravel.com/docs/10.x/sail)
- [Vite Docker Configuration](https://vitejs.dev/guide/env-and-mode.html)
- [Soketi Documentation](https://docs.soketi.app/)

### Comandos de Referencia Rápida
```bash
# Iniciar proyecto
docker compose up --build

# Detener proyecto
docker compose down

# Reconstruir servicio específico
docker compose build backend --no-cache

# Ver logs
docker compose logs -f backend

# Ejecutar comando en contenedor
docker compose exec backend php artisan migrate

# Limpiar volúmenes
docker compose down -v

# Estado de servicios
docker compose ps

# Estadísticas de recursos
docker stats
```

---