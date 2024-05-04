FROM node:18-alpine as development

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

# fixing error calling prisma client in server.ts
RUN npm install -g dotenv-cli
RUN npm i -g prisma
RUN prisma generate

COPY . .
RUN npm run build

# CMD ["npm", "run", "start"]

FROM node:18-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/prisma  ./prisma

# fixing error calling prisma client in server.ts
RUN npm install -g dotenv-cli
RUN npm i -g prisma
RUN prisma generate

EXPOSE 8000

CMD ["node", "./dist/server.js"]