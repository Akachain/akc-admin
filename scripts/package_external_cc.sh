#!/bin/bash

# import utils
. scripts/utils.sh

CHAINCODE_NAME=$1
ORG_NAME=$2
CHAINCODE_DOMAIN=$3
getDomain $ORG_NAME

CURRENT_FOLDER=$PWD
mkdir -p external-chaincode/${CHAINCODE_NAME}
cd external-chaincode/${CHAINCODE_NAME}

# Generate connection.json
echo "
{
    \"address\": \"${CHAINCODE_NAME}-${ORG_NAME}.${CHAINCODE_DOMAIN}:7052\",
    \"dial_timeout\": \"10s\",
    \"tls_required\": false,
    \"client_auth_required\": false,
    \"client_key\": \"-----BEGIN EC PRIVATE KEY----- ... -----END EC PRIVATE KEY-----\",
    \"client_cert\": \"-----BEGIN CERTIFICATE----- ... -----END CERTIFICATE-----\",
    \"root_cert\": \"-----BEGIN CERTIFICATE---- ... -----END CERTIFICATE-----\"
}
" > connection.json
echo "connection.json: "
cat connection.json

# Generate metadata.json
echo "
{\"path\":\"\",\"type\":\"external\",\"label\":\"${CHAINCODE_NAME}\"}
" > metadata.json
echo "metadata.json: "
cat metadata.json

# Package chaincode
set -x
tar cfz code.tar.gz connection.json
tar cfz ${CHAINCODE_NAME}.tgz code.tar.gz metadata.json
cp ${CHAINCODE_NAME}.tgz $CURRENT_FOLDER/${CHAINCODE_NAME}.tgz
set +x
cd $CURRENT_FOLDER