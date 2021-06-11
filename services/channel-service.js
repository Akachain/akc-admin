const path = require('path');
const util = require('util');
const fs = require('fs');
const akcSDK = require('@akachain/akc-node-sdk')

const logger = require('../utils/logger.js').getLogger('channel-service');

const getSignatures = async (listSignOrg, channelConfig) => {
  const signatures = [];
  listSignOrg.forEach(async (orgname) => {
    const client = await akcSDK.getClientForOrg(orgname, orgname, true);
    const signature = client.signChannelConfig(channelConfig);
    signatures.push(signature);
  });
  return signatures;
}

async function updateChannelConfig(req) {
  const {
    channelName,
    configUpdatePath,
    orgname,
  } = req.body;

  let username = req.body.username || orgname;
  let listSignOrg = req.body.listSignOrg || [orgname];

  let error_message = null;
  try {
    
    // first setup the client for this org
    const client = await akcSDK.getClientForOrg(orgname, username, true);
    logger.debug('Successfully got the fabric client for the organization "%s"', orgname);

    const channel = client.getChannel(channelName);
    if(!channel) {
			let message = util.format('Channel %s was not defined in the connection profile', channelName);
			logger.error(message);
			throw new Error(message);
		}

    // read in the envelope for the channel config raw bytes
    const envelope = fs.readFileSync(path.join(__dirname, configUpdatePath));
    // extract the channel config bytes from the envelope to be signed
    const channelConfig = client.extractChannelConfig(envelope);

    // Acting as a client in the given organization provided with "orgName" param
    // sign the channel config bytes as "endorsement", this is required by
    // the orderer's channel creation policy
    // this will use the admin identity assigned to the client
    // when the connection profile was loaded
    const signatures = await getSignatures(listSignOrg, channelConfig);

    const request = {
      config: channelConfig,
      signatures,
      name: channelName,
      txId: client.newTransactionID(true), // get an admin based transactionID
    };

    const promises = [];
		const event_hubs = channel.getChannelEventHubsForOrg();
		logger.debug('found %s eventhubs for this organization %s',event_hubs.length, orgname);
		event_hubs.forEach((eh) => {
			const anchorUpdateEventPromise = new Promise((resolve, reject) => {
				logger.debug('anchorUpdateEventPromise - setting up event');
				const event_timeout = setTimeout(() => {
					let message = 'REQUEST_TIMEOUT:' + eh.getPeerAddr();
					logger.error(message);
					eh.disconnect();
				}, 60000);
				eh.registerBlockEvent((block) => {
					logger.info('The config update has been committed on peer %s',eh.getPeerAddr());
					clearTimeout(event_timeout);
					resolve();
				}, (err) => {
					clearTimeout(event_timeout);
					logger.error(err);
					reject(err);
				},
					// the default for 'unregister' is true for block listeners
					// so no real need to set here, however for 'disconnect'
					// the default is false as most event hubs are long running
					// in this use case we are using it only once
					{unregister: true, disconnect: true}
				);
				eh.connect();
			});
			promises.push(anchorUpdateEventPromise);
		});

    const sendPromise = client.updateChannel(request);
		// put the send to the orderer last so that the events get registered and
		// are ready for the orderering and committing
		promises.push(sendPromise);
		const results = await Promise.all(promises);
		logger.debug(util.format('------->>> R E S P O N S E : %j', results));
		const response = results.pop(); //  orderer results are last in the results

		if (response) {
			if (response.status === 'SUCCESS') {
				logger.info('Successfully update config channel %s', channelName);
			} else {
				error_message = util.format('Failed to update the config channel %s with status: %s reason: %s', channelName, response.status, response.info);
				logger.error(error_message);
			}
		} else {
			error_message = util.format('Failed to update the config channel %s', channelName);
			logger.error(error_message);
		}

  } catch (err) {
    logger.error('Failed to update the config channel due to error: ' + err.stack ? err.stack :	err);
		error_message = err.toString();
  }

  if (!error_message) {
		let message = util.format(
			'Successfully update the config channel \'%s\'',
			channelName);
		logger.info(message);
		const response = {
			success: true,
			message: message
		};
		return response;
	} else {
		let message = util.format('Failed to update the config channel. cause:%s',error_message);
		logger.error(message);
		const response = {
			success: false,
			message: message
		};
		return response;
	}
}

async function channels(req) {
  const {
    channelName,
    channelConfigPath,
    orgname,
  } = req.body;

  let username = req.body.username || orgname;

  try {
    // first setup the client for this org
    const client = await akcSDK.getClientForOrg(orgname, username, true);
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
    channelName
  } = req.body;
  let username = req.body.username || orgname;
  let errorMessage = null;
  const allEventhubs = [];
  try {
    const client = await akcSDK.getClientForOrg(orgname, username, true);
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
    const client = await akcSDK.getClientForOrg(orgname, username, true);
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

const getBlock = async (req) => {
  const {
    orgname,
    username,
    channelName,
    blockNumber,
    txId
  } = req.body;
  const client = await akcSDK.getClientForOrg(orgname, username, true);
  logger.debug('Successfully got the fabric client for the organization "%s"', orgname);
  const channel = client.getChannel(channelName);
  if (!channel) {
    const message = util.format('Channel %s was not defined in the connection profile', channelName);
    logger.error(message);
    throw new Error(message);
  }
  const targets = client.getPeersForOrg()[0];
  if ( blockNumber && blockNumber !== '' ) {
    logger.debug(util.format('Get block number %s', blockNumber));
    const result = await channel.queryBlock(Number(blockNumber), targets);
    logger.debug('query response: ', JSON.stringify(result));
    return {
      success: true,
      data: result,
    };
  } else if ( txId && txId !== '' ) {
    logger.debug(util.format('Get block transaction %s', txId));
    // send proposal to endorser
    const result = await channel.queryBlockByTxID(txId, targets);
    logger.debug('query response: ', JSON.stringify(result));
    return {
      success: true,
      data: result,
    };
  } else {
    return {
      success: false,
      msg: 'Missing blockNumber or txId in req.body'
    }
  }
};

exports.updateChannelConfig = updateChannelConfig;
exports.channels = channels;
exports.getBlock = getBlock;
exports.joinchannel = joinchannel;
exports.getGenesisBlock = getGenesisBlock;
