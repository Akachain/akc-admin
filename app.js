const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const cors = require('cors');
const hfc = require('fabric-client');
const promClient = require('prom-client');
const logger = require('./utils/logger.js').getLogger('admin-service');
const common = require('./utils/common');
require('./config.js');

const app = express();

const host = process.env.HOST || hfc.getConfigSetting('host');
const port = process.env.PORT || hfc.getConfigSetting('port');

const caService = require('./services/ca-service');
const channelService = require('./services/channel-service');
const chaincodeService = require('./services/chaincode-service');
const peerService = require('./services/peer-service');

app.options('*', cors());
app.use(cors());

// support parsing of application/json type post data
app.use(bodyParser.json());
// support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({
  extended: true,
}));

const server = http.createServer(app).listen(port, () => {
  logger.info('****************** SERVER STARTED ************************');
  logger.info('***************  http://%s:%s  ******************', host, port);
});

server.timeout = 240000;
app.get('/metrics', (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(promClient.register.metrics());
});
app.post('/:functionName', (req, res) => {
  const funcName = req.params.functionName;
  if (req.body.orgname) common.addConnectionProfile(req.body.orgname);
  try {
    switch (funcName) {
      case 'registerUser':
        caService.registerUser(req)
          .then(result => res.send(result))
          .catch((err) => {
            res.status(500).send({
              success: false,
              message: err.message
            });
          });
        break;
      case 'enrollUser':
        caService.enrollUser(req)
          .then(result => res.send(result))
          .catch((err) => {
            res.status(500).send({
              success: false,
              message: err.message
            });
          });
        break;
      case 'channels':
        channelService.channels(req)
          .then(result => res.send(result))
          .catch((err) => {
            res.status(500).send({
              success: false,
              message: err.message
            });
          });
        break;
      case 'joinchannel':
        channelService.joinchannel(req)
          .then(result => res.send(result))
          .catch((err) => {
            res.status(500).send({
              success: false,
              message: err.message
            });
          });
        break;
      case 'getGenesisBlock':
        channelService.getGenesisBlock(req)
          .then(result => res.send(result))
          .catch((err) => {
            res.status(500).send({
              success: false,
              message: err.message
            });
          });
        break;
      case 'packageChaincode':
          chaincodeService.packageChaincode(req, res)
            .then(result => res.send(result))
            .catch((err) => {
              res.status(500).send({
                success: false,
                message: err.message
              });
            });
          break;
      case 'installChaincode':
          chaincodeService.installChaincode(req, res)
            .then(result => res.send(result))
            .catch((err) => {
              res.status(500).send({
                success: false,
                message: err.message
              });
            });
          break;
      case 'approveForMyOrg':
          chaincodeService.approveForMyOrg(req, res)
            .then(result => res.send(result))
            .catch((err) => {
              res.status(500).send({
                success: false,
                message: err.message
              });
            });
          break;
      case 'checkCommitReadiness':
          chaincodeService.checkCommitReadiness(req, res)
            .then(result => res.send(result))
            .catch((err) => {
              res.status(500).send({
                success: false,
                message: err.message
              });
            });
          break;
      case 'commitChaincodeDefinition':
          chaincodeService.commitChaincodeDefinition(req, res)
            .then(result => res.send(result))
            .catch((err) => {
              res.status(500).send({
                success: false,
                message: err.message
              });
            });
          break;
      case 'queryCommitted':
          chaincodeService.queryCommitted(req, res)
            .then(result => res.send(result))
            .catch((err) => {
              res.status(500).send({
                success: false,
                message: err.message
              });
            });
          break;
      case 'invokeChainCode':
        chaincodeService.invokeChainCode(req)
          .then(result => res.send(result))
          .catch((err) => {
            res.status(500).send({
              success: false,
              message: err.message
            });
          });
        break;
      case 'updateAnchorPeer': {
        const {
          channelName,
          configUpdatePath,
          username,
          orgname,
        } = req.body;
        peerService.updateAnchorPeers(channelName, configUpdatePath, username, orgname)
          .then(result => res.send(result))
          .catch((err) => {
            res.status(500).send({
              success: false,
              message: err.message
            });
          });
        break;
      }
      default:
        res.status(500).send('API not found!');
    }
    return;
  } catch (error) {
    res.send({
      success: false,
      message: err.message
    });
  }
});
