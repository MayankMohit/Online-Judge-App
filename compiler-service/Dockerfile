FROM node:20-alpine
WORKDIR /app
RUN apk update && apk add --no-cache \
  build-base \
  gcc \
  g++ \
  make \
  libc6-compat \
  python3 \
  py3-pip 
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5001
CMD ["node", "index.js"]
