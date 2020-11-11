## Step 1.
1. Deploy VPC Base

```
aws cloudformation create-stack --stack-name pattern1-base \
                                --template-body file://pattern1-base.yml \
                                --region ap-southeast-2
```

1.1 Take Note of the **Pattern1AppContainerRepository** in the Outputs

1.2

```
cd app/
```
```
bash ./build-container.sh <base stack name>
```

1.3 Confirm the ECR Repo Exist



1. Deploy Application

```
aws cloudformation create-stack --stack-name pattern1-application \
                                --template-body file://pattern1-app.yml \
                                --parameters ParameterKey=BaselineVpcStack,ParameterValue=pattern1-base \
                                             ParameterKey=ECRImageURI,ParameterValue=<IMage URI> \
                                --capabilities CAPABILITY_NAMED_IAM \
                                --region ap-southeast-2
```




```
aws cloudformation create-stack --stack-name pattern1-application \
                                --template-body file://pattern1-app.yml \
                                --parameters ParameterKey=BaselineVpcStack,ParameterValue=pattern1-base \
                                             ParameterKey=ECRImageURI,ParameterValue=022787131977.dkr.ecr.ap-southeast-2.amazonaws.com/pattern1appcontainerrepository-cu9vft86ml5e:latest \
                                --capabilities CAPABILITY_NAMED_IAM \
                                --region ap-southeast-2
```


```
curl --header "Content-Type: application/json" --request POST --data '{"Name":"John","Text":"I love dumplings"}' http://localhost:8080/encrypt
curl --header "Content-Type: application/json" --request GET --data '{"Name":"John","Key":"a94cc58c-56c5-464b-8f05-604257bb2336"}' http://localhost:8080/decrypt

curl --header "Content-Type: application/json" --request POST --data '{"Name":"Stephen","Text":"I love Pizza"}' patte-Patte-1D3Y1IXBO43P7-686158038.ap-southeast-2.elb.amazonaws.com/encrypt
curl --header "Content-Type: application/json" --request GET --data '{"Name":"Trump","Key":"0e673ef2-e993-4626-89f0-02626fb2b8df"}' patte-Patte-SPG83OC5YDC-105497302.ap-southeast-2.elb.amazonaws.com/decrypt

```

