FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Run migrations and seeds on startup
CMD npm run migrate && npm run seed && npm start
