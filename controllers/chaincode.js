'use strict';

const path = require('path');
const fs = require('fs');
const shell = require('shelljs');
const yaml = require('js-yaml');
const { Gateway, Wallets } = require('fabric-network');
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

const invoke = async (req, res) => {
  const {
    userName,
    chaincodeName,
    channelName,
    fcn,
    args
  } = req.body;


  // Create a new file system based wallet for managing identities.
  const walletPath = path.join(__dirname, '../wallet');
  const wallet = await Wallets.newFileSystemWallet(walletPath);

  // Check to see if we've already enrolled the user.
  const identity = await wallet.get(userName);
  if (!identity) {
      console.log(`An identity for the user "${userName}" does not exist in the wallet`);
      console.log('Run the registerUser.js application before retrying');
      return;
  }

  const connectionProfile = yaml.safeLoad(fs.readFileSync('./artifacts/network-config.yaml', 'utf8'));
  const gateway = new Gateway();
  await gateway.connect(connectionProfile, { wallet, identity: userName, discovery: { enabled: false, asLocalhost: false } });

  // Get the network (channel) our contract is deployed to.
  const network = await gateway.getNetwork(channelName);

  // Get the contract from the network.
  const contract = network.getContract(chaincodeName);

  try {
    const results = await contract.submitTransaction(fcn, ...args);
    common.result(res, true, results.toString('utf-8')); 
  } catch (e) {
    console.log(e)
    common.result(res, false, e.message);
  } finally{
    // Disconnect from the gateway.
    await gateway.disconnect();
  }
};

const query = async (req, res) => {
  const {
    userName,
    chaincodeName,
    channelName,
    fcn,
    args
  } = req.body;

  // Create a new file system based wallet for managing identities.
  const walletPath = path.join(__dirname, '../wallet');
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  console.log(`Wallet path: ${walletPath}`);

  // Check to see if we've already enrolled the user.
  const identity = await wallet.get(userName);
  if (!identity) {
      console.log(`An identity for the user "${userName}" does not exist in the wallet`);
      console.log('Run the registerUser.js application before retrying');
      return;
  }

  const connectionProfile = yaml.safeLoad(fs.readFileSync('./artifacts/network-config.yaml', 'utf8'));
  const gateway = new Gateway();
  await gateway.connect(connectionProfile, { wallet, identity: userName, discovery: { enabled: false, asLocalhost: false } });

  // Get the network (channel) our contract is deployed to.
  const network = await gateway.getNetwork(channelName);

  // Get the contract from the network.
  const contract = network.getContract(chaincodeName);

  const results = await contract.evaluateTransaction(fcn, ...args);
  // Disconnect from the gateway.
  await gateway.disconnect();

  common.result(res, true, results.toString());
};

exports.packageExternalCC = packageExternalCC;
exports.packageCC = packageCC;
exports.install = install;
exports.queryInstalled = queryInstalled;
exports.approveForMyOrg = approveForMyOrg;
exports.commitChaincodeDefinition = commitChaincodeDefinition;
exports.invokeCLI = invokeCLI;
exports.invoke = invoke;
exports.query = query;