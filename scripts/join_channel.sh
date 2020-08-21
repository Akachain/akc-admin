#!/bin/bash

# import utils
. scripts/utils.sh

# join channel
PEER=$1
ORG=$2
CHANNEL_NAME=$3

setGlobals $PEER $ORG

set -x
peer channel join -b $CHANNEL_NAME.block >&log.txt
res=$?
set +x
cat log.txt
verifyResult $res
