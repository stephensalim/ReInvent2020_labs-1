Introduction



### Preparation
1. Deploy VPC Base

    ```
    aws cloudformation create-stack --stack-name pattern1-base \
                                    --template-body file://pattern1-base.yml \
                                    --region ap-southeast-2
    ```

2 Take Note of the **Pattern1AppContainerRepository** in the Outputs

3. Prepare Image Container

    ```
    cd app/
    ```
    ```
    bash ./build-container.sh <base stack name>
    ```
    Note the Image URI

4. Confirm the ECR Repo Exist
5. Deploy Application

    ```
    aws cloudformation create-stack --stack-name pattern1-application \
                                    --template-body file://pattern1-app.yml \
                                    --parameters ParameterKey=BaselineVpcStack,ParameterValue=pattern1-base \
                                                ParameterKey=ECRImageURI,ParameterValue=<IMage URI> \
                                    --capabilities CAPABILITY_NAMED_IAM \
                                    --region ap-southeast-2
    ```

    e.g:

    ```
    aws cloudformation create-stack --stack-name pattern1-application \
                                    --template-body file://pattern1-app.yml \
                                    --parameters ParameterKey=BaselineVpcStack,ParameterValue=pattern1-base \
                                                ParameterKey=ECRImageURI,ParameterValue=022787131977.dkr.ecr.ap-southeast-2.amazonaws.com/pattern1appcontainerrepository-cu9vft86ml5e:latest \
                                    --capabilities CAPABILITY_NAMED_IAM \
                                    --region ap-southeast-2
    ```

### Test Application

```
curl --header "Content-Type: application/json" --request POST --data '{"Name":"John","Text":"I love dumplings"}' http://localhost:8080/encrypt
curl --header "Content-Type: application/json" --request GET --data '{"Name":"John","Key":"a94cc58c-56c5-464b-8f05-604257bb2336"}' http://localhost:8080/decrypt

curl --header "Content-Type: application/json" --request POST --data '{"Name":"Stephen","Text":"I love Pizza"}' patte-Patte-1D3Y1IXBO43P7-686158038.ap-southeast-2.elb.amazonaws.com/encrypt
curl --header "Content-Type: application/json" --request GET --data '{"Name":"Stephen","Key":"afad2b1f-48b5-4eac-a226-dd014f59497c"}' patte-Patte-1D3Y1IXBO43P7-686158038.ap-southeast-2.elb.amazonaws.com/decrypt

```

### Implement CloudTrail Logging

    ```
    aws cloudformation create-stack --stack-name pattern1-logging \
                                    --template-body file://pattern1-monitoring.yml \
                                    --parameters ParameterKey=AppECSTaskRoleArn,ParameterValue=arn:aws:iam::022787131977:role/pattern1-application-Pattern1ECSTaskRole \
                                                 ParameterKey=EmailAddress,ParameterValue=sssalim@amazon.com \                                    
                                    --capabilities CAPABILITY_NAMED_IAM \
                                    --region ap-southeast-2
    ```
    aws cloudformation update-stack --stack-name pattern1-logging \
                                    --template-body file://pattern1-monitoring.yml \
                                    --parameters ParameterKey=AppECSTaskRoleArn,ParameterValue=arn:aws:iam::022787131977:role/pattern1-application-Pattern1ECSTaskRole \
                                                 ParameterKey=EmailAddress,ParameterValue=sssalim@amazon.com \
                                    --capabilities CAPABILITY_NAMED_IAM \
                                    --region ap-southeast-2
    ```
Explain What the filter does.

{ $.errorCode = "*" && $.eventSource= "kms.amazonaws.com" && $.userIdentity.sessionContext.sessionIssuer.arn = "arn:aws:iam::022787131977:role/pattern1-application-Pattern1ECSTaskRole" }

11:41 - Trigger Event
