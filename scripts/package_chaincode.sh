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

# Set up proper GOPATH structure based on MODULE_PATH
if [ "${MODULE_PATH}" != "" ]; then
    # When MODULE_PATH is specified, it represents the full module path
    # e.g., MODULE_PATH="vpid" means the module is "vpid" at /go/src/vpid
    # e.g., MODULE_PATH="github.com/org/vpid" means module at /go/src/github.com/org/vpid
    CHAINCODE_TARGET=$GOPATH/src/${MODULE_PATH}
    PARENT_DIR=`dirname ${CHAINCODE_TARGET}`
    mkdir -p ${PARENT_DIR}
else
    # When MODULE_PATH is empty, use the chaincode folder name as module
    CHAINCODE_TARGET=$GOPATH/src/${CHAINCODE_FOLDER}
    mkdir -p $GOPATH/src
fi

# Remove existing chaincode and copy to target
if [ -e "${CHAINCODE_TARGET}" ]; then
    rm -rf "${CHAINCODE_TARGET}"
fi

cp -r $CHAINCODE_PATH $CHAINCODE_TARGET

# Install go module
cd $CHAINCODE_TARGET
go mod tidy
go mod vendor
set +x

# Package chaincode
cd $CURRENT_FOLDER
setGlobals $PEER_INDEX $ORG_NAME
set -x
peer lifecycle chaincode package ${CHAINCODE_NAME}.tar.gz --path ${CHAINCODE_TARGET} --lang ${CHAINCODE_LANG} --label ${CHAINCODE_NAME}_${VERSION} >&log.txt
res=$?
set +x
cat log.txt
verifyResult $res
