
###### Init Network - Use CURL command

###### AKC
```

curl -s -X POST   http://3.112.39.228:4001/channels   -H "content-type: application/json"   -d '{
  "orgname":"utop",
  "channelName":"utopchannel",
  "channelConfigPath":"../artifacts/channel-artifacts/utopchannel.tx"
}'

curl -s -X POST   http://13.229.109.23:4001/channels   -H "content-type: application/json"   -d '{
  "orgname":"akc",
  "channelName":"aiachannel",
  "channelConfigPath":"../artifacts/channel-artifacts/aiachannel.tx"
}'

curl -s -X POST   http://13.229.109.23:4001/channels   -H "content-type: application/json"   -d '{
  "orgname":"akc",
  "channelName":"akcchannel",
  "channelConfigPath":"../artifacts/channel-artifacts/akcchannel.tx"
}'

curl -s -X POST   http://13.229.109.23:4001/registerUser   -H "content-type: application/json"   -d '{
  "orgname":"akc"
}'

curl -s -X POST   http://13.229.109.23:4001/joinchannel   -H "content-type: application/json"   -d '{
  "orgname":"akc",
  "channelName":"utopchannel"
}'

curl -s -X POST \
  http://13.229.109.23:4001/joinchannel \
  -H "content-type: application/json" \
  -d '{
  "orgname":"akc",
  "channelName":"aiachannel"
}'

curl -s -X POST \
  http://13.229.109.23:4001/joinchannel \
  -H "content-type: application/json" \
  -d '{
  "orgname":"akc",
  "channelName":"akcchannel"
}'

```
###### AIA
```
curl -s -X POST   http://13.228.30.184:4001/registerUser   -H "content-type: application/json"   -d '{
  "orgname":"aia"
}'

curl -s -X POST   http://13.228.30.184:4001/joinchannel   -H "content-type: application/json"   -d '{
  "orgname":"aia",
  "channelName":"aiachannel"
}'

```
###### UTOP
```
curl -s -X POST   http://3.112.39.228:4001/registerUser   -H "content-type: application/json"   -d '{
  "orgname":"utop"
}'

curl -s -X POST   http://3.112.39.228:4001/joinchannel   -H "content-type: application/json"   -d '{
  "orgname":"utop",
  "channelName":"utopchannel"
}'

```

###### FRT
```
curl -s -X POST \
  http://13.230.35.104:4001/registerUser \
  -H "content-type: application/json" \
  -d '{
  "orgname":"frt"
}'

curl -s -X POST \
  http://13.230.35.104:4001/joinchannel \
  -H "content-type: application/json" \
  -d '{
  "orgname":"frt",
  "channelName":"utopchannel"
}'


```

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

## ADD Data For Application  (utopchannel)

#### Start Dapp
```
cd $HOME/akc-dapp
pm2 start server.js --name dapp
```

###### Create merchant
```
curl -s -X POST   http://54.95.72.122:4000/createMerchant   -H "content-type: application/json"   -d '{
  "orgname":"utop",
  "args":["3b2aa360675c434fa2126d1dde449adbadfef3069f94ad57f94e95ab53921b45","100000","1","0"]
}'

curl -s -X POST \
  http://18.179.96.163:4000/createMerchant \
  -H "content-type: application/json" \
  -d '{
	"orgname":"frt",
	"args":["aeffd0eb968be469c85ec3f311236d8c50755d399575950900c76c7dd3700e40","10000","1.5","0"]
}'

curl -s -X POST \
  http://54.95.32.199:4000/createMerchant \
  -H "content-type: application/json" \
  -d '{
  "orgname":"akc",
  "args":["5c5ac1307594e4daf0d0a3225912325cd4f5cc2051af09196b3fdb2018917e5e","10000","1","0"]
}'

```
###### Create 1 user
```
curl -s -X POST \
  http://54.95.72.122:4000/createUser \
  -H "content-type: application/json" \
  -d '{
  "orgname":"utopstar",
	"args":["1", "sample"]
}'

```

###### IF success
```
{"status":"200", "msg":"OK", "data":[]}
```

#### IN ANY COMPUTER
###### Check ledger 
```
	Access:
		http://<ORG1_IP>:6984/_utils/#database/utopstarchannel_mycc/_all_docs
```

## ADD Data For Application  (aiachannel)
```
curl -s -X POST   http://52.195.14.32:4000/createMerchant   -H "content-type: application/json"   -d '{
  "orgname":"akc",
  "channelName":"aiachannel",
  "chaincodeId":"aia_cc",
  "args":["5c5ac1307594e4daf0d0a3225912325cd4f5cc2051af09196b3fdb2018917e5e","100000","1","0"]
}'

curl -s -X POST   http://52.195.16.32:4000/createMerchant   -H "content-type: application/json"   -d '{
  "orgname":"aia",
  "channelName":"aiachannel",
  "chaincodeId":"aia_cc",
  "args":["cf38c390086dcb50660f365362fdf4560dc4e79b543d673305fe1ee48c7ffcf2","10000","0.5","0"]
}'

curl -s -X POST \
  http://18.179.59.207:4000/createMerchant \
  -H "content-type: application/json" \
  -d '{
	"orgname":"coldstorage",
  "channelName":"aiachannel",
  "chaincodeId":"aia_cc",
	"args":["ad2497b6781103e7e9e0d4d2a3ec4409044f5aaedff8cac0bcabb3bbf189ff56","10000","1.5","0"]
}'




curl -s -X POST \
  http://52.195.16.32:4000/createUser \
  -H "content-type: application/json" \
  -d '{
  "orgname":"aia",
  "channelName":"aiachannel",
  "chaincodeId":"aia_cc",
	"args":["1", "sample"]
}'
```
# Done 


# Troubleshooting TechNotes
### LMS-Explorer
1. When open chaincode get error: "Location not found"
- try command: locate -r ftel_cc.go
- replace ftel_cc by chaincode name
- if no result try run command: sudo updatedb
- and try again.