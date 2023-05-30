FROM node:16-alpine3.17 AS build
COPY . .

RUN npm ci
RUN npm run build

FROM node:16-alpine3.17
WORKDIR /var/service

COPY --from=build /build ./build
COPY . .

RUN npm ci --omit=dev

EXPOSE 3000
ENTRYPOINT [ "node", "build/index.js" ]
