const akcSDK = require('@akachain/akc-node-sdk')

const logger = require('../utils/logger.js').getLogger('ca-service');

async function registerUser(req) {
  let user = {
    orgName: req.body.orgname,
    userName: req.body.username,
    role: req.body.role,
    maxEnrollments: req.body.maxEnrollments,
    attrs: req.body.attrs
  }
  user.userName = user.userName || user.orgName
  try {
    return akcSDK.registerUser(user)
  } catch (err) {
    logger.error(`Failed to register user ${user.userName} for the ${user.orgName}: ${err.stack ? err.stack : err}`);
    throw new Error(`Failed to register user ${user.userName} for the ${user.orgName}: ${err.message}`);
  }
}

async function enrollUser(req) {
  let user = {
    orgName: req.body.orgname,
    userName: req.body.username,
    enrollmentSecret: req.body.password,
  }
  user.userName = user.userName || user.orgName
  user.enrollmentSecret = user.enrollmentSecret || `${user.userName}pw`
  try {
    return akcSDK.enrollUser(user)
  } catch (err) {
    logger.error(`Failed to enroll user ${user.userName} for the ${user.orgName}: ${err.stack ? err.stack : err}`);
    throw new Error(`Failed to enroll user ${user.userName} for the ${user.orgName}: ${err.message}`);
  }
}

exports.registerUser = registerUser;
exports.enrollUser = enrollUser;