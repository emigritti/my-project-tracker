# Backend Dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create directory for analysis results
RUN mkdir -p analysis-results

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
