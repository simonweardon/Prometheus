FROM nginx:alpine
# Where the Node backend (client portal + billing API) is reachable. Override
# at runtime, e.g. -e BACKEND_ORIGIN=http://backend:3001
ENV BACKEND_ORIGIN=http://backend:3001
# DNS resolver nginx uses to look up BACKEND_ORIGIN at request time. 127.0.0.11
# is Docker's embedded DNS (works under docker compose). Override if needed.
ENV NGINX_RESOLVER=127.0.0.11
COPY First /usr/share/nginx/html/index.html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/templates/default.conf.template
