# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files (for caching)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the app
COPY . .

# Build the project
# Note: VITE_FIREBASE_* env vars would be needed here for a full prod build
RUN npm run build

# Stage 2: Serve using Nginx
FROM nginx:stable-alpine

# Copy the built files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port (default for Nginx is 80)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
