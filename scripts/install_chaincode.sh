#!/bin/bash

# import utils
. scripts/utils.sh

# install chaincode
CHAINCODE_NAME=$1
CHAINCODE_PATH=$2
shift
shift
while [ "$#" -gt 0 ]; do
    PEER=$1
    ORG=$2
    setGlobals $PEER $ORG
    set -x
    peer lifecycle chaincode install $CHAINCODE_PATH >&log.txt
    res=$?
    set +x
    sed -n '$p' log.txt
    verifyResult $res
    # shift by two to get the next pair of peer/org parameters
    shift
    shift
done