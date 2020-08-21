'use strict';
const express = require('express');

const router = express.Router();
const channel = require('../controllers/channel');

router.route('/create').post(channel.create);
router.route('/join').post(channel.join);
// router.route('/getGenesisBlock').post(channel.getGenesisBlock);
// router.route('/getBlock').post(channel.getBlock);

module.exports = router;
