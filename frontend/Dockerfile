FROM node:20-slim

WORKDIR /app

# Copy npm config first
COPY .npmrc ./
COPY package*.json ./

# Install with extended timeout
RUN npm install --no-optional --fetch-timeout=60000 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000 

# Copy source code
COPY . .

# Build  
RUN npm run build

# Setup env
ENV NODE_ENV=production
ENV PORT=8080

RUN useradd -m -u 1001 nodeuser && chown -R nodeuser:nodeuser /app

USER nodeuser

EXPOSE 8080

CMD ["npm", "start"]
