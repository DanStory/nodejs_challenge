FROM node:10.14.0-alpine as build

WORKDIR /app/src

COPY package*.json ./
RUN npm install

COPY ./tsconfig.json ./tsconfig.json
COPY ./src ./src
RUN npm run build


FROM node:10.14.0-alpine

WORKDIR /app
COPY --from=build /app/src/dist ./dist
COPY package*.json ./
RUN npm install --production && \
    rm -f package*.json

EXPOSE 3000
ENTRYPOINT ["node", "./dist"]
CMD ["--help"]