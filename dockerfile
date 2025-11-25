FROM node:18

# Carpeta de trabajo
WORKDIR /app

# Copia package.json y package-lock.json si existen
COPY package*.json ./

# Instalar dependencias si el proyecto ya tiene package.json
RUN if [ -f package.json ]; then npm install; fi

# Copia el resto del proyecto
COPY . .

# Comando por defecto: iniciar el servidor Vite
CMD ["npm", "run", "dev", "--", "--host"]
