###########################
# 1) Build Stage
###########################
FROM node:22-alpine AS builder
WORKDIR /app

# npm ci → lockfile 기준 reproducible build
COPY package*.json ./
RUN npm ci

# 소스 복사 및 빌드
COPY . .
RUN npx prisma generate   # prisma client 생성
RUN npm run build         # nest build


###########################
# 2) Production Stage
###########################
FROM node:22-alpine
WORKDIR /app

# prod deps만 복사
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

# 프로세스
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/main"]
