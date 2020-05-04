const util = require('util');
const fs = require('fs');
const path = require('path');
const akcSDK = require('@akachain/akc-node-sdk')

const logger = require('../utils/logger.js').getLogger('update-anchor-peers');

const updateAnchorPeers = async (channelName, configUpdatePath, username, orgname) => {
  logger.debug(`====== Updating Anchor Peers on ${channelName} ======`);
  let errorMessage = null;
  try {
    // first setup the client for this org
    const client = await akcSDK.getClientForOrg(orgname, username, true);
    logger.debug('Successfully got the fabric client for the organization "%s"', orgname);
    const channel = client.getChannel(channelName);
    if (!channel) {
      const message = util.format('Channel %s was not defined in the connection profile', channelName);
      logger.error(message);
      throw new Error(message);
    }

    // read in the envelope for the channel config raw bytes
    const envelope = fs.readFileSync(path.join(__dirname, configUpdatePath));
    // extract the channel config bytes from the envelope to be signed
    const channelConfig = client.extractChannelConfig(envelope);

    // Acting as a client in the given organization provided with "orgname" param
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

    const promises = [];
    const eventhubs = channel.getChannelEventHubsForOrg();
    logger.debug('found %s eventhubs for this organization %s', eventhubs.length, orgname);
    eventhubs.forEach((eh) => {
      const anchorUpdateEventPromise = new Promise((resolve, reject) => {
        logger.debug('anchorUpdateEventPromise - setting up event');
        const eventTimeout = setTimeout(() => {
          const message = `REQUEST_TIMEOUT:${eh.getPeerAddr()}`;
          logger.error(message);
          eh.disconnect();
        }, 60000);
        eh.registerBlockEvent(() => {
          logger.info('The config update has been committed on peer %s', eh.getPeerAddr());
          clearTimeout(eventTimeout);
          resolve();
        }, (err) => {
          clearTimeout(eventTimeout);
          logger.error(err);
          reject(err);
        },
        // the default for 'unregister' is true for block listeners
        // so no real need to set here, however for 'disconnect'
        // the default is false as most event hubs are long running
        // in this use case we are using it only once
        {
          unregister: true,
          disconnect: true,
        });
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
        logger.info('Successfully update anchor peers to the channel %s', channelName);
      } else {
        errorMessage = util.format('Failed to update anchor peers to the channel %s with status: %s reason: %s', channelName, response.status, response.info);
        logger.error(errorMessage);
      }
    } else {
      errorMessage = util.format('Failed to update anchor peers to the channel %s', channelName);
      logger.error(errorMessage);
    }
  } catch (error) {
    logger.error(`Failed to update anchor peers due to error: ${error}`);
    errorMessage = error.toString();
  }

  if (!errorMessage) {
    const message = util.format(
      'Successfully update anchor peers in organization %s to the channel \'%s\'',
      orgname, channelName,
    );
    logger.info(message);
    const response = {
      success: true,
      message,
    };
    return response;
  }
  const message = util.format('Failed to update anchor peers. cause:%s', errorMessage);
  logger.error(message);
  const response = {
    success: false,
    message,
  };
  return response;
};

exports.updateAnchorPeers = updateAnchorPeers;
