LABEL org.opencontainers.image.source=https://github.com/nintendo424/qbittorrent-tracker-add
LABEL org.opencontainers.image.description="Automatically update qBittorrent tracker list."
LABEL org.opencontainers.image.licenses=MIT

FROM node:alpine AS builder
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm i -g npm && npm i
COPY . .
RUN npm run build

FROM node:alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm i -g npm && npm i --ci
COPY --from=builder /usr/src/app/dist ./dist
CMD ["node", "./dist/index.js"]