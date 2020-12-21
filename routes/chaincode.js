'use strict';
const express = require('express');

const router = express.Router();
const chaincode = require('../controllers/chaincode');

router.route('/packageExternalCC').post(chaincode.packageExternalCC);
router.route('/packageCC').post(chaincode.packageCC);
router.route('/install').post(chaincode.install);
router.route('/queryInstalled').post(chaincode.queryInstalled);
router.route('/approveForMyOrg').post(chaincode.approveForMyOrg);
router.route('/commitChaincodeDefinition').post(chaincode.commitChaincodeDefinition);
router.route('/invokeCLI').post(chaincode.invokeCLI);
router.route('/invoke').post(chaincode.invoke);
router.route('/query').post(chaincode.query);

module.exports = router;
