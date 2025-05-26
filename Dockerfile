# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json bun.lockb ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build        # outputs to /app/dist

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
