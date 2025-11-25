#!/bin/bash

# Script para inicializar un proyecto Laravel en el contenedor

echo "🚀 Iniciando la creación del proyecto Laravel..."

# Verificar si ya existe un proyecto Laravel
if [ ! -f "composer.json" ]; then
    echo "📦 Creando nuevo proyecto Laravel..."
    composer create-project laravel/laravel . --prefer-dist
    
    echo "🔧 Configurando permisos..."
    chown -R www-data:www-data /var/www/html
    chmod -R 755 /var/www/html
    chmod -R 775 /var/www/html/storage
    chmod -R 775 /var/www/html/bootstrap/cache
    
    echo "📝 Copiando archivo de configuración..."
    if [ ! -f ".env" ] && [ -f ".env.example" ]; then
        cp .env.example .env
        php artisan key:generate
    fi
    
    echo "✅ Proyecto Laravel creado exitosamente!"
else
    echo "📦 Proyecto Laravel ya existe, instalando dependencias..."
    composer install
    
    echo "🔧 Configurando permisos..."
    chown -R www-data:www-data /var/www/html
    chmod -R 755 /var/www/html
    chmod -R 775 /var/www/html/storage
    chmod -R 775 /var/www/html/bootstrap/cache
    
    if [ ! -f ".env" ] && [ -f ".env.example" ]; then
        cp .env.example .env
        php artisan key:generate
    fi
    
    echo "✅ Dependencias instaladas!"
fi

echo "🎉 Laravel está listo para usar!"
echo "🌐 Puedes acceder a tu aplicación en: http://localhost:8000"
