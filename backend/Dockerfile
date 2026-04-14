# Use the official lightweight Node.js 20 image.
FROM node:20-slim

# Create and change to the app directory.
WORKDIR /app

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install all dependencies (using npm install for better compatibility if lockfile was across platforms)
# But npm ci is safer if lockfile is guaranteed to be correct.
RUN npm install --production

# Copy local code to the container image.
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Run the web service on container startup.
CMD [ "node", "server.js" ]
