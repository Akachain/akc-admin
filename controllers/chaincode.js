'use strict';

const shell = require('shelljs');

const packageCC = async (req, res) => {
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
  return res.json({ success });
};
const install = async (req, res) => {
  const {
    chaincodeName,
    orgname,
    peerIndex
  } = req.body;
  const cmd = `./scripts/install_chaincode.sh "${chaincodeName}" "${peerIndex}" "${orgname}"`;
  const result = await shell.exec(cmd);
  const success = (result.code === 0) ? true : false;
  return res.json({ success });
};
const queryInstalled = async (req, res) => {
  const {
    orgname,
    peerIndex
  } = req.body;
  const cmd = `./scripts/query_installed.sh "${peerIndex}" "${orgname}"`;
  const result = await shell.exec(cmd);
  const success = (result.code === 0) ? true : false;
  return res.json({
    success,
    packageId: result.stdout.replace('\n', '')
  });
};

const approveForMyOrg = async (req, res) => {
  const {
    orgname,
    peerIndex,
    chaincodeName,
    chaincodeVersion,
    channelName,
    packageId,
    signaturePolicy
  } = req.body;
  process.env.SIGNATURE_POLICY = signaturePolicy;
  const cmd = `./scripts/approve_chaincode.sh "${chaincodeVersion}" "${peerIndex}" "${orgname}" "${channelName}" "${packageId}" "${chaincodeName}" "${signaturePolicy}`;
  const result = await shell.exec(cmd);
  const success = (result.code === 0) ? true : false;
  return res.json({ success });
};
const checkCommitReadiness = async (req, res) => {
  // const result = await shell.exec('pwd');
  // console.log(result);
  return res.json({ success: true });
};
const commitChaincodeDefinition = async (req, res) => {
  const {
    chaincodeName,
    chaincodeVersion,
    channelName,
    target,
    ordererAddress
  } = req.body;
  const cmd = `./scripts/commit_chaincode.sh "${chaincodeVersion}" "${chaincodeName}" "${channelName}" "${ordererAddress}" ${target}`;
  const result = await shell.exec(cmd);
  const success = (result.code === 0) ? true : false;
  return res.json({ success });
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
  const cmd = `./scripts/invoke_chaincode.sh "${isInit}" "${chaincodeName}" "${channelName}" "${ordererAddress}" "${fcn}" "${args}" ${target}`;
  const result = await shell.exec(cmd);
  const success = (result.code === 0) ? true : false;
  return res.json({ success });
};

const queryCommitted = async (req, res) => {
  // const result = await shell.exec('pwd');
  return res.json({ success: true });
};

exports = {
  packageCC,
  install,
  queryInstalled,
  approveForMyOrg,
  checkCommitReadiness,
  commitChaincodeDefinition,
  queryCommitted,
  invokeCLI
};