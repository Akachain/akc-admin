const path = require('path');
const util = require('util');
const hfc = require('fabric-client');

const fs = require('fs');
const shell = require('shelljs')
const akcSDK = require('@akachain/akc-node-sdk')

const logger = require('../utils/logger.js').getLogger('chaincode-service');
hfc.setLogger(logger);

const setupChaincodeDeploy = () => {
  process.env.GOPATH = path.join(__dirname, hfc.getConfigSetting('CC_SRC_PATH'));
};

const packageChaincode = async (req, res) => {
  const {
    chaincodeName,
    chaincodeVersion,
    chaincodePath,
    chaincodeType,
    orgname,
    peerIndex
  } = req.body;
  const cmd = `./scripts/package_chaincode.sh "${chaincodeName}" "${chaincodeVersion}" "${chaincodePath}" "${chaincodeType}" "${orgname}" "${peerIndex}"`;
  const result = await shell.exec(cmd);
  const success = (result.code === 0) ? true : false;
  return {
    success
  }
} 
const installChaincode = async (req, res) => {
  const result = await shell.exec('pwd');
  console.log(result);
} 
const approveForMyOrg = async (req, res) => {
  const result = await shell.exec('pwd');
  console.log(result);
} 
const checkCommitReadiness = async (req, res) => {
  const result = await shell.exec('pwd');
  console.log(result);
} 
const commitChaincodeDefinition = async (req, res) => {
  const result = await shell.exec('pwd');
  console.log(result);
} 
const queryCommitted = async (req, res) => {
  const result = await shell.exec('pwd');
  console.log(result);
} 

const invokeChainCode = async (req) => {
  const {
    orgname,
    channelName,
    chaincodeId,
    args,
    fcn,
  } = req.body;

  let username = req.body.username || orgname;

  const result = await akcSDK.invoke(undefined, channelName, chaincodeId, fcn, args, orgname, username);
  const success = (result.Result.Status === 200) ? true : false;
  return {
    success,
    message: result.Message
  }
};


exports.packageChaincode = packageChaincode;
exports.installChaincode = installChaincode;
exports.approveForMyOrg = approveForMyOrg;
exports.checkCommitReadiness = checkCommitReadiness;
exports.commitChaincodeDefinition = commitChaincodeDefinition;
exports.queryCommitted = queryCommitted;
exports.invokeChainCode = invokeChainCode;