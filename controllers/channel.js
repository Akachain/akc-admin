'use strict';
const shell = require('shelljs');
const { BlockDecoder } = require('fabric-common');
const common = require('../utils/common');
const utils = require('../utils');
const path = require('path');

const env = common.getEnv();

async function create(req, res) {
  const {
    orgName,
    peerIndex,
    channelName,
    ordererAddress,
    channelConfig
  } = req.body;
  const cmd = `${env} ./scripts/create_channel.sh "${peerIndex}" "${orgName}" "${channelName}" "${ordererAddress}" "${channelConfig}"`;
  const result = await shell.exec(cmd);
  const success = (result.code === 0) ? true : false;
  common.result(res, success, result.stdout);
}

async function join(req, res) {
  const {
    orgName,
    peerIndex,
    channelName,
    ordererAddress
  } = req.body;
  const cmd = `${env} ./scripts/join_channel.sh "${peerIndex}" "${orgName}" "${channelName}" "${ordererAddress}"`;
  const result = await shell.exec(cmd);
  const success = (result.code === 0) ? true : false;
  common.result(res, success, result.stdout);
}

// // eslint-disable-next-line consistent-return
// const getGenesisBlock = async (req, res) => {
//   logger.debug('\n\n============ Get Genesis Block start ============\n');
//   const {
//     orgname,
//     channelName,
//   } = req.body;
//   const username = orgname;
//   try {
//     const client = await akcSDK.getClientForOrg(orgname, username, true);
//     logger.debug('Successfully got the fabric client for the organization "%s"', orgname);

//     // next step is to get the genesis_block from the orderer,
//     // the starting point for the channel that we want to join
//     const channel = client.getChannel(channelName);
//     if (!channel) {
//       const message = util.format('Channel %s was not defined in the connection profile', channelName);
//       logger.error(message);
//       throw new Error(message);
//     }
//     const request = {
//       txId: client.newTransactionID(true), // get an admin based transactionID
//     };
//     const genesisBlock = await channel.getGenesisBlock(request);

//     logger.info('result: ', genesisBlock);
//     if (genesisBlock) {
//       return {
//         success: true,
//         message: '',
//       };
//     }
//     return {
//       success: false,
//       message: '',
//     };
//   } catch (error) {
//     logger.error(`Failed to join channel due to error: ${error}`);
//     // error_message = error.toString();
//   }
// };

const getBlock = async (req, res) => {
  const {
    userName,
    channelName,
    fcn,
    blockNum
  } = req.body;

  try {
    const querySystemChaincode = 'qscc';
    const queryFunction = fcn ? fcn : 'GetBlockByNumber';

    const {network, gateway} = await utils.fabric.getNetwork(userName, channelName);

    // Get the contract from the network.
    const contract = network.getContract(querySystemChaincode);
    const resultByte = await contract.evaluateTransaction(queryFunction, channelName, String(blockNum));
    await gateway.disconnect();
    common.result(res, true, BlockDecoder.decode(resultByte)); 
  } catch (e) {
    console.log(e)
    common.result(res, false, e.message);
  }
}


exports.create = create;
exports.join = join;
// exports.getGenesisBlock = getGenesisBlock;
exports.getBlock = getBlock;
