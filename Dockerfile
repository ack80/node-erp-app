FROM node:20-alpine

WORKDIR /app

# Copiar dependencias
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copiar el código fuente
COPY . .

# Exponer el puerto de la app
EXPOSE 5000

# Comando de arranque para producción (usando variables de entorno directas)
CMD ["node", "src/main.js"]