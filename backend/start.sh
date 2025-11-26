#!/bin/bash

# Script de inicio para el backend de Laravel
echo "🚀 Iniciando servicios del backend..."

# Instalar/actualizar dependencias si es necesario
echo "📦 Verificando dependencias..."
if [ ! -d "vendor" ]; then
    composer install
fi

# Ejecutar migraciones
echo "🗄️ Ejecutando migraciones..."
php artisan migrate --force

# Iniciar el worker de colas en segundo plano
echo "🔄 Iniciando worker de colas..."
php artisan queue:work --daemon &

# Iniciar servidor Soketi en segundo plano  
echo "🌐 Iniciando servidor WebSocket (Soketi)..."
SOKETI_DEFAULT_APP_ID=local-app SOKETI_DEFAULT_APP_KEY=local-key SOKETI_DEFAULT_APP_SECRET=local-secret SOKETI_DEBUG=true npx @soketi/soketi start --port=6001 --host=0.0.0.0 &

# Esperar un momento para que los servicios se inicien
sleep 3

echo "✅ Todos los servicios iniciados"
echo "📡 Servidor Laravel: http://localhost:8000"
echo "🌐 Servidor WebSocket: http://localhost:6001"
echo "🔄 Queue Worker: Ejecutándose en segundo plano"

# Iniciar el servidor de Laravel (este debe ser el proceso principal)
echo "🎯 Iniciando servidor Laravel..."
php artisan serve --host=0.0.0.0 --port=8000