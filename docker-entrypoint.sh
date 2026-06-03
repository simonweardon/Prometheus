#!/bin/sh
# Starts the Node backend (on the loopback interface) and nginx (public) inside
# one container. nginx serves the marketing site and proxies the portal/API to
# the backend at 127.0.0.1:${BACKEND_PORT}.
set -e

: "${PORT:=8080}"
: "${BACKEND_PORT:=3001}"
: "${BACKEND_ORIGIN:=http://127.0.0.1:3001}"
: "${NGINX_RESOLVER:=127.0.0.11}"
: "${DB_PATH:=/data/prometheus.db}"
: "${JWT_SECRET:=please-change-this-in-production}"
export PORT BACKEND_ORIGIN NGINX_RESOLVER DB_PATH JWT_SECRET

# Render the nginx server config from the template (only our env vars).
mkdir -p /etc/nginx/conf.d
envsubst '${PORT} ${BACKEND_ORIGIN} ${NGINX_RESOLVER}' \
  < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
# Drop Debian's packaged default site so it can't clash with ours.
rm -f /etc/nginx/sites-enabled/default

# Start the backend: run migrations (creates tables, seeds the default admin),
# then launch the server on the loopback interface.
mkdir -p "$(dirname "$DB_PATH")"
cd /usr/src/app/backend
PORT="$BACKEND_PORT" node db/migrate.js
PORT="$BACKEND_PORT" node server.js &
backend_pid=$!

# If the backend exits, bring the container down too.
trap 'kill "$backend_pid" 2>/dev/null' TERM INT

# Wait for the backend to accept connections before starting nginx.
echo "Waiting for backend on :${BACKEND_PORT}..."
i=0
while [ "$i" -lt 30 ]; do
  if node -e "require('http').get(process.argv[1],r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))" "http://127.0.0.1:${BACKEND_PORT}/health" 2>/dev/null; then
    echo "Backend is up."
    break
  fi
  i=$((i + 1))
  sleep 1
done

exec nginx -g 'daemon off;'
