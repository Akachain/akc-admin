#!/bin/bash

# import utils
. scripts/utils.sh

# checkCommitReadiness
IS_INIT=$1
CHAINCODENAME=$2
CHANNEL_NAME=$3
ORDERER_ADDRESS=$4
FUNCTION_NAME=$5
ARGS=$6
shift
shift
shift
shift
shift
shift
parsePeerConnectionParameters $@
res=$?
verifyResult $res
CCARGS='{"function":"'${FUNCTION_NAME}'","Args":['${ARGS}']}'
if [ "${IS_INIT}" -eq "1" ]; then
  INIT_ARG="--isInit"
else
  INIT_ARG=""
fi

# while 'peer chaincode' command can get the orderer endpoint from the
# peer (if join was successful), let's supply it directly as we know
# it using the "-o" option
if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
  set -x
  peer chaincode invoke -o $ORDERER_ADDRESS -C $CHANNEL_NAME -n $CHAINCODENAME $PEER_CONN_PARMS ${INIT_ARG} -c ${CCARGS} >&log.txt
  res=$?
  set +x
else
  set -x
  peer chaincode invoke -o $ORDERER_ADDRESS --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_NAME -n $CHAINCODENAME $PEER_CONN_PARMS ${INIT_ARG} -c ${CCARGS} >&log.txt
  res=$?
  set +x
fi
cat log.txt
verifyResult $res