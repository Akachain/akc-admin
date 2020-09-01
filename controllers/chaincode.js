'use strict';

const shell = require('shelljs');
const common = require('../utils/common');

const env = common.getEnv();

const packageExternalCC = async (req, res) => {
  const {
    chaincodeName,
    orgname,
  } = req.body;
  const cmd = `${env} ./scripts/package_external_cc.sh "${chaincodeName}" "${orgname}"`;
  const result = await shell.exec(cmd);
  const success = (result.code === 0) ? true : false;
  common.result(res, success, result.stdout);
};
const packageCC = async (req, res) => {
  const {
    chaincodeName,
    chaincodeVersion,
    chaincodePath,
    chaincodeModulePath,
    chaincodeType,
    orgname,
    peerIndex
  } = req.body;
  const cmd = `${env} ./scripts/package_chaincode.sh "${chaincodeName}" "${chaincodeVersion}" "${chaincodePath}" "${chaincodeType}" "${orgname}" "${peerIndex}" "${chaincodeModulePath}"`;
  const result = await shell.exec(cmd);
  const success = (result.code === 0) ? true : false;
  common.result(res, success, result.stdout);
};
const install = async (req, res) => {
  const {
    chaincodeName,
    chaincodePath,
    orgname,
    peerIndex
  } = req.body;
  const cmd = `${env} ./scripts/install_chaincode.sh "${chaincodeName}" "${chaincodePath}" "${peerIndex}" "${orgname}"`;
  const result = await shell.exec(cmd);
  const success = (result.code === 0) ? true : false;
  common.result(res, success, result.stdout);
};
const queryInstalled = async (req, res) => {
  const {
    orgname,
    peerIndex
  } = req.body;
  const cmd = `${env} ./scripts/query_installed.sh "${peerIndex}" "${orgname}"`;
  const result = await shell.exec(cmd);
  const success = (result.code === 0) ? true : false;
  common.result(res, success, result.stdout, [{ packageId: result.stdout.replace('\n', '')}] );
};

const approveForMyOrg = async (req, res) => {
  const {
    orgname,
    peerIndex,
    chaincodeName,
    chaincodeVersion,
    channelName,
    packageId,
    signaturePolicy,
    ordererAddress,
    initRequired
  } = req.body;
  process.env.SIGNATURE_POLICY = signaturePolicy;
  const cmd = `${env} ./scripts/approve_chaincode.sh "${chaincodeVersion}" "${peerIndex}" "${orgname}" "${channelName}" "${packageId}" "${chaincodeName}" "${ordererAddress}" "${initRequired}"`;
  const result = await shell.exec(cmd);
  const success = (result.code === 0) ? true : false;
  common.result(res, success, result.stdout);
};

const commitChaincodeDefinition = async (req, res) => {
  const {
    chaincodeName,
    chaincodeVersion,
    channelName,
    target,
    ordererAddress,
    initRequired
  } = req.body;
  const cmd = `${env} ./scripts/commit_chaincode.sh "${chaincodeVersion}" "${chaincodeName}" "${channelName}" "${ordererAddress}" "${initRequired}" ${target}`;
  const result = await shell.exec(cmd);
  const success = (result.code === 0) ? true : false;
  common.result(res, success, result.stdout);
};

const invokeCLI = async (req, res) => {
  const {
    chaincodeName,
    channelName,
    target,
    ordererAddress,
    isInit
  } = req.body;
  let {
    fcn
  } = req.body;
  if (isInit === '1' && !fcn) {
    fcn = 'initLedger';
  }
  const args = req.body.args || '';
  const cmd = `${env} ./scripts/invoke_chaincode.sh "${isInit}" "${chaincodeName}" "${channelName}" "${ordererAddress}" "${fcn}" "${args}" ${target}`;
  const result = await shell.exec(cmd);
  const success = (result.code === 0) ? true : false;
  common.result(res, success, result.stdout);
};

exports.packageExternalCC = packageExternalCC;
exports.packageCC = packageCC;
exports.install = install;
exports.queryInstalled = queryInstalled;
exports.approveForMyOrg = approveForMyOrg;
exports.commitChaincodeDefinition = commitChaincodeDefinition;
exports.invokeCLI = invokeCLI;