## Build stage
FROM node:20-alpine AS build

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev=false

COPY . .
RUN npm run build

## Runtime stage
FROM nginx:1.27-alpine AS runtime

WORKDIR /usr/share/nginx/html

COPY --from=build /app/dist ./

# Basic security / UX defaults
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

