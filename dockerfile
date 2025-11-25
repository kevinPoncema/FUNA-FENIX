FROM node:22

# Carpeta de trabajo
WORKDIR /app

# Copiamos primero las dependencias
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Ahora copiamos el resto del proyecto
COPY . .

# Exponemos el puerto de Vite
EXPOSE 5173

# Comando por defecto
CMD ["npm", "run", "dev", "--", "--host"]
