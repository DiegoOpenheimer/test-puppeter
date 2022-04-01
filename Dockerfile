FROM node:fermium-alpine3.14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

RUN apk add -q --update --no-cache chromium

ENV CHROME_BIN=/usr/bin/chromium-browser \
  CHROME_PATH=/usr/lib/chromium/ \
  PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN apk update && apk add tzdata

COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]