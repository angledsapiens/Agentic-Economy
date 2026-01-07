# Base image
FROM node:18-slim

# Install basics
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Workdir
WORKDIR /app

# Copy Configs
COPY package.json tsconfig.json ./
COPY src ./src
COPY mission-control ./mission-control

# Install Dependencies (Root + Extension)
RUN npm install
RUN cd mission-control && npm install

# OPTIONAL: Copy .env for pre-authenticated demo
# WARNING: Only do this if sharing the image PRIVATELY.
# COPY .env .env

# Default Command: Run the Demo Handshake
CMD ["npm", "run", "demo"]
