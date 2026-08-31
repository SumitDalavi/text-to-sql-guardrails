FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install
COPY server/ ./
RUN npx tsc
ENV PORT=8080
EXPOSE 8080
CMD ["node", "dist/index.js"]
