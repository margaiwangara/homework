
FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

COPY yarn.lock ./

RUN yarn

COPY . .

# build
RUN yarn build

# RUN postbuild
RUN bash ./postbuild.sh

RUN ls ./dist

EXPOSE 5010

CMD ["yarn", "start"]
