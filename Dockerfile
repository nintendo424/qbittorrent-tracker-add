FROM node:22-alpine AS builder
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm i -g npm && npm i
COPY . .
RUN npm run build

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN apk add --no-cache tzdata
RUN npm i -g npm && npm i --ci
COPY --from=builder /usr/src/app/dist ./dist
CMD ["node", "./dist/index.js"]