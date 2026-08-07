FROM node:20-alpine

WORKDIR /app

COPY services/india-server/package*.json ./
RUN npm install --omit=dev

COPY shared ./shared
COPY services/india-server ./services/india-server

WORKDIR /app/services/india-server

RUN mkdir -p /storage/uploads
VOLUME /storage/uploads

EXPOSE 5001
CMD ["node", "src/server.js"]
