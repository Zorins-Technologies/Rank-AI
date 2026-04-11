# Use the official lightweight Node.js 20 image.
FROM node:20-slim

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install production dependencies.
RUN npm ci --only=production

# Copy local code to the container image.
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Service must listen on port 8080 by default for Cloud Run.
EXPOSE 8080

# Run the web service on container startup.
CMD [ "npm", "start" ]
