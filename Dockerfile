FROM node:22-alpine
WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src

RUN yarn build

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

CMD ["yarn", "start"]
