'use strict';

const shell = require('shelljs');
const common = require('../utils/common');

const env = common.getEnv();

const updateAnchorPeer = async (req, res) => {
  const {
    orgName,
    peerIndex,
    channelName,
    ordererAddress,
    anchorConfigPath
  } = req.body;
  const cmd = `${env} ./scripts/update_anchor_peer.sh "${peerIndex}" "${orgName}" "${channelName}" "${anchorConfigPath}" "${ordererAddress}"`;
  const result = await shell.exec(cmd);
  const success = (result.code === 0) ? true : false;
  common.result(res, success);
};

exports.updateAnchorPeer = updateAnchorPeer;
