
###### Install chaincode
```

curl -s -X POST   http://3.112.39.228:4001/chaincodes   -H "content-type: application/json"   -d '{
  "orgname":"utop",
  "chaincodeId":"utop_cc",
  "chaincodePath":"chaincodes/utop_cc/",
  "chaincodeVersion":"v1.401",
  "chaincodeType":"golang"
}'

curl -s -X POST \
  http://13.230.35.104:4001/chaincodes   -H "content-type: application/json"   -d '{
  "orgname":"frt",
  "chaincodeId":"utop_cc",
  "chaincodePath":"chaincodes/utop_cc",
  "chaincodeVersion":"v1.401",
  "chaincodeType":"golang"
}'

curl -s -X POST   http://13.228.30.184:4001/chaincodes   -H "content-type: application/json"   -d '{
  "orgname":"aia",
  "chaincodeId":"aia_cc",
  "chaincodePath":"chaincodes/aia_cc",
  "chaincodeVersion":"v1.0",
  "chaincodeType":"golang"
}'

curl -s -X POST \
  http://13.229.132.250:4001/chaincodes   -H "content-type: application/json"   -d '{
  "orgname":"utop",
  "chaincodeId":"utop_cc",
  "chaincodePath":"chaincodes/utop_cc",
  "chaincodeVersion":"v1.0",
  "chaincodeType":"golang"
}'

curl -s -X POST \
  http://13.229.180.175:4001/chaincodes \
  -H "content-type: application/json" \
  -d '{
  "orgname":"frt",
  "chaincodeId":"utop_cc",
  "chaincodePath":"chaincodes/utop_cc",
  "chaincodeVersion":"v1.0",
  "chaincodeType":"golang"
}'

```
###### Init chaincode
```
curl -s -X POST   http://3.112.39.228:4001/initchaincodes   -H "content-type: application/json"   -d '{
  "orgname":"utop",
  "channelName":"utopchannel",
  "chaincodeId":"utop_cc",
  "chaincodeVersion":"v1.401",
  "chaincodeType":"golang",
  "args":[]
}'

curl -s -X POST \
  http://13.229.109.23:4001/initchaincodes \
  -H "content-type: application/json" \
  -d '{
  "orgname":"akc",
  "channelName":"aiachannel",
  "chaincodeId":"aia_cc",
  "chaincodeVersion":"v1.0",
  "chaincodeType":"golang"
}'

```