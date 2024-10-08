FROM node:alpine AS builder
WORKDIR /usr/src/app
COPY package.json package-lock.json .
RUN npm install
COPY . .
RUN npm run build

FROM node:alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package.json package-lock.json .
RUN npm install --ci
COPY --from=builder /usr/src/app/dist ./dist
CMD ["node", "./dist/index.js"]