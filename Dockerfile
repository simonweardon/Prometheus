FROM nginx:alpine
COPY First /usr/share/nginx/html/index.html
EXPOSE 80
