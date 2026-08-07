FROM node:20-alpine

WORKDIR /app

COPY gateway/package*.json ./
RUN npm install --omit=dev

COPY shared ./shared
COPY gateway ./gateway

WORKDIR /app/gateway

EXPOSE 5000

CMD ["node", "src/server.js"]
