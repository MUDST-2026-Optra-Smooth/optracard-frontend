# Stage 1: Build Frontend
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies deterministically
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]