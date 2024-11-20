FROM node:20.0-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build



FROM node:20.0-alpine AS production

ENV NODE_ENV=prod

WORKDIR /app

COPY package*.json ./

RUN npm ci --ignore-scripts

COPY --from=builder /app/dist ./

EXPOSE 9001

CMD [ "node", "src/server.js" ]