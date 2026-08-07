FROM node:20-alpine

WORKDIR /app

COPY services/germany-server/package*.json ./
RUN npm install --omit=dev

COPY shared ./shared
COPY services/germany-server ./services/germany-server

WORKDIR /app/services/germany-server

RUN mkdir -p /storage/uploads
VOLUME /storage/uploads

EXPOSE 5003
CMD ["node", "src/server.js"]
