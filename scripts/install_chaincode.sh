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
    cat log.txt
    verifyResult $res "Chaincode installation on peer${PEER}.org${ORG} has failed"
    echo "===================== Chaincode is installed on peer${PEER}.org${ORG} ===================== "
    echo
    # shift by two to get the next pair of peer/org parameters
    shift
    shift
done