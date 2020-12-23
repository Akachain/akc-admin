#!/bin/bash

# import utils
. scripts/utils.sh

# queryInstalled
PEER=$1
ORG=$2
CHAINCODE_NAME=$3
CHAINCODE_VERSION=$4
setGlobals $PEER $ORG
# set -x
peer lifecycle chaincode queryinstalled >&log.txt
res=$?
# set +x
# cat log.txt
PACKAGE_ID=`sed -n "/${CHAINCODE_NAME}_${CHAINCODE_VERSION}/{s/^Package ID: //; s/, Label:.*$//; p;}" log.txt`
verifyResult $res
echo ${PACKAGE_ID}