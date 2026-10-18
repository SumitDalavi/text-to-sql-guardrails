FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm install
COPY server/tsconfig.json ./
COPY server/src ./src
RUN npx tsc
ENV PORT=8080
EXPOSE 8080
CMD ["node", "dist/index.js"]
