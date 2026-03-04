FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy Prisma schema and generate client
COPY src/prisma ./src/prisma
RUN npm install @prisma/client

# Generate Prisma client
COPY src/prisma ./prisma
RUN npx prisma generate

# Copy application code
COPY dist ./dist

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 4000

CMD ["node", "dist/server.js"]
