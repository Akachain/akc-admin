# Akachain Admin Tool

The Akachain Admin Tool provides RESTful API for an administrator to interact with a Hyperledger Fabric network. The list of supported functions are:

# Release

| Akachain Admin Version                                                            | Fabric Version Supported                                                 | NodeJS Version Supported                                      |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------- |
| <b>[v2.2.1](https://github.com/Akachain/akc-admin/tree/2.2.1)</b> (Dec 24, 2020)  | [v2.0 to v2.2](https://hyperledger-fabric.readthedocs.io/en/release-2.2) | [^12.13.1, ^14.13.1](https://nodejs.org/en/download/releases) |
| <b>[v1.6.0](https://github.com/Akachain/akc-admin/tree/v1.6.0)</b> (Apr 15, 2021) | [v1.2 to v1.4](https://hyperledger-fabric.readthedocs.io/en/release-1.4) | [^12.13.1, ^14.13.1](https://nodejs.org/en/download/releases) |

---

Following are the software dependencies required.

# Quick start (using Docker)
## Prerequisites

- Docker
- Docker Compose

## Start Hyperledger Fabric network

In this guide, we assume that you've already started test network by following [Hyperledger Fabric official tutorial](https://hyperledger-fabric.readthedocs.io/en/latest/test_network.html).

## Configure

- Copy the following files from repository

  - [docker-compose.yaml](https://raw.githubusercontent.com/Akachain/akc-admin/master/docker-compose.yaml)
  - [examples/artifacts/network-config.yaml](https://raw.githubusercontent.com/Akachain/akc-admin/master/example/artifacts/network-config.yaml)

  ```
  $ wget https://raw.githubusercontent.com/Akachain/akc-admin/master/example/artifacts/network-config.yaml
  $ wget https://raw.githubusercontent.com/Akachain/akc-admin/master/docker-compose.yaml
  ```

- Copy entire crypto artifact directory (e.g. crypto-config/, organizations/, channel-artifacts/) from your fabric network

- Now you should have the following files and directory structure.

  ```
  docker-compose.yaml
  example/artifacts/network-config.yaml
  example/organizations/
  example/chaincode/
  ```

- Edit network name and path to volumes to be mounted on akc-admin container (docker-compose.yaml) to align with your environment.

  ```yaml
      networks:
        test:
          external:
              name: fabric_test
      ...

      services:
        admin:
          ...

          volumes:
            - ./example/organizations:/shared/crypto-config
            - ./example/channel-artifacts:/shared/channel-artifacts
            - ./example/artifacts/:/data/app/artifacts/
            - ./example/chaincode:/chaincodes
            - ./example/wallet:/data/app/wallet
  ```

## Start container services
- Run the following to start up akc-admin services after starting your fabric network:

  ```shell
  $ docker-compose up -d
  ```

## Clean up
- To stop services, run the following:

  ```shell
  $ docker-compose down
  ```

## APIs
### Enroll Admin 
- Org1:
  ```
  curl --location --request POST 'http://localhost:4001/api/v2/cas/enrollAdmin' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "adminName":   "admin",
    "adminPassword":   "adminpw",
    "orgName": "org1",
    "caHost": "ca_org1"
  }'
  ```
- Org2:
  ```
  curl --location --request POST 'http://localhost:4001/api/v2/cas/enrollAdmin' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "adminName":   "admin",
    "adminPassword":   "adminpw",
    "orgName": "org2",
    "caHost": "ca_org2"
  }'
  ```
### Register User
- Org1:
  ```
  curl --location --request POST 'http://localhost:4001/api/v2/cas/registerUser' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "orgName": "Org1",
    "userName": "appUser",
    "adminName": "admin",
    "role": "client",
    "caHost": "ca_org1"
  }'
  ```

### Create Channel
- You need generating channel genesis block first
- Create channel:
```
curl --location --request POST 'http://localhost:4001/api/v2/channels/create' \
--header 'Content-Type: application/json' \
--data-raw '{
  "orgName": "org1",
  "peerIndex": "0",
  "channelName": "mychannel",
  "ordererAddress": "orderer.example.com:7050",
  "channelConfig": "./example/channel-artifacts/mychannel.tx"
}'
```

### Join Channel

```
curl --location --request POST 'http://localhost:4001/api/v2/channels/join' \
--header 'Content-Type: application/json' \
--data-raw '{
  "orgName": "Org1",
  "peerIndex": "0",
  "channelName": "mychannel",
  "ordererAddress": "orderer.example.com:7050"
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
  "orgName":"Org1",
  "chaincodePath":"/chaincodes/fabcar",
  "chaincodeName":"fabcar",
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
  "chaincodeName":"fabcar",
  "chaincodePath":"fabcar.tar.gz",
  "target": "0 Org1"
}'
```

### Query Installed Chaincode

```
curl --location --request POST http://localhost:4001/api/v2/chaincodes/queryInstalled \
--header 'content-type: application/json' \
--data-raw '{
  "orgName":"Org1",
  "peerIndex": "0",
  "chaincodeName": "fabcar",
  "chaincodeVersion": "1"
}'
```

### Approve Chaincode For My Org

```
curl --location --request POST http://localhost:4001/api/v2/chaincodes/approveForMyOrg \
--header 'content-type: application/json' \
--data-raw '{
  "orgName":"Org1",
  "peerIndex": "0",
  "chaincodeName": "fabcar",
  "chaincodeVersion": 1,
  "channelName": "mychannel",
  "packageId": "fabcar_1:6b792d529cbd21b2e0dc5f91404154235bf2cddcb073c59e21780ef419a6c23e",
  "ordererAddress": "orderer.example.com:7050"
}'
```

### Commit Chaincode Definition

```
curl --location --request POST http://localhost:4001/api/v2/chaincodes/commitChaincodeDefinition \
--header 'content-type: application/json' \
--data-raw '{
  "chaincodeName": "fabcar",
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
  "chaincodeName": "fabcar",
  "channelName": "mychannel",
  "target": "0 Org1 0 Org2",
  "ordererAddress": "orderer.example.com:7050",
  "isInit": "1"
}'

curl --location --request POST http://localhost:4001/api/v2/chaincodes/invokeCLI \
--header 'content-type: application/json' \
--data-raw '{
  "chaincodeName": "fabcar",
  "channelName": "mychannel",
  "target": "0 Org1 0 Org2",
  "ordererAddress": "orderer.example.com:7050",
  "isInit": "0"
}'
```

### Invoke and Query by Fabric-network (SDK)

```
curl --location --request POST http://localhost:4001/api/v2/chaincodes/invoke \
--header 'content-type: application/json' \
--data-raw '{
  "chaincodeName": "fabcar",
  "channelName": "mychannel",
  "userName": "appUser",
  "fcn": "createCar",
  "args": ["CAR0", "a", "b", "c", "d"]
}'

curl --location --request POST http://localhost:4001/api/v2/chaincodes/query \
--header 'content-type: application/json' \
--data-raw '{
  "chaincodeName": "fabcar",
  "channelName": "mychannel",
  "userName": "appUser",
  "args": []
}'
```

### Query Block

```
curl --location --request POST http://localhost:4001/api/v2/channels/getBlock \
--header 'content-type: application/json' \
--data-raw '{
  "channelName": "mychannel",
  "userName": "appUser",
  "blockNum": "12060"
}'
```
