#!/bin/bash

# import utils
. scripts/utils.sh

# packageChaincode
CHAINCODE_NAME=$1
VERSION=$2
CHAINCODE_PATH=$3
CHAINCODE_LANG=$4
ORG_NAME=$5
PEER_INDEX=$6

CURRENT_FOLDER=$PWD
cd $GOPATH/src/$CHAINCODE_PATH
GO111MODULE=on go mod vendor
cd $CURRENT_FOLDER

setGlobals $PEER_INDEX $ORG_NAME
set -x
peer lifecycle chaincode package ${CHAINCODE_NAME}.tar.gz --path ${CHAINCODE_PATH} --lang ${CHAINCODE_LANG} --label ${CHAINCODE_NAME}_${VERSION} >&log.txt
res=$?
set +x
cat log.txt
verifyResult $res "Chaincode packaging on peer${PEER}.${ORG} has failed"
echo "===================== Chaincode is packaged on peer${PEER}.${ORG} ===================== "
echo
