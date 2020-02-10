const path = require('path');
const util = require('util');
const fs = require('fs');
const akcSDK = require('@akachain/akc-node-sdk')

const logger = require('../utils/logger.js').getLogger('channel-service');

async function channels(req) {
  const {
    channelName,
    channelConfigPath,
    orgname,
  } = req.body;

  try {
    // first setup the client for this org
    const client = await akcSDK.getClientForOrg(orgname);
    logger.debug('Successfully got the fabric client for the organization "%s"', orgname);

    // enable Client TLS
    const tlsInfo = await akcSDK.tlsEnroll(client);
    client.setTlsClientCertAndKey(tlsInfo.certificate, tlsInfo.key);

    // read in the envelope for the channel config raw bytes
    const envelope = fs.readFileSync(path.join(__dirname, channelConfigPath));
    // extract the channel config bytes from the envelope to be signed
    const channelConfig = client.extractChannelConfig(envelope);

    // Acting as a client in the given organization provided with "orgName" param
    // sign the channel config bytes as "endorsement", this is required by
    // the orderer's channel creation policy
    // this will use the admin identity assigned to the client
    // when the connection profile was loaded
    const signature = client.signChannelConfig(channelConfig);

    const request = {
      config: channelConfig,
      signatures: [signature],
      name: channelName,
      txId: client.newTransactionID(true), // get an admin based transactionID
    };
    const response = await client.createChannel(request);
    if (response && response.status === 'SUCCESS') {
      logger.debug('Successfully created the channel.');
      const resp = {
        success: true,
        message: `Channel ${channelName} created Successfully`,
      };
      return resp;
    }
    const msg = `\n!!!!!!!!! Failed to create the channel ${channelName}!!!!!!!!!\n\n`;
    logger.error(msg);
    throw new Error(`Failed to create the channel ${channelName} ${JSON.stringify(response)}`);
  } catch (err) {
    const msg = `Failed to initialize the channel: ${err.stack ? err.stack : err}`;
    logger.error(msg);
    throw new Error(`Failed to initialize the channel: ${err.message}`);
  }
}

async function joinchannel(req) {
  logger.debug('\n\n============ Join Channel start ============\n');

  const {
    orgname,
    channelName,
  } = req.body;
  const username = orgname;
  let errorMessage = null;
  const allEventhubs = [];
  try {
    const client = await akcSDK.getClientForOrg(orgname, username);
    logger.debug('Successfully got the fabric client for the organization "%s"', orgname);

    // enable Client TLS
    const tlsInfo = await akcSDK.tlsEnroll(client);
    client.setTlsClientCertAndKey(tlsInfo.certificate, tlsInfo.key);

    const peers = req.body.peers ? req.body.peers : client.getPeersForOrg();
    logger.debug('=======> Peers: ', JSON.stringify(peers));

    // next step is to get the genesisBlock from the orderer,
    // the starting point for the channel that we want to join
    const channel = client.getChannel(channelName);
    if (!channel) {
      const message = util.format('Channel %s was not defined in the connection profile', channelName);
      logger.error(message);
      throw new Error(message);
    }
    const request = {
      txId: client.newTransactionID(true), // get an admin based transactionID
    };
    const genesisBlock = await channel.getGenesisBlock(request);

    // tell each peer to join and wait 10 secs
    // for the channel to be joined each peer
    const promises = [];
    promises.push(new Promise(resolve => setTimeout(resolve, 3000)));

    const joinRequest = {
      targets: peers,
      // using the peer names which only is allowed when a connection profile is loaded
      txId: client.newTransactionID(true), // get an admin based transactionID
      block: genesisBlock,
    };
    const joinPromise = channel.joinChannel(joinRequest);
    promises.push(joinPromise);
    const results = await Promise.all(promises);
    logger.debug(util.format('Join Channel R E S P O N S E : %j', results));

    // lets check the results of sending to the peers which is
    // last in the results array
    const peersResults = results.pop();
    // then each peer results
    for (const i in peersResults) {
      const peerResult = peersResults[i];
      if (peerResult instanceof Error) {
        errorMessage = util.format('Failed to join peer to the channel with error :: %s', peerResult.toString());
        logger.error(errorMessage);
      } else if (peerResult.response && peerResult.response.status === 200) {
        logger.info('Successfully joined peer to the channel %s', channelName);
      } else {
        errorMessage = util.format('Failed to join peer to the channel %s', channelName);
        logger.error(errorMessage);
      }
    }
  } catch (error) {
    logger.error(`Failed to join channel due to error: ${error.stack ? error.stack : error}`);
    errorMessage = error.toString();
  }

  // need to shutdown open event streams
  allEventhubs.forEach((eh) => {
    eh.disconnect();
  });

  if (!errorMessage) {
    const message = util.format(
      'Successfully joined peers in organization %s to the channel: %s',
      orgname, channelName,
    );
    logger.info(message);
    // build a response to send back to the REST caller
    const response = {
      message,
      success: true,
    };
    return response;
  }
  const message = util.format('Failed to join all peers to channel. cause:%s', errorMessage);
  logger.error(message);
  throw new Error(message);
}

// eslint-disable-next-line consistent-return
const getGenesisBlock = async (req) => {
  logger.debug('\n\n============ Get Genesis Block start ============\n');
  const {
    orgname,
    channelName,
  } = req.body;
  const username = orgname;
  try {
    const client = await akcSDK.getClientForOrg(orgname, username);
    logger.debug('Successfully got the fabric client for the organization "%s"', orgname);

    // enable Client TLS
    const tlsInfo = await akcSDK.tlsEnroll(client);
    client.setTlsClientCertAndKey(tlsInfo.certificate, tlsInfo.key);


    // next step is to get the genesis_block from the orderer,
    // the starting point for the channel that we want to join
    const channel = client.getChannel(channelName);
    if (!channel) {
      const message = util.format('Channel %s was not defined in the connection profile', channelName);
      logger.error(message);
      throw new Error(message);
    }
    const request = {
      txId: client.newTransactionID(true), // get an admin based transactionID
    };
    const genesisBlock = await channel.getGenesisBlock(request);

    logger.info('result: ', genesisBlock);
    if (genesisBlock) {
      return {
        success: true,
        message: '',
      };
    }
    return {
      success: false,
      message: '',
    };
  } catch (error) {
    logger.error(`Failed to join channel due to error: ${error}`);
    // error_message = error.toString();
  }
};

exports.channels = channels;
exports.joinchannel = joinchannel;
exports.getGenesisBlock = getGenesisBlock;
