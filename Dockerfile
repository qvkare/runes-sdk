FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Expose metrics port
EXPOSE 9090

# Set environment variables
ENV NODE_ENV=production

# Run the application
CMD ["node", "dist/index.js"] 