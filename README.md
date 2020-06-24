
# Akachain Admin Tool

The Akachain Admin Tool provides RESTful API for an administrator to interact with a Hyperledger Fabric network. The list of supported functions are:

### Register User
```
curl -s -X POST http://IP_Address:4001/registerUser -H "content-type: application/json"   -d '{
  "orgname":"{ORG_NAME}",
  "username":"{USER_NAME}",
  "role":"{ROLE}",
  "maxEnrollments":"{MAX_ENROLLMENTS}",
  "affiliation":"{AFFILIATION}",
  "attrs":"{ATTRS}"
}'

```

### Enroll User
```
curl -s -X POST http://IP_Address:4001/enrollUser -H "content-type: application/json"   -d '{
  "orgname":"{ORG_NAME}",
  "username":"{USER_NAME}",
  "password":"{ENROLLMENT_SECRET}"
}'

```
### Create Channel
```
curl -s -X POST http://IP_Address:4001/channels -H "content-type: application/json"   -d '{
  "channelName":"{CHANNEL_NAME}",
  "channelConfigPath":"{CHANEL_CONFIG_PATH}",
  "orgname":"{ORG_NAME}"
}'

```
### Join Channel
```
curl -s -X POST http://IP_Address:4001/joinchannel -H "content-type: application/json"   -d '{
  "orgname":"{ORG_NAME}",
  "channelName":"{CHANNEL_NAME}"
}'

```
### Get Genesis Block
```
curl -s -X POST http://IP_Address:4001/getGenesisBlock -H "content-type: application/json"   -d '{
  "orgname":"{ORG_NAME}",
  "channelName":"{CHANNEL_NAME}"
}'

```

### Install Chaincode
```
curl -s -X POST http://IP_Address:4001/chaincodes -H "content-type: application/json"   -d '{
  "orgname":"{ORG_NAME}",
  "chaincodeId":"{CHAINCODE_ID}",
  "chaincodePath":"{CHAINCODE_RELATIVE_PATH}",
  "chaincodeVersion":"{UNIQUE_VERSION}",
  "chaincodeType":"golang"
}'

```
### Init Chaincode
```
curl -s -X POST http://IP_Address:4001/initchaincodes -H "content-type: application/json" -d '{
  "orgname":"{ORG_NAME}",
  "channelName":"{CHANNEL_NAME}",
  "chaincodeId":"{CHAINCODE_ID}",
  "chaincodeVersion":"{UNIQUE_VERSION}",
  "chaincodeType":"golang",
  "args": {ARRAY_ARGUMENT},
  "endorsementPolicy": {ENDORSEMENT_POLICY}
}'
```

### Upgrade Chaincode
```
curl -s -X POST http://IP_Address:4001/upgradeChainCode -H "content-type: application/json" -d '{
  "orgname":"{ORG_NAME}",
  "channelName":"{CHANNEL_NAME}",
  "chaincodeId":"{CHAINCODE_ID}",
  "chaincodeVersion":"{UNIQUE_VERSION}",
  "chaincodeType":"golang",
  "args": {ARRAY_ARGUMENT},
  "endorsementPolicy": {ENDORSEMENT_POLICY}
}'
```

### Update Anchor Peer
```
curl -s -X POST http://IP_Address:4001/updateAnchorPeer -H "content-type: application/json" -d '{
  "orgname":"{ORG_NAME}",
  "username":"{USER_NAME}",
  "channelName":"{CHANNEL_NAME}",
  "configUpdatePath":"{CONFIG_UPDATE_PATH}"
}'
```

### Invoke Chaincode
```
curl -s -X POST http://IP_Address:4001/invokeChainCode -H "content-type: application/json" -d '{
  "orgname":"{ORG_NAME}",
  "channelName":"{CHANNEL_NAME}",
  "chaincodeId":"{CHAINCODE_ID}",
  "fcn":"{FUNCTION_NAME}",
  "args": {ARRAY_ARGUMENT}
}'
```

### Query Block By Block Number Or Transaction ID
```
curl -s -X POST http://IP_Address:4001/getBlock -H "content-type: application/json" -d '{
  "orgname":"{ORG_NAME}",
  "username":"{USER_NAME}",
  "channelName":"{CHANNEL_NAME}",
  "blockNumber":"{BLOCK_NUMBER}",
  "txId": {TRANSACTION_ID}
}'
```