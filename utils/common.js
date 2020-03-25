const hfc = require('fabric-client');
const logger = require('./logger.js').getLogger('channel-service');
const path = require('path');

const addConnectionProfile = async (orgname) => {
    logger.debug('Add connection profile - %s', orgname)
    hfc.setConfigSetting(`${orgname}-connection-profile-path`, path.join(__dirname, '../artifacts', `${orgname}.yaml`));
    logger.debug('Successfully added connection profile for the organization %s', orgname)
  }

exports.addConnectionProfile = addConnectionProfile;