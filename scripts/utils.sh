
# check ENV
if [ "$ORGS" == "" ]; then
  echo "Error: Missing <ORGS>..."
  exit 1
elif [ "$DOMAINS" == "" ]; then
  echo "Error: Missing <DOMAINS>..."
  exit 1
fi

# Get the domain associated with the ORG. ORG is input, DOMAIN is output
function getDomain {
   if [ $# -ne 1 ]; then
      echo "Usage: getDomain <ORG>"
      exit 1
   fi
   orgsarr=($ORGS)
   domainarr=($DOMAINS)

   for i in "${!orgsarr[@]}"; do
      if [[ "${orgsarr[$i]}" = "${1}" ]]; then
           DOMAIN=${domainarr[$i]}
           return
      fi
   done
}

# verify the result of the end-to-end test
verifyResult() {
  if [ $1 -ne 0 ]; then
    exit 1
  fi
}


setGlobals() {
  PEER_INDEX=$1
  ORG=$2

  getDomain $ORG

  CORE_PEER_LOCALMSPID="${ORG}MSP"
  
  if [ "$CRYPTO_TYPE" == "mamba" ]; then
    CORE_PEER_TLS_ROOTCERT_FILE="/shared/crypto-config/${ORG}.${DOMAIN}/peers/peer${PEER_INDEX}-${ORG}.${DOMAIN}/tls/tlsintermediatecerts/tls-ica-${ORG}-${DOMAIN}-7054.pem"
    CORE_PEER_MSPCONFIGPATH="/shared/crypto-config/${ORG}.${DOMAIN}/users/admin/msp"
    CORE_PEER_ADDRESS="peer${PEER_INDEX}-${ORG}.${DOMAIN}:7051"
  else
    CORE_PEER_TLS_ROOTCERT_FILE="/shared/crypto-config/peerOrganizations/${DOMAIN}/peers/peer${PEER_INDEX}.${DOMAIN}/tls/ca.crt"
    CORE_PEER_MSPCONFIGPATH="/shared/crypto-config/peerOrganizations/${DOMAIN}/users/Admin@${DOMAIN}/msp/"
    CORE_PEER_ADDRESS="peer${PEER_INDEX}.${DOMAIN}:7051"
  fi
}

# packageChaincode VERSION PEER ORG
packageChaincode() {
  VERSION=$1
  PEER=$2
  ORG=$3
  setGlobals $PEER $ORG
  set -x
  peer lifecycle chaincode package mycc.tar.gz --path ${CC_SRC_PATH} --lang ${CC_RUNTIME_LANGUAGE} --label mycc_${VERSION} >&log.txt
  res=$?
  set +x
  cat log.txt
  verifyResult $res
}

# parsePeerConnectionParameters $@
# Helper function that takes the parameters from a chaincode operation
# (e.g. invoke, query, instantiate) and checks for an even number of
# peers and associated org, then sets $PEER_CONN_PARMS and $PEERS
parsePeerConnectionParameters() {
  # check for uneven number of peer and org parameters
  if [ $(($# % 2)) -ne 0 ]; then
    exit 1
  fi

  PEER_CONN_PARMS=""
  PEERS=""
  while [ "$#" -gt 0 ]; do
    setGlobals $1 $2
    getDomain $2
    PEER="peer$1.$DOMAIN"
    PEERS="$PEERS $PEER"
    PEER_CONN_PARMS="$PEER_CONN_PARMS --peerAddresses $CORE_PEER_ADDRESS"
    if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "true" ]; then
      PEER_CONN_PARMS="$PEER_CONN_PARMS --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE"
    fi
    # shift by two to get the next pair of peer/org parameters
    shift
    shift
  done
  # remove leading space for output
  PEERS="$(echo -e "$PEERS" | sed -e 's/^[[:space:]]*//')"
}
