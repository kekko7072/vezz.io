# Use Node.js LTS version
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Expose port (Cloud Run uses PORT env variable)
ENV PORT=8080
EXPOSE 8080

# Start the server (adapter-node creates server.js in the build directory)
CMD ["node", "build/server.js"]
