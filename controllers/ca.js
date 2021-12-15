'use strict';

const {
  Wallets
} = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const logger = require('../utils/logger.js').getLogger('ca-service');
const common = require('../utils/common');

const type = 'X.509';

async function registerUser(req, res) {
  // TODO: Verify INPUT
  const orgName = req.body.orgName;
  const orgDomain = req.body.orgDomain || req.body.orgName;
  const caAdminUser = req.body.adminName || `ica-${orgName}-admin`;
  const caHost = req.body.caHost || `ica-${orgName}.${orgDomain}`;
  let user = {
    userName: req.body.userName,
    role: req.body.role,
    // maxEnrollments: req.body.maxEnrollments,
    affiliation: req.body.affiliation,
    attrs: req.body.attrs
  };
  user.userName = user.userName || orgName;
  user.affiliation = user.affiliation || 'org1.department1';
  user.role = user.role || 'client';

  
  const orgMSP = `${orgName}MSP`;

  let msg;
  try {
    const connectionProfile = yaml.safeLoad(fs.readFileSync('./artifacts/network-config.yaml', 'utf8'));

    // Create a new CA client for interacting with the CA.
    const caURL = connectionProfile.certificateAuthorities[caHost].url;
    const ca = new FabricCAServices(caURL);

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    logger.debug(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const userIdentity = await wallet.get(user.userName);
    if (userIdentity) {
      msg = `An identity for the user ${user.userName} already exists in the wallet`;
      logger.debug(msg);
      common.succeeded(res, msg);
      return;
    }

    // Check to see if we've already enrolled the admin user.
    const adminIdentity = await wallet.get(caAdminUser);
    if (!adminIdentity) {
      msg = `An identity for the admin user "${caAdminUser}" does not exist in the wallet`;
      logger.error(msg);
      logger.error('Run the enrollAdmin.js application before retrying');
      common.failed(res, msg);
      return;
    }

    // build a user object for authenticating with the CA
    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, caAdminUser);

    // Register the user, enroll the user, and import the new identity into the wallet.
    const secret = await ca.register({
      enrollmentID: user.userName,
      enrollmentSecret: user.enrollmentSecret || `${user.userName}pw`,
      role: user.role,
      affiliation: user.affiliation,
      maxEnrollments: user.maxEnrollments || 1,
      attrs: user.attrs
    }, adminUser);
    const enrollment = await ca.enroll({
      enrollmentID: user.userName,
      enrollmentSecret: secret
    });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: orgMSP,
      type,
    };
    await wallet.put(user.userName, x509Identity);
    msg = `Successfully registered and enrolled admin user "${user.userName}" and imported it into the wallet`;
    logger.debug(msg);
    common.succeeded(res, msg);
    return;
  } catch (err) {
    logger.error(`Failed to register user ${user.userName} for the ${orgName}: ${err.stack ? err.stack : err}`);
    msg = err.toString();
    common.failed(res, msg);
    return;
  }
}

async function enrollAdmin(req, res) {
  const orgName = req.body.orgName;
  const orgDomain = req.body.orgDomain || req.body.orgName;
  const caAdminUser = req.body.adminName || `ica-${orgName}-admin`;
  const caAdminPassword = req.body.adminPassword  || `ica-${orgName}-adminpw`;
  // TODO: Check input

  const caHost = req.body.caHost  || `ica-${orgName}.${orgDomain}`;
  const orgMSP = `${orgName}MSP`;

  let msg;
  try {
    // load the network configuration
    const connectionProfile = yaml.safeLoad(fs.readFileSync('./artifacts/network-config.yaml', 'utf8'));

    // Create a new CA client for interacting with the CA.
    const caInfo = connectionProfile.certificateAuthorities[caHost];
    const caTLSCACerts = caInfo.tlsCACerts.pem;
    const ca = new FabricCAServices(caInfo.url, {
      trustedRoots: caTLSCACerts,
      verify: false
    }, caInfo.caName);

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    logger.debug(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the admin user.
    const identity = await wallet.get(caAdminUser);
    if (identity) {
      msg = `An identity for the admin user ${caAdminUser} already exists in the wallet`;
      logger.debug(msg);
      common.succeeded(res, msg);
      return;
    }

    // Enroll the admin user, and import the new identity into the wallet.
    const enrollment = await ca.enroll({
      enrollmentID: caAdminUser,
      enrollmentSecret: caAdminPassword
    });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: orgMSP,
      type: type,
    };
    await wallet.put(caAdminUser, x509Identity);
    msg = `Successfully enrolled admin user ${caAdminUser} and imported it into the wallet`;
    logger.debug(msg);
    common.succeeded(res, msg);
    return;

  } catch (error) {
    msg = `Failed to enroll admin user ${caAdminUser}: ${error}`;
    console.error(msg);
    common.failed(res, msg);
    return;
  }
}

exports.registerUser = registerUser;
exports.enrollAdmin = enrollAdmin;