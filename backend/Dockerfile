FROM node:24-alpine
WORKDIR /var/www/html
COPY . /var/www/html

RUN apk add --no-cache openssl
RUN npm install
RUN npx prisma generate
RUN npm run build

CMD ["npm","start"]
