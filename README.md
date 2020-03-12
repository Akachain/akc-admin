
# Akachain Admin Tool

The Akachain Admin Tool provides RESTful API for an administrator to interact with a Hyperledger Fabric network. The list of supported functions are:

### Install chaincode
```
curl -s -X POST http://IP_Address:4001/chaincodes -H "content-type: application/json"   -d '{
  "orgname":"{ORG_NAME}",
  "chaincodeId":"{CHAINCODE_ID}",
  "chaincodePath":"{CHAINCODE_RELATIVE_PATH}",
  "chaincodeVersion":"{UNIQUE_VERSION}",
  "chaincodeType":"golang"
}'

```
### Init chaincode
```
curl -s -X POST http://IP_Address:4001/initchaincodes -H "content-type: application/json" -d '{
  "orgname":"{ORG_NAME}",
  "channelName":"{CHANNEL_NAME}",
  "chaincodeId":"{CHAINCODE_ID}",
  "chaincodeVersion":"{UNIQUE_VERSION}",
  "chaincodeType":"golang",
  "args":[]
}'
```
