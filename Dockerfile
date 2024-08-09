FROM node:21-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY src ./src

CMD ["npm", "start"]
