FROM node:20-alpine

WORKDIR /app

COPY services/singapore-server/package*.json ./
RUN npm install --omit=dev

COPY shared ./shared
COPY services/singapore-server ./services/singapore-server

WORKDIR /app/services/singapore-server

RUN mkdir -p /storage/uploads
VOLUME /storage/uploads

EXPOSE 5002
CMD ["node", "src/server.js"]
