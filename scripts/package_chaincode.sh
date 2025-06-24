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
MODULE_PATH=$7

if [ "${MODULE_PATH}" == "undefined" ]; then
    MODULE_PATH=""
fi

# Check folder chaincode
if [ ! -d "$CHAINCODE_PATH" ]; then
    echo "Directory ${CHAINCODE_PATH} DOES NOT exists."
    exit 1
fi

set -x
CURRENT_FOLDER=$PWD
CHAINCODE_FOLDER=`basename ${CHAINCODE_PATH}`
CHAINCODE_IN_GOPATH=$GOPATH/src/$MODULE_PATH/

# Make Chaincode Module path
mkdir -p $CHAINCODE_IN_GOPATH
# Copy chaincode to GOPATH
cp -r $CHAINCODE_PATH $CHAINCODE_IN_GOPATH
# Install go module
cd $CHAINCODE_IN_GOPATH/$CHAINCODE_FOLDER
go mod tidy
go mod vendor

# Get chaincode path in GOPATH
CHAINCODE_PATH_IN_GOPATH=${CHAINCODE_FOLDER}
if [ "${MODULE_PATH}" != "" ]; then
    CHAINCODE_PATH_IN_GOPATH=${MODULE_PATH}/${CHAINCODE_FOLDER}
fi
set +x

# Package chaincode
cd $CURRENT_FOLDER
setGlobals $PEER_INDEX $ORG_NAME
set -x
peer lifecycle chaincode package ${CHAINCODE_NAME}.tar.gz --path ${CHAINCODE_IN_GOPATH}/${CHAINCODE_FOLDER} --lang ${CHAINCODE_LANG} --label ${CHAINCODE_NAME}_${VERSION} >&log.txt
res=$?
set +x
cat log.txt
verifyResult $res
