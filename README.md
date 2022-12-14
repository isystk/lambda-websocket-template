ð lambda-websocket-template
====

![GitHub issues](https://img.shields.io/github/issues/isystk/lambda-websocket-template)
![GitHub forks](https://img.shields.io/github/forks/isystk/lambda-websocket-template)
![GitHub stars](https://img.shields.io/github/stars/isystk/lambda-websocket-template)
![GitHub license](https://img.shields.io/github/license/isystk/lambda-websocket-template)

## ð ãã­ã¸ã§ã¯ãã®æ¦è¦

AWSï¼API Gateway â Lambda â DynamoDBï¼ãå©ç¨ããWebSocketã®ãµã³ãã«ã§ãã
ãªã¢ã«ã¿ã¤ã ã§ãã£ãããããããªã¢ããªã±ã¼ã·ã§ã³ã®æ§ç¯ãåºæ¥ã¾ãã
SAM ãå©ç¨ãã¦ç®¡çãã¦ããã®ã§ãã³ãã³ãã²ã¨ã¤ã§ã¤ã³ãã©ãæ§ç¯åºæ¥ãããã«ãã¦ãã¾ãã
ã¾ããDockerãå©ç¨ãããã¨ã§ã­ã¼ã«ã«ç°å¢ã§ãå®è£ã»ãã¹ããåºæ¥ãããã«ãã¦ãã¾ãã

## ð Demo

wscat -c wss:///3gphoqfej8.execute-api.ap-northeast-1.amazonaws.com/Prod?roomId=test

## ð¦ ãã£ã¬ã¯ããªæ§é 

```
.
âââ README.md
âââ app (Lambdaã®ã¢ã¸ã¥ã¼ã«)
â   âââ app.js
â   âââ data
â   âââ dynamodb-client.js
â   âââ lambda.js
â   âââ local-app.js
â   âââ node_modules
â   âââ package-lock.json
â   âââ package.json
â   âââ schema
â   âââ tests
âââ dc.sh (Dockerç®¡çç¨ã®ã·ã§ã«ã¹ã¯ãªãã)
âââ docker
â   âââ awscli
â   âââ docker-compose.yml
â   âââ dynamodb
âââ layers (å±éã¢ã¸ã¥ã¼ã«)
â   âââ app-layer
âââ samconfig.toml
âââ template.yaml
```

## ð§ éçºç°å¢ã®æ§ç¯

IAM ã¦ã¼ã¶ã¼ãç¨æãã
```
ã¦ã¼ã¶åï¼ãlambda-userã
ã¢ã¯ã»ã¹æ¨©éï¼
ãAdministratorAccessã
```

SAM CLI ãã¤ã³ã¹ãã¼ã«ãã
```
$ pip install aws-sam-cli
```

wscat ãã¤ã³ã¹ãã¼ã«
```
npm install -g wscat
```

AWSã«ã¢ã¯ã»ã¹ããçºã®è¨­å®ãä½æãã
```
$ aws configure --profile lambda-user 
AWS Access Key ID [None]: xxxxxxxxxx
AWS Secret Access Key [None]: xxxxxxxxxx
Default region name [None]: ap-northeast-1
Default output format [None]: json
```

## ðï¸ Docker æä½ç¨ã·ã§ã«ã¹ã¯ãªããã®ä½¿ãæ¹

```
Usage:
  dc.sh [command] [<options>]

Options:
  stats|st                 Dockerã³ã³ããã®ç¶æãè¡¨ç¤ºãã¾ãã
  init                     Dockerã³ã³ããã»ã¤ã¡ã¼ã¸ã»çæãã¡ã¤ã«ã®ç¶æãåæåãã¾ãã
  start                    ãã¹ã¦ã®Daemonãèµ·åãã¾ãã
  stop                     ãã¹ã¦ã®Daemonãåæ­¢ãã¾ãã
  --version, -v     ãã¼ã¸ã§ã³ãè¡¨ç¤ºãã¾ãã
  --help, -h        ãã«ããè¡¨ç¤ºãã¾ãã
```

## ð¬ ä½¿ãæ¹

ã­ã¼ã«ã«ã§APIãèµ·åãã
```
# äºåæºå
$ ./dc.sh init
$ docker network create lambda-local

# Dockerãèµ·åãã
$ ./dc.sh start

# DynamoDBã«ãã¼ãã«ãä½æãã
$ ./dc.sh aws local
> aws dynamodb create-table --cli-input-json file://app/schema/connections.json --endpoint-url http://dynamodb:8000  --billing-mode PAY_PER_REQUEST
> aws dynamodb create-table --cli-input-json file://app/schema/room.json --endpoint-url http://dynamodb:8000  --billing-mode PAY_PER_REQUEST
> aws dynamodb list-tables  --endpoint-url http://dynamodb:8000 
> aws dynamodb scan --table-name simple_websocket_app_posts  --endpoint-url http://dynamodb:8000
(ãã¼ãã«ãåé¤ããå ´å)
> aws dynamodb delete-table --table-name simple_websocket_app_posts --endpoint-url http://dynamodb:8000

# SAMã§ã¢ããªããã«ããã¦ããAPIãèµ·åãã
$ sam build
$ sam local start-api --docker-network lambda-local

# ã­ã¼ã«ã«ã ã¨åä½ããªãã®ã§èª¿æ»ä¸­ãã

```

æ¬çªç°å¢ï¼AWSï¼ ã«ããã­ã¤ãã
```
# ãã«ããå®è¡ããï¼.aws-samãã£ã¬ã¯ããªã«çæãããï¼
$ sam build
# AWSã«åæ ãã
$ sam deploy --config-env stg

# ï¼ã¿ã¼ããã«ï¼ã¤ããï¼ã«ã¼ã ã«æ¥ç¶ãã¦ã¡ãã»ã¼ã¸ãéä¿¡ãã
$ wscat -c wss:///xxxxxx.execute-api.ap-northeast-1.amazonaws.com/Prod?roomId=test
Connected (press CTRL+C to quit)
< { "action": "sendmessage", "data": {"type": "test", "value": "hello world" }}
```

AWSãããDynamoDBãLambda&APIGatewayãåé¤ãã
```
$ sam delete --stack-name simple-websocket-app --profile lambda-user
```

### DynamoDBAdmin
DynamoDBã«æ¥ç¶ãã¦ãã¼ã¿ã®åç§ãç·¨éãå¯è½ã§ãã
Dockerãèµ·åå¾ã«ä»¥ä¸ã®URLã«ã¢ã¯ã»ã¹ããã¨å©ç¨å¯è½ã§ãã

http://localhost:8001/

![DynamoDB-Admin](./dynamodb-admin.png "WSL-MySQL")


## ð¨ åè

| ãã­ã¸ã§ã¯ã| æ¦è¦|
| :---------------------------------------| :-------------------------------|
| [WebSocket - AWS ã® API Gateway ã¨ Lambda ã§ã«ã¼ã æ©è½ä»ãã®chatãä½ãæã®ä»æ§ãèãã](https://qiita.com/anfangd/items/ebcd77173341b10b3684)| WebSocket - AWS ã® API Gateway ã¨ Lambda ã§ã«ã¼ã æ©è½ä»ãã®chatãä½ãæã®ä»æ§ãèãã |

## ð« Licence

[MIT](https://github.com/isystk/lambda-websocket-template/blob/master/LICENSE)

## ð Author

[isystk](https://github.com/isystk)
