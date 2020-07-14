'use strict';
const express = require('express');

const router = express.Router();
const ca = require('../controllers/ca');

router.route('/registerUser').post(ca.registerUser);
router.route('/enrollAdmin').post(ca.enrollAdmin);
// router.route('/enroll').post(ca.enroll);

module.exports = router;
