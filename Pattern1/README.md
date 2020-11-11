## Step 1.
1. Deploy VPC Base

```
aws cloudformation create-stack --stack-name pattern1-base \
                                --template-body file://pattern1-base.yml \
                                --region ap-southeast-2
```

1. Deploy Application

```
aws cloudformation create-stack --stack-name pattern1-app \
                                --template-body file://pattern1-application.yml \
                                --parameters ParameterKey=BaselineVpcStack,ParameterValue=pattern1-base \
                                             ParameterKey=DBMasterUserPassword,ParameterValue=< yourpassword > \
                                --capabilities CAPABILITY_NAMED_IAM \
                                --region ap-southeast-2
```

```
aws cloudformation create-stack --stack-name pattern1-app \
                                --template-body file://pattern1-application.yml \
                                --parameters ParameterKey=BaselineVpcStack,ParameterValue=pattern1-base \
                                             ParameterKey=DBMasterUserPassword,ParameterValue=P455w0rd#$% \
                                --capabilities CAPABILITY_NAMED_IAM \
                                --region ap-southeast-2
```


```
curl --header "Content-Type: application/json" --request POST --data '{"Name":"John","Text":"I love dumplings"}' http://localhost:8080/encrypt
curl --header "Content-Type: application/json" --request GET --data '{"Name":"John","Key":"3ccfef82-f8d7-49f7-acca-8784c2bbd78c"}' http://localhost:8080/decrypt
```