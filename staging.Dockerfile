FROM hyperledger/fabric-tools:2.0.0

# # Install fabric binary
# ARG FABRIC_IMAGE_TAG=2.0.0
# WORKDIR /root
# RUN curl -sS https://raw.githubusercontent.com/hyperledger/fabric/master/scripts/bootstrap.sh -o ./bootstrap.sh
# RUN chmod +x bootstrap.sh
# RUN ./bootstrap.sh -sd $FABRIC_IMAGE_TAG
# ENV PATH=$PATH:/root/bin/

# Install nodejs
RUN apk add  --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/v3.7/main/ nodejs=8.9.3-r1

# # Install go
# WORKDIR /root
# RUN apk add --no-cache --upgrade bash
# RUN wget https://dl.google.com/go/go1.13.4.linux-amd64.tar.gz
# RUN tar -xvf go1.13.4.linux-amd64.tar.gz
# # RUN mv go /usr/local
# ENV GOROOT=/root/go
# ENV PATH=$GOPATH/bin:$GOROOT/bin:$PATH

#Create folder /app and working with /app folder
RUN mkdir -p /data/app
# set our node environment, either development or production
# defaults to production, compose overrides this to development on build and run
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# default to port 3000 for node, and 5858 or 9229 for debug
ARG PORT=4001
ENV PORT $PORT
EXPOSE $PORT 5858 9229

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
COPY fabric-sdk-node/fabric-client /data/app/node_modules
COPY package.json /data/app
COPY .npmrc /data/app
RUN npm install && npm cache clean --force
RUN apk add curl
COPY . /data/app
#Default on container port is 3000
EXPOSE 4001

# CMD npm start
CMD tail -f /data/app/package.json
