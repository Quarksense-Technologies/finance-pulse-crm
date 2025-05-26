# backend/Dockerfile

FROM node:18-alpine AS deps
WORKDIR /app
COPY backend/package*.json ./    
RUN npm install --omit=dev

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .                  
EXPOSE 5000
CMD ["npm", "start"]

