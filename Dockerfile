FROM nginx:alpine
# Where the Node backend (client portal + billing API) is reachable. Override
# at runtime, e.g. -e BACKEND_ORIGIN=http://backend:3001
ENV BACKEND_ORIGIN=http://backend:3001
COPY First /usr/share/nginx/html/index.html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/templates/default.conf.template
