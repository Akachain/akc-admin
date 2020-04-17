#!/bin/bash

# import .env
[[ -f .env ]] && source .env

# import utils
. scripts/utils.sh

# checkCommitReadiness
VERSION=$1
CHAINCODENAME=$2
shift
shift
parsePeerConnectionParameters $@
res=$?
verifyResult $res "Invoke transaction failed on channel '$CHANNEL_NAME' due to uneven number of peer and org parameters "
# while 'peer chaincode' command can get the orderer endpoint from the
# peer (if join was successful), let's supply it directly as we know
# it using the "-o" option
if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
  set -x
  peer lifecycle chaincode commit -o $ORDERER_ADDRESS --channelID $CHANNEL_NAME --name $CHAINCODENAME $PEER_CONN_PARMS --version ${VERSION} --sequence ${VERSION} --init-required >&log.txt
  res=$?
  set +x
else
  set -x
  peer lifecycle chaincode commit -o $ORDERER_ADDRESS --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name $CHAINCODENAME $PEER_CONN_PARMS --version ${VERSION} --sequence ${VERSION} --init-required >&log.txt
  res=$?
  set +x
fi
cat log.txt
verifyResult $res "Chaincode definition commit failed on peer${PEER}.org${ORG} on channel '$CHANNEL_NAME' failed"
echo "===================== Chaincode definition committed on channel '$CHANNEL_NAME' ===================== "
echo