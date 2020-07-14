'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const cors = require('cors');
const loggerCommon = require('./utils/logger');
const routeChannel = require('./routes/channel');
const routeChaincode = require('./routes/chaincode');
// const routePeer = require('./routes/peer');
const routeCA = require('./routes/ca');

const logger = loggerCommon.getLogger('admin-service');
const app = express();

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || '4001';

// app.set('view engine', 'ejs');
app.options('*', cors());
app.use(cors());
// support parsing of application/json type post data
app.use(bodyParser.json());
// support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({
  extended: true,
}));

app.use('/api/v2/channels', routeChannel);
app.use('/api/v2/chaincodes', routeChaincode);
// app.use('/api/v2/peers', routePeer);
app.use('/api/v2/cas', routeCA);

const server = http.createServer(app).listen(port, () => {
  logger.info('****************** SERVER STARTED ************************');
  logger.info('***************  http://%s:%s  ******************', host, port);
});

server.timeout = 240000;
