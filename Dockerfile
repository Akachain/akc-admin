FROM koankem0901/fabric-tools:amd64-2.2.0-fabric-sp-mongodb

RUN apk add  --no-cache nodejs npm
RUN node -v
# Telnet
RUN apk add --no-cache busybox-extras

#Create folder /app and working with /app folder
RUN mkdir -p /data/app
# set our node environment, either development or production
# defaults to production, compose overrides this to development on build and run
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# default to port 3000 for node, and 5858 or 9229 for debug
ARG PORT=4001
ENV PORT $PORT
EXPOSE $PORT

# check every 30s to ensure this service returns HTTP 200
#HEALTHCHECK CMD curl -fs http://localhost:$PORT/healthz || exit 1

#Copy packages.json to /app folder && Install npm base on packages.json
WORKDIR /data
RUN npm install -g nodemon
# COPY package.json package-lock.json* ./
# RUN npm install && npm cache clean --force
ENV PATH /data/node_modules/.bin:$PATH

#Copy source code to app
WORKDIR /data/app
RUN mkdir node_modules
# COPY fabric-sdk-node/fabric-client /data/app/node_modules
COPY package.json /data/app
COPY .npmrc /data/app
RUN npm install && npm cache clean --force
RUN apk add curl
COPY . /data/app
#Default on container port is 3000
EXPOSE 4001

#Chaincode seting
RUN mkdir -p /go/src/
ENV GOPATH /go

CMD npm start
# CMD tail -f /dev/null
