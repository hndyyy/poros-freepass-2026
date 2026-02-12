FROM node:20-alpine3.20 as builder
ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app
COPY . /app
RUN npm install
RUN npm run build

FROM nginx:1.26-alpine
ENV DEBIAN_FRONTEND=noninteractive
COPY --from=builder --chown=nginx:nginx /app/dist /var/www/html/dist
WORKDIR /var/www/html
COPY nginx/default /etc/nginx/conf.d/default.conf

EXPOSE 80
EXPOSE 443

CMD nginx -g 'daemon off;'