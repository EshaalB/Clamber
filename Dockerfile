# Use Node 22 (LTS)
FROM node:22-alpine

# Create app directory
WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies (using workspaces for speed)
RUN npm install

# Copy the rest of the code
COPY . .

# Build the frontend
RUN npm run build-frontend

# Create logs directory
RUN mkdir -p logs

# Set environment to production
ENV NODE_ENV=production

# Expose the port (Sevalla uses PORT env var, but 5000 is our default)
EXPOSE 5000

# Start the application using our bridge
CMD ["node", "index.js"]
