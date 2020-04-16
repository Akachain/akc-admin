#!/bin/bash

# import .env
[[ -f .env ]] && source .env

# import utils
. scripts/utils.sh

# queryInstalled
PEER=$1
ORG=$2
setGlobals $PEER $ORG
set -x
peer lifecycle chaincode queryinstalled >&log.txt
res=$?
set +x
cat log.txt
PACKAGE_ID=`sed -n '/Package/{s/^Package ID: //; s/, Label:.*$//; p;}' log.txt`
verifyResult $res "Query installed on peer${PEER}.org${ORG} has failed"
echo PackageID is ${PACKAGE_ID}
echo "===================== Query installed successful on peer${PEER}.org${ORG} on channel ===================== "
echo