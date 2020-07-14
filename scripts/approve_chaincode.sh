#!/bin/bash

# import utils
. scripts/utils.sh

# approveForMyOrg
VERSION=$1
PEER=$2
ORG=$3
CHANNEL_NAME=$4
PACKAGE_ID=$5
CHAINCODE_NAME=$6
SIGNATURE_POLICY=$7
setGlobals $PEER $ORG

if [ "$SIGNATURE_POLICY" != "" ]; then
  SIGNATURE_POLICY="--signature-policy '$SIGNATURE_POLICY'"
fi
if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
  set -x
  peer lifecycle chaincode approveformyorg --channelID $CHANNEL_NAME $SIGNATURE_POLICY --name $CHAINCODE_NAME --version ${VERSION} --init-required --package-id ${PACKAGE_ID} --sequence ${VERSION} --waitForEvent >&log.txt
  res=$?
  set +x
else
  set -x
  peer lifecycle chaincode approveformyorg --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA --channelID $CHANNEL_NAME $SIGNATURE_POLICY --name ${CHAINCODE_NAME} --version ${VERSION} --init-required --package-id ${PACKAGE_ID} --sequence ${VERSION} --waitForEvent >&log.txt
  res=$?
  set +x
fi
cat log.txt
verifyResult $res "Chaincode definition approved on peer${PEER}.org${ORG} on channel '$CHANNEL_NAME' failed"
echo "===================== Chaincode definition approved on peer${PEER}.org${ORG} on channel '$CHANNEL_NAME' ===================== "
echo