const util = require('util');
const path = require('path');
const hfc = require('fabric-client');

let file = 'network-config%s.yaml';

const env = process.env.TARGET_NETWORK;
if (env) { file = util.format(file, `-${env}`); }

file = util.format(file, '');
// indicate to the application where the setup file is located so it able
// to have the hfc load it to initalize the fabric client instance
hfc.setConfigSetting('network-connection-profile-path', path.join(__dirname, 'artifacts', file));
// some other settings the application might need to know
hfc.addConfigFile(path.join(__dirname, 'hfcConfig.json'));
