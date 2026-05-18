FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine AS production

ENV NODE_ENV=production
ENV PORT=3002

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY --from=build /app/src/data ./src/data
COPY server.js ./server.js

RUN mkdir -p /app/data

EXPOSE 3002

CMD ["npm", "start"]
