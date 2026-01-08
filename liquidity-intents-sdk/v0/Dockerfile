FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TS
RUN npm run build
# Compile server (if not part of build script, manual compile for safety)
RUN npx tsc

EXPOSE 3000

# Start server
CMD ["node", "dist/src/server.js"]
