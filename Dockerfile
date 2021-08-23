
FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

COPY yarn.lock ./

RUN yarn

COPY . .

# build
RUN yarn build

# COPY view and public folders to dist
COPY ./src/views ./dist/views
COPY ./src/public ./dist/public

# create .env file in dist and echo into it
RUN touch ./dist/.env && echo "NODE_ENV=production" >> ./dist/.env

RUN ls ./dist

EXPOSE 5010

CMD ["yarn", "start"]
