'use strict';
const express = require('express');

const router = express.Router();
const peer = require('../controllers/peer');

router.route('/updateAnchorPeer').post(peer.updateAnchorPeer);

module.exports = router;
