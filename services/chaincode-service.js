const path = require('path');
const util = require('util');
const hfc = require('fabric-client');

const fs = require('fs');
const shell = require('shelljs')
const akcSDK = require('@akachain/akc-node-sdk')

const fabricClient = require('../utils/client.js');
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
  let pTmp = path.resolve(__dirname, '../artifacts/src');
  let metadataPath;
  if (req.body.metadata_path != null) {
    pTmp += `/${req.body.metadata_path}`;
  } else {
    pTmp = `${pTmp}/${chaincodePath}/META-INF/`;
  }
  if (fs.existsSync(pTmp)) {
    metadataPath = pTmp;
    logger.info(`metadataPath: ${metadataPath}`);
  } else {
    logger.error(`metadata_path: ${metadataPath} does not exist`);
  }

  return await akcSDK.installChaincode(orgname, {
    chaincodePath: chaincodePath,
    chaincodeId: chaincodeId,
    metadataPath: metadataPath,
    chaincodeVersion: chaincodeVersion,
    chaincodeType: chaincodeType
  })
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
  return { success }
} 
const installChaincode = async (req, res) => {
  const {
    chaincodeName,
    orgname,
    peerIndex
  } = req.body;
  const cmd = `./scripts/install_chaincode.sh "${chaincodeName}" "${peerIndex}" "${orgname}"`;
  const result = await shell.exec(cmd);
  const success = (result.code === 0) ? true : false;
  return { success }
} 
const queryInstalled = async (req, res) => {
  const {
    orgname,
    peerIndex
  } = req.body;
  const cmd = `./scripts/query_installed.sh "${peerIndex}" "${orgname}"`;
  const result = await shell.exec(cmd);
  const success = (result.code === 0) ? true : false;
  return {
    success,
    packageId: result.stdout.replace('\n', '')
   }
}

