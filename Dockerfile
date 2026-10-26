# Stage 1: Build Frontend
FROM node:22-alpine AS builder
WORKDIR /app

# Disable Cypress binary download in Docker build (saves ~300MB and prevents hanging)
ENV CYPRESS_INSTALL_BINARY=0

# Install dependencies deterministically
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit

# Copy source code and build
COPY . .
# The Kubernetes image calls its API through the Nginx /api reverse proxy.
# An empty value is intentional: Vite embeds it as a same-origin relative URL.
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Kubernetes supplies its Service DNS name. Docker Compose overrides this with
# the host-machine Backend exposed on port 8080.
ENV BACKEND_UPSTREAM=optracard-backend-service.optracard-backend.svc.cluster.local:8080
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
