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
ORDERER_ADDRESS=$7
INIT_REQUIRED_FLAG=$8

setGlobals $PEER $ORG

if [ "$INIT_REQUIRED_FLAG" == "1" ]; then
  INIT_REQUIRED="--init-required"
fi

# if [ "$SIGNATURE_POLICY" != "" ]; then
#   SIGNATURE_POLICY="--signature-policy '$SIGNATURE_POLICY'"
# fi

# Query latest approved chaincode seq
SEQ1=`peer lifecycle chaincode queryapproved -C ${CHANNEL_NAME} -n ${CHAINCODE_NAME} -O json | jq .sequence`
# Query latest commited chaincode seq
SEQ2=`peer lifecycle chaincode querycommitted -C ${CHANNEL_NAME} -n ${CHAINCODE_NAME} -O json | jq .sequence`

if [ "$SEQ1" == "" ] || [ "$SEQ2" == "" ]; then
  SEQ=0
else
  if [ $SEQ1 -gt $SEQ2 ]; then
    echo "latest approved chaincode seq is greater"
    SEQ=$SEQ2
  else
    SEQ=$SEQ1
  fi
fi

if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
  set -x
  peer lifecycle chaincode approveformyorg -o $ORDERER_ADDRESS --channelID $CHANNEL_NAME --name $CHAINCODE_NAME --version ${VERSION} ${INIT_REQUIRED} --package-id ${PACKAGE_ID} --sequence $(expr ${SEQ} + 1) --waitForEvent >&log.txt
  res=$?
  set +x
else
  set -x
  peer lifecycle chaincode approveformyorg -o $ORDERER_ADDRESS --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CHAINCODE_NAME} --version ${VERSION} ${INIT_REQUIRED} --package-id ${PACKAGE_ID} --sequence $(expr ${SEQ} + 1) --waitForEvent >&log.txt
  res=$?
  set +x
fi
sed -n '$p' log.txt
verifyResult $res