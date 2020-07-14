#!/bin/bash

# import utils
. scripts/utils.sh

# create channel
PEER=$1
ORG=$2
CHANNEL_NAME=$3
ORDERER_ADDRESS=$4
CHANNEL_CONFIG=$5

setGlobals $PEER $ORG
if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
  set -x
  peer channel create -o ${ORDERER_ADDRESS} -c $CHANNEL_NAME -f $CHANNEL_CONFIG >&log.txt
  res=$?
  set +x
else
  set -x
  peer channel create -o ${ORDERER_ADDRESS} -c $CHANNEL_NAME -f $CHANNEL_CONFIG --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA >&log.txt
  res=$?
  set +x
fi
cat log.txt
verifyResult $res "Channel creation failed"
echo "===================== Channel '$CHANNEL_NAME' created ===================== "
echo