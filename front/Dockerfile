# Dockerfile
FROM node:22-alpine

# create destination directory
RUN mkdir -p /usr/src/front-app
WORKDIR /usr/src/front-app

# update and install dependency
RUN apk update && apk upgrade
RUN apk add git
RUN npm install -g @quasar/cli@5.0

# install node dependencies (skip postinstall so quasar prepare runs after full copy)
COPY package.json package-lock.json ./
RUN npm install --ignore-scripts

# copy the app, note .dockerignore
COPY . /usr/src/front-app/

# run postinstall now that project files are present
RUN npm run postinstall

EXPOSE 9093

CMD ["quasar", "dev"]