const initChainCode = async (req) => {
  const {
    username,
    orgname,
    channelName,
    chaincodeId,
    chaincodeVersion,
    chaincodeType,
    args,
  } = req.body;

  logger.debug(`\n\n============ Instantiate chaincode on channel ${channelName} ============\n`);
  let errorMessage = null;
  try {
    const client = await fabricClient.getClientForOrg(orgname, username);
    logger.debug('Successfully got the fabric client for the organization "%s"', orgname);
    // enable Client TLS
    const tlsInfo = await fabricClient.tlsEnroll(client);
    client.setTlsClientCertAndKey(tlsInfo.certificate, tlsInfo.key);
    const peers = client.getPeersForOrg();
    const channel = client.getChannel(channelName);
    if (!channel) {
      const message = `Channel ${channelName} was not defined in the connection profile`;
      logger.error(message);
      throw new Error(message);
    }
    const txId = client.newTransactionID(true); // Get an admin based transactionID
    // An admin based transactionID will
    // indicate that admin identity should
    // be used to sign the proposal request.
    // will need the transaction ID string for the event registration later
    const deployId = txId.getTransactionID();


    // send proposal to endorser
    const request = {
      targets: peers,
      chaincodeId,
      chaincodeVersion,
      chaincodeType,
      args,
      txId,
    };

    const results = await channel.sendInstantiateProposal(request, 160000);
    // instantiate takes much longer

    // the returned object has both the endorsement results
    // and the actual proposal, the proposal will be needed
    // later when we send a transaction to the orderer
    const proposalResponses = results[0];
    const proposal = results[1];
    logger.debug('>> proposalResponses: ', proposalResponses);

    // lets have a look at the responses to see if they are
    // all good, if good they will also include signatures
    // required to be committed
    let allGood = true;
    const errorProposal = [];
    for (const i in proposalResponses) {
      let oneGood = false;
      if (proposalResponses && proposalResponses[i].response
        && proposalResponses[i].response.status === 200) {
        oneGood = true;
        logger.info('instantiate proposal was good');
      } else {
        logger.error('instantiate proposal was bad');
        errorProposal.push(`proposalResponses [${i}]: ${proposalResponses[i].message}`);
      }
      allGood = allGood & oneGood;
    }
    if (allGood) {
      logger.info('Successfully sent Proposal and received ProposalResponse');
      logger.info(util.format(
        'Status - %s, message - %s, metadata - %s, endorsement signature: %s',
        proposalResponses[0].response.status, proposalResponses[0].response.message,
        proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature,
      ));

      const payload = proposalResponses[0].response.payload;
      //const payloadObj = JSON.parse(payload);
      console.log('----', payload.toString('utf8'));
      

  //     // wait for the channel-based event hub to tell us that the
  //     // instantiate transaction was committed on the peer
  //     const promises = [];
  //     const eventHubs = channel.getChannelEventHubsForOrg();
  //     logger.debug('found %s eventhubs for this organization %s', eventHubs.length, orgname);
  //     eventHubs.forEach((eh) => {
  //       const instantiateEventPromise = new Promise((resolve, reject) => {
  //         logger.debug('instantiateEventPromise - setting up event');
  //         const eventTimeout = setTimeout(() => {
  //           const message = `REQUEST_TIMEOUT: ${eh.getPeerAddr()}`;
  //           logger.error(message);
  //           eh.disconnect();
  //           // reject(new Error(message));
  //         }, 60000);
  //         eh.registerTxEvent(deployId, (tx, code, blockNum) => {
  //           logger.info('The chaincode instantiate transaction has been committed on peer %s', eh.getPeerAddr());
  //           logger.info('Transaction %s has status of %s in blocl %s', tx, code, blockNum);
  //           clearTimeout(eventTimeout);

  //           if (code !== 'VALID') {
  //             const message = util.format('The chaincode instantiate transaction was invalid, code:%s', code);
  //             logger.error(message);
  //             reject(new Error(message));
  //           } else {
  //             const message = 'The chaincode instantiate transaction was valid.';
  //             logger.info(message);
  //             resolve(message);
  //           }
  //         }, (err) => {
  //           clearTimeout(eventTimeout);
  //           logger.error(err);
  //           reject(err);
  //         },
  //         // the default for 'unregister' is true for transaction listeners
  //         // so no real need to set here, however for 'disconnect'
  //         // the default is false as most event hubs are long running
  //         // in this use case we are using it only once
  //         {
  //           unregister: true,
  //           disconnect: false,
  //         });
  //         eh.connect();
  //       });
  //       promises.push(instantiateEventPromise);
  //     });

  //     const ordererRequest = {
  //       txId, // must include the transaction id so that the outbound
  //       // transaction to the orderer will be signed by the admin
  //       // id as was the proposal above, notice that transactionID
  //       // generated above was based on the admin id not the current
  //       // user assigned to the 'client' instance.
  //       proposalResponses,
  //       proposal,
  //     };
  //     const sendPromise = channel.sendTransaction(ordererRequest);
  //     // put the send to the orderer last so that the events get registered and
  //     // are ready for the orderering and committing
  //     promises.push(sendPromise);
  //     const resultPromises = await Promise.all(promises);
  //     logger.debug(util.format('------->>> R E S P O N S E : %j', resultPromises));
  //     const response = resultPromises.pop(); //  orderer results are last in the results
  //     logger.debug('response: ', response);
  //     if (response.status === 'SUCCESS') {
  //       logger.info('Successfully sent transaction to the orderer.');
  //     } else {
  //       errorMessage = util.format('Init - Failed to order the transaction. Error code: %s', response.status);
  //       logger.debug(errorMessage);
  //     }

  //     // now see what each of the event hubs reported
  //     for (const i in resultPromises) {
  //       const eventhubResult = resultPromises[i];
  //       logger.debug('eventhubResult: ', eventhubResult);
  //       const eventHub = eventHubs[i];
  //       logger.debug('Event results for event hub :%s', eventHub.getPeerAddr());
  //       if (typeof eventhubResult === 'string') {
  //         logger.debug(eventhubResult);
  //       } else {
  //         if (!errorMessage) errorMessage = eventhubResult.toString();
  //         logger.debug(eventhubResult.toString());
  //       }
  //     }
    } else {
      errorMessage = `Failed to send Proposal and receive all good ProposalResponse. ${errorProposal}`;
      logger.debug(errorMessage);
    }
  } catch (error) {
    logger.error(`Failed to send instantiate due to error: ${error.stack ? error.stack : error}`);
    errorMessage = error.toString();
  }
  if (!errorMessage) {
    const message = `Successfully instantiate chaincode in organization ${orgname} to the channel ${channelName}`;
    logger.info(message);
    // build a response to send back to the REST caller
    const response = {
      message,
      success: true,
    };
    return response;
  }
  const message = `Failed to instantiate. cause: ${errorMessage}`;
  logger.error(message);
  throw new Error(message);
};


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


exports.chaincodes = chaincodes;
exports.initChainCode = initChainCode;
exports.packageChaincode = packageChaincode;
exports.installChaincode = installChaincode;
exports.queryInstalled = queryInstalled;
exports.approveForMyOrg = approveForMyOrg;
exports.checkCommitReadiness = checkCommitReadiness;
exports.commitChaincodeDefinition = commitChaincodeDefinition;
exports.queryCommitted = queryCommitted;
exports.invokeChainCode = invokeChainCode;