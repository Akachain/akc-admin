#!/bin/bash

# import .env
[[ -f .env ]] && source .env

# import utils
. scripts/utils.sh

# queryCommitted
VERSION=$1
PEER=$2
ORG=$3
CHAINCODENAME=$4
setGlobals $PEER $ORG
EXPECTED_RESULT="Version: ${VERSION}, Sequence: ${VERSION}, Endorsement Plugin: escc, Validation Plugin: vscc"
echo "===================== Querying chaincode definition on peer${PEER}.org${ORG} on channel '$CHANNEL_NAME'... ===================== "
local rc=1
local starttime=$(date +%s)
# continue to poll
# we either get a successful response, or reach TIMEOUT
while
  test "$(($(date +%s) - starttime))" -lt "$TIMEOUT" -a $rc -ne 0
do
  sleep $DELAY
  echo "Attempting to Query committed status on peer${PEER}.org${ORG} ...$(($(date +%s) - starttime)) secs"
  set -x
  peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME --name $CHAINCODENAME >&log.txt
  res=$?
  set +x
  test $res -eq 0 && VALUE=$(cat log.txt | grep -o '^Version: [0-9], Sequence: [0-9], Endorsement Plugin: escc, Validation Plugin: vscc')
  test "$VALUE" = "$EXPECTED_RESULT" && let rc=0
done
echo
cat log.txt
if test $rc -eq 0; then
  echo "===================== Query chaincode definition successful on peer${PEER}.org${ORG} on channel '$CHANNEL_NAME' ===================== "
else
  echo "!!!!!!!!!!!!!!! Query chaincode definition result on peer${PEER}.org${ORG} is INVALID !!!!!!!!!!!!!!!!"
  echo "================== ERROR !!! FAILED to execute End-2-End Scenario =================="
  echo
  exit 1
fi