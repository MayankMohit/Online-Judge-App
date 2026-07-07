# Pinned by digest for reproducible builds. Bump periodically for security updates.
FROM node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293
WORKDIR /app
# Copy manifests first so `npm install` is only re-run when dependencies change,
# not on every source edit (Docker layer caching).
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["node", "index.js"]
