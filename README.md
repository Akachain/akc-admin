
# Akachain Admin Tool

The Akachain Admin Tool provides RESTful API for an administrator to interact with a Hyperledger Fabric network. The list of supported functions are:

### Enroll Admin
```
curl --location --request POST 'http://localhost:4001/api/v2/cas/enrollAdmin' \
--header 'Content-Type: application/json' \
--data-raw '{
	"adminName": 	"admin",
  "adminPassword": 	"adminpw",
  "orgName": "Org1"
}'

```
### Register User
```
curl --location --request POST 'http://localhost:4001/api/v2/cas/registerUser' \
--header 'Content-Type: application/json' \
--data-raw '{
	"orgName": 	"Org1",
  "affiliation": "Org1.affiliation1",
  "userName": "appUser",
  "adminName": "admin",
  "role": "client"
}'
```
### Create Channel
```
curl --location --request POST 'http://localhost:4001/api/v2/channels/create' \
--header 'Content-Type: application/json' \
--data-raw '{
  "orgName": "Org1",
	"peerIndex": "0",
	"channelName": "mychannel",
	"ordererAddress": "orderer.example.com:7050",
	"channelConfig": "/shared/channel-artifacts/mychannel.tx"
}'
```
### Join Channel
```
curl --location --request POST 'http://localhost:4001/api/v2/channels/join' \
--header 'Content-Type: application/json' \
--data-raw '{
  "orgName": "Org1",
	"peerIndex": "0",
	"channelName": "mychannel"
}'
```
### Update anchor peer
```
curl --location --request POST 'http://localhost:4001/api/v2/peers/updateAnchorPeer' \
--header 'Content-Type: application/json' \
--data-raw '{
  "orgName": "Org1",
	"peerIndex": "0",
	"channelName": "mychannel",
	"ordererAddress": "orderer.example.com:7050",
	"anchorConfigPath": "/shared/channel-artifacts/Org1MSPanchors.tx"
}'
```
### Package Chaincode
```
curl --location --request POST http://localhost:4001/api/v2/chaincodes/packageCC \
--header 'content-type: application/json' \
--data-raw '{
    "orgname":"Org1",
    "chaincodePath":"github.com/hyperledger/fabric-samples/chaincode/abstore/go",
    "chaincodeName":"abstore",
    "chaincodeVersion":"1",
    "chaincodeType":"golang",
    "peerIndex": "0"
}'
```
### Install Chaincode
```
curl --location --request POST http://localhost:4001/api/v2/chaincodes/install \
--header 'content-type: application/json' \
--data-raw '{
    "orgname":"Org1",
    "chaincodeName":"abstore",
    "peerIndex": "0"
}'
```
### Query Installed Chaincode
```
curl --location --request POST http://localhost:4001/api/v2/chaincodes/queryInstalled \
--header 'content-type: application/json' \
--data-raw '{
    "orgname":"Org1",
    "peerIndex": "0"
}'
```
### Approve Chaincode For My Org
```
curl --location --request POST http://localhost:4001/api/v2/chaincodes/approveForMyOrg \
--header 'content-type: application/json' \
--data-raw '{
    "orgname":"Org1",
    "peerIndex": "0",
    "chaincodeName": "abstore",
    "chaincodeVersion": 1,
    "channelName": "mychannel",
    "packageId": "abstore_1:6b792d529cbd21b2e0dc5f91404154235bf2cddcb073c59e21780ef419a6c23e",
		"ordererAddress": "orderer.example.com:7050"
}'
```
### Commit Chaincode Definition
```
curl --location --request POST http://localhost:4001/api/v2/chaincodes/commitChaincodeDefinition \
--header 'content-type: application/json' \
--data-raw '{
    "chaincodeName": "abstore",
    "chaincodeVersion": 1,
    "channelName": "mychannel",
    "target": "0 Org1",
    "ordererAddress": "orderer.example.com:7050"
}'
```
### Invoke by CLI
```
curl --location --request POST http://localhost:4001/api/v2/chaincodes/invokeCLI \
--header 'content-type: application/json' \
--data-raw '{
    "chaincodeName": "abstore",
    "channelName": "mychannel",
    "target": "0 Org1 0 Org2",
    "ordererAddress": "orderer.example.com:7050",
    "isInit": "1"
}'

curl --location --request POST http://localhost:4001/api/v2/chaincodes/invokeCLI \
--header 'content-type: application/json' \
--data-raw '{
    "chaincodeName": "abstore",
    "channelName": "mychannel",
    "target": "0 Org1 0 Org2",
    "ordererAddress": "orderer.example.com:7050",
    "isInit": "0"
}'
```

