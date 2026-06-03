# All-in-one image: nginx serves the marketing site and reverse-proxies the
# client portal + billing API to a Node backend running inside the SAME
# container on 127.0.0.1:3001. One deployable image, login works out of the box.
FROM node:20-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends nginx gettext-base \
  && rm -rf /var/lib/apt/lists/*

# Backend (client tracking + billing API; also serves the portal static pages)
WORKDIR /usr/src/app/backend
COPY backend/package*.json ./
RUN npm install --omit=dev
COPY backend/ ./

# Marketing site + nginx template + startup script
COPY First /usr/share/nginx/html/index.html
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# nginx listens on PORT; backend listens on BACKEND_PORT (proxied via loopback)
ENV PORT=8080 \
    BACKEND_PORT=3001 \
    BACKEND_ORIGIN=http://127.0.0.1:3001 \
    NGINX_RESOLVER=127.0.0.11 \
    DB_PATH=/data/prometheus.db
EXPOSE 8080
CMD ["docker-entrypoint.sh"]
