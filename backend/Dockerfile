FROM node:20-slim
WORKDIR /usr/src/app

# Build tools so better-sqlite3 can compile from source if no prebuilt binary
# matches the platform. Removed from the final layer to keep the image lean.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

ENV PORT=3001
# Keep the SQLite file on a volume-friendly path outside the app dir so a
# mounted volume doesn't shadow schema.sql / migrate.js.
ENV DB_PATH=/data/prometheus.db
EXPOSE 3001

# Run migrations (creates tables + seeds the default admin) then start.
CMD ["sh", "-c", "mkdir -p /data && node db/migrate.js && node server.js"]
