FROM node:18

WORKDIR /usr/src/app/ui
COPY ui/package*.json ./
RUN npm install

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 8080
CMD ["npm", "prod-proxy"]
