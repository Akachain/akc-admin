FROM node:8.15
#FROM node:10

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
COPY package.json /data/app
RUN npm install && npm cache clean --force
COPY . /data/app
#Default on container port is 3000
EXPOSE 4001

CMD npm start
