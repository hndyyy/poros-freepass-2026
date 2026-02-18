FROM node:20-alpine3.20 as builder
ENV DEBIAN_FRONTEND=noninteractive
ARG VITE_API_URL
ENV VITE_API_URL=http://103.191.92.85:3000/api
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