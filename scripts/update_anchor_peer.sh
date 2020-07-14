#!/bin/bash

# import utils
. scripts/utils.sh

# approveForMyOrg
PEER=$1
ORG=$2
CHANNEL_NAME=$3
ANCHOR_CONFIG=$4
ORDERER_ADDRESS=$5
setGlobals $PEER $ORG

if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
  set -x
  peer channel update -o $ORDERER_ADDRESS -c $CHANNEL_NAME -f $ANCHOR_CONFIG --tls --cafile $ORDERER_CA >&log.txt
  res=$?
  set +x
else
  set -x
  peer channel update -o $ORDERER_ADDRESS -c $CHANNEL_NAME -f $ANCHOR_CONFIG --tls --cafile $ORDERER_CA >&log.txt
  res=$?
  set +x
fi
cat log.txt
verifyResult $res "Anchor peer update failed"
echo "===================== Anchor peers updated for org '$CORE_PEER_LOCALMSPID' on channel '$CHANNEL_NAME' ===================== "
echo