#!/bin/bash

# import .env
[[ -f .env ]] && source .env

# import utils
. scripts/utils.sh

# checkCommitReadiness
VERSION=$1
PEER=$2
ORG=$3
CHAINCODENAME=$4
shift 3
setGlobals $PEER $ORG
echo "===================== Checking the commit readiness of the chaincode definition on peer${PEER}.org${ORG} on channel '$CHANNEL_NAME'... ===================== "
local rc=1
local starttime=$(date +%s)
# continue to poll
# we either get a successful response, or reach TIMEOUT
while
  test "$(($(date +%s) - starttime))" -lt "$TIMEOUT" -a $rc -ne 0
do
  sleep $DELAY
  echo "Attempting to check the commit readiness of the chaincode definition on peer${PEER}.org${ORG} ...$(($(date +%s) - starttime)) secs"
  set -x
  peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME --name $CHAINCODENAME $PEER_CONN_PARMS --version ${VERSION} --sequence ${VERSION} --output json --init-required >&log.txt
  res=$?
  set +x
  test $res -eq 0 || continue
  let rc=0
  for var in "$@"
  do
      grep "$var" log.txt &>/dev/null || let rc=1
  done
done
echo
cat log.txt
if test $rc -eq 0; then
  echo "===================== Checking the commit readiness of the chaincode definition successful on peer${PEER}.org${ORG} on channel '$CHANNEL_NAME' ===================== "
else
  echo "!!!!!!!!!!!!!!! Check commit readiness result on peer${PEER}.org${ORG} is INVALID !!!!!!!!!!!!!!!!"
  echo "================== ERROR !!! FAILED to execute End-2-End Scenario =================="
  echo
  exit 1
fi