## Step 1.
1. Deploy VPC Base

```
aws cloudformation create-stack --stack-name pattern1-base \
                                --template-body file://pattern1-base.yml \
                                --region ap-southeast-2
```

```
aws cloudformation update-stack --stack-name pattern1-base \
                                --template-body file://pattern1-base.yml \
                                --region ap-southeast-2
```


1. Deploy Application

```
aws cloudformation create-stack --stack-name pattern1-app \
                                --template-body file://pattern1-app.yml \
                                --parameters ParameterKey=BaselineVpcStack,ParameterValue=pattern1-base \
                                --capabilities CAPABILITY_NAMED_IAM \
                                --region ap-southeast-2
```


```
curl --header "Content-Type: application/json" --request POST --data '{"Name":"John","Text":"I love dumplings"}' http://localhost:8080/encrypt
curl --header "Content-Type: application/json" --request GET --data '{"Name":"John","Key":"a94cc58c-56c5-464b-8f05-604257bb2336"}' http://localhost:8080/decrypt

curl --header "Content-Type: application/json" --request POST --data '{"Name":"Trump","Text":"I like to eat shit"}' patte-Patte-SPG83OC5YDC-105497302.ap-southeast-2.elb.amazonaws.com/encrypt
curl --header "Content-Type: application/json" --request GET --data '{"Name":"Trump","Key":"0e673ef2-e993-4626-89f0-02626fb2b8df"}' patte-Patte-SPG83OC5YDC-105497302.ap-southeast-2.elb.amazonaws.com/decrypt

```

```
$(aws ecr get-login --no-include-email)
TAG="${SERVICE_NAME}"
docker build --tag "${REPOSITORY_URI}:${TAG}" .
docker push "${REPOSITORY_URI}:${TAG}"
```