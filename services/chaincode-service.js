const path = require('path');
const util = require('util');
const hfc = require('fabric-client');
const fs = require('fs');
const akcSDK = require('@akachain/akc-node-sdk')

const logger = require('../utils/logger.js').getLogger('chaincode-service');
hfc.setLogger(logger);

const setupChaincodeDeploy = () => {
  process.env.GOPATH = path.join(__dirname, hfc.getConfigSetting('CC_SRC_PATH'));
};

const chaincodes = async function chaincodes(req, res) {
  setupChaincodeDeploy();
  const {
    orgname,
    chaincodeId,
    chaincodePath,
    chaincodeVersion,
    chaincodeType,
  } = req.body;
  let pTmp = path.resolve(__dirname, '../artifacts/src/chaincodes/');
  let metadataPath;
  if (req.body.metadata_path != null) {
    pTmp += req.body.metadata_path;
  } else {
    pTmp = `${pTmp}/${chaincodeId}/META-INF/`;
  }
  if (fs.existsSync(pTmp)) {
    metadataPath = pTmp;
  }

  return await akcSDK.installChaincode(orgname, {
    chaincodePath: chaincodePath,
    chaincodeId: chaincodeId,
    metadataPath: metadataPath,
    chaincodeVersion: chaincodeVersion,
    chaincodeType: chaincodeType
  })
};

const initChainCode = async (req) => {
  const {
    orgname,
    channelName,
    chaincodeId,
    chaincodeVersion,
    chaincodeType,
    args,
  } = req.body;

  return await akcSDK.initChaincode(orgname, channelName, {
    chaincodeId: chaincodeId,
    chaincodeVersion: chaincodeVersion,
    chaincodeType: chaincodeType,
    args: args
  })
};

const invokeChainCode = async (req) => {
  const {
    username,
    orgname,
    channelName,
    chaincodeId,
    args,
    fcn,
  } = req.body;

  let client = akcSDK.getClientForOrg(orgname);
  let tlsInfo = await akcSDK.tlsEnroll(client);
  client.setTlsClientCertAndKey(tlsInfo.certificate, tlsInfo.key);
  const peers = client.getPeersForOrg();

  return await akcSDK.invoke(peers, channelName, chaincodeId, fcn, args, orgname, username);
};


async function upgradeChainCode(req) {
  const {
    username,
    orgname,
    channelName,
    chaincodeId,
    chaincodeVersion,
    chaincodeType,
    args,
  } = req.body;

  return await akcSDK.upgradeChaincode(orgname, channelName, {
    chaincodeId: chaincodeId,
    chaincodeVersion: chaincodeVersion,
    chaincodeType: chaincodeType,
    args: args
  })
}

exports.chaincodes = chaincodes;
exports.initChainCode = initChainCode;
exports.upgradeChainCode = upgradeChainCode;
exports.invokeChainCode = invokeChainCode;