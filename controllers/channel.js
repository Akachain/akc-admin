'use strict';
const shell = require('shelljs');
const common = require('../utils/common');

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
  common.result(res, success);
}

async function join(req, res) {
  const {
    orgName,
    peerIndex,
    channelName
  } = req.body;
  const cmd = `${env} ./scripts/join_channel.sh "${peerIndex}" "${orgName}" "${channelName}"`;
  const result = await shell.exec(cmd);
  const success = (result.code === 0) ? true : false;
  common.result(res, success);
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

// const getBlock = async (req, res) => {
//   const {
//     orgname,
//     username,
//     channelName,
//     blockNumber,
//     txId
//   } = req.body;
//   const client = await akcSDK.getClientForOrg(orgname, username, true);
//   logger.debug('Successfully got the fabric client for the organization "%s"', orgname);
//   const channel = client.getChannel(channelName);
//   if (!channel) {
//     const message = util.format('Channel %s was not defined in the connection profile', channelName);
//     logger.error(message);
//     throw new Error(message);
//   }
//   const targets = client.getPeersForOrg()[0];
//   if ( blockNumber && blockNumber !== '' ) {
//     logger.debug(util.format('Get block number %s', blockNumber));
//     const result = await channel.queryBlock(Number(blockNumber), targets);
//     logger.debug('query response: ', JSON.stringify(result));
//     return {
//       success: true,
//       data: result,
//     };
//   } else if ( txId && txId !== '' ) {
//     logger.debug(util.format('Get block transaction %s', txId));
//     // send proposal to endorser
//     const result = await channel.queryBlockByTxID(txId, targets);
//     logger.debug('query response: ', JSON.stringify(result));
//     return {
//       success: true,
//       data: result,
//     };
//   } else {
//     return {
//       success: false,
//       msg: 'Missing blockNumber or txId in req.body'
//     }
//   }
// }


exports.create = create;
exports.join = join;
// exports.getGenesisBlock = getGenesisBlock;
// exports.getBlock = getBlock;
