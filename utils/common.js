'use strict';

// const hfc = require('fabric-client');
// const logger = require('./logger.js').getLogger('channel-service');
// const path = require('path');

// const addConnectionProfile = async (orgname) => {
//   logger.debug('Add connection profile - %s', orgname)
//   hfc.setConfigSetting(`${orgname}-connection-profile-path`, path.join(__dirname, '../artifacts', `${orgname}.yaml`));
//   logger.debug('Successfully added connection profile for the organization %s', orgname)
// };

const getEnv = () => {
  return `ORGS="${process.env.ORGS}" DOMAINS="${process.env.DOMAINS}"`;
};

const result = (res, status, msg = '', data = []) => {
  return res.json({
    success: status,
    msg,
    data
  });
};

const succeeded = (res, msg = '', data = []) => {
  result(res, true, msg, data);
};

const failed = (res, msg = '', data = []) => {
  result(res, false, msg, data);
};


// exports.addConnectionProfile = addConnectionProfile;
exports.getEnv = getEnv;
exports.succeeded = succeeded;
exports.failed = failed;
exports.result = result;
