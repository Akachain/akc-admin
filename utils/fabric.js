const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { Gateway, Wallets } = require('fabric-network');

const getNetwork = async (userName, channelName) => {
  // Create a new file system based wallet for managing identities.
  const walletPath = path.join(__dirname, '../wallet');
  const wallet = await Wallets.newFileSystemWallet(walletPath);

  // Check to see if we've already enrolled the user.
  const identity = await wallet.get(userName);
  if (!identity) {
    const err = `An identity for the user "${userName}" does not exist in the wallet! Please enroll this user!`;
    throw new Error(err);
  }

  const connectionProfile = yaml.safeLoad(fs.readFileSync('./artifacts/network-config.yaml', 'utf8'));
  const gateway = new Gateway();
  await gateway.connect(connectionProfile, { wallet, identity: userName, discovery: { enabled: false, asLocalhost: false } });

  // Get the network (channel) our contract is deployed to.
  const network = await gateway.getNetwork(channelName);
  return {network, gateway};

}

exports.getNetwork = getNetwork;