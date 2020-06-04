#!/bin/bash

# import utils
. scripts/utils.sh

# checkCommitReadiness
IS_INIT=$1
CHAINCODENAME=$2
CHANNEL_NAME=$3
ORDERER_ADDRESS=$4
shift
shift
shift
shift
parsePeerConnectionParameters $@
res=$?
verifyResult $res "Invoke transaction failed on channel '$CHANNEL_NAME' due to uneven number of peer and org parameters "
if [ "${IS_INIT}" -eq "1" ]; then
  CCARGS='{"Args":["Init","a","100","b","100"]}'
  INIT_ARG="--isInit"
else
  CCARGS='{"Args":["invoke","a","b","10"]}'
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
verifyResult $res "Invoke execution on $PEERS failed "
echo "===================== Invoke transaction successful on $PEERS on channel '$CHANNEL_NAME' ===================== "
echo