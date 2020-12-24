#!/bin/bash

# import utils
. scripts/utils.sh

# join channel
PEER=$1
ORG=$2
CHANNEL_NAME=$3
ORDERER_ADDRESS=$4

setGlobals $PEER $ORG

set -x
# Fetching channel config block from orderer...
peer channel fetch 0 $CHANNEL_NAME.block -o $ORDERER_ADDRESS -c $CHANNEL_NAME --tls --cafile $ORDERER_CA >&log.txt
res=$?
set +x
cat log.txt
verifyResult $res "Fetching config block from orderer has Failed"


peer channel join -b $CHANNEL_NAME.block >&log.txt
res=$?
set +x
sed -n '$p' log.txt
verifyResult $res
