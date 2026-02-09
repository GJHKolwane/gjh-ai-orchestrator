FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

RUN npm run build

ENV PORT=8080

CMD ["npm", "start"]
