#!/bin/bash

# import utils
. scripts/utils.sh

# checkCommitReadiness
VERSION=$1
CHAINCODENAME=$2
CHANNEL_NAME=$3
ORDERER_ADDRESS=$4
INIT_REQUIRED_FLAG=$5
if [ "$INIT_REQUIRED_FLAG" == "1" ]; then
  INIT_REQUIRED="--init-required"
fi
shift
shift
shift
shift
shift
parsePeerConnectionParameters $@
res=$?
verifyResult $res
# while 'peer chaincode' command can get the orderer endpoint from the
# peer (if join was successful), let's supply it directly as we know
# it using the "-o" option
if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
  set -x
  peer lifecycle chaincode commit -o $ORDERER_ADDRESS --channelID $CHANNEL_NAME --name $CHAINCODENAME $PEER_CONN_PARMS --version ${VERSION} --sequence ${VERSION} ${INIT_REQUIRED} >&log.txt
  res=$?
  set +x
else
  set -x
  peer lifecycle chaincode commit -o $ORDERER_ADDRESS --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name $CHAINCODENAME $PEER_CONN_PARMS --version ${VERSION} --sequence ${VERSION} ${INIT_REQUIRED} >&log.txt
  res=$?
  set +x
fi
cat log.txt
verifyResult $res