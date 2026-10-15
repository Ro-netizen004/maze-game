FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY server ./server
COPY src ./src
ENV PORT=8787
EXPOSE 8787
CMD ["npm", "run", "server"]
