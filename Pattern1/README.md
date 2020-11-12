# ReInvent2020 Security The Well-Architected Way with WeInvest - Pattern 1
#### Author:  Tim Robinson and Stephen Salim

----

## Introduction 

[ Enter Intro here ]

In this lab we will walk you through this approach, by utilizing a combination of AWS services & features, namely :

 * [ Enter List of Services to highlight here ]

We will walk you through the lab in stages with examples using both manual deployments and [CloudFormation](https://aws.amazon.com/cloudformation/) templates to assist.

Our lab is divided into several sections as follows:

1. Deploy the lab base infrastructure
1.1. Deploy base network stack.
1.2. Push application image into repository.
1.3. Deploy base application stack.
1.4. Test application launched.
2. Configure CloudTrail Logging & Alarm


We have included CloudFormation templates for the first few steps to get your started, and also provide optional templates for the rest of the lab so you can choose between creating the monitoring resources via cloudformation or manually through the console.

##### Important Note :
  * For simplicity, we have used Sydney 'ap-southeast-2' as the default region for this lab. 
  * To deploy the cloudformation template in this lab, you will need to have **AWS CLI (Command Line)** installed & configured, please follow this [guide](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)
  * In this Lab we will be creating a local docker image, please ensure you have [docker](https://www.docker.com/) installed in your machine, and you are running `Docker version 18.09.9` or above.
    [ Enter Section List here ]

## 1. Deploy the lab Network and Application infrastructure

In this section, we will build out a [Virtual Public Cloud (VPC)](https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html), together with public and private subnets across two [Availability Zones](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html), [Internet Gateway](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html) and [NAT gateway](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html) along with the necessary routes from both public and private subnets. This VPC will become the baseline network architecture where the application will run. When we are completed our initial environment will look like this:

![Section1 Base Architecture](images/section1/section1-pattern3-base-architecture.png)

Building each components in this section manually will take a bit of time, and because our objective in this lab is to show you how to automate patching through AMI build and deployment. To save time, we have created a cloudformation template that you can deploy to expedite the process.
Please follow the steps below to do so : 

### 1.1. Deploy base network stack

To deploy the first CloudFormation template, you can either deploy directly from the command line or via the console. 

You can get the template [here](https://raw.githubusercontent.com/skinnytimmy/ReInvent2020_labs/Pattern3/Pattern3/templates/section1/pattern3-base.yml "Section1 template").

##### Command Line:

To deploy from the command line, ensure that you have installed and configured AWS CLI with the appropriate credentials.

  1. Execute below command to create the base stack.
      ```
        aws cloudformation create-stack --stack-name pattern1-base \
                                        --template-body file://pattern1-base.yml \
                                        --region ap-southeast-2
      ```

  2. Once the command deployed successfully, go to your [Cloudformation console](https://console.aws.amazon.com/cloudformation/home?region=ap-southeast-2) to locate the stack named `pattern1-base`, 
  3. Confirm that it is on **'CREATE_COMPLETE'** state. 
  4. Take note of this **stack name** as we will need it for the following section.

##### Console:

If you decide to deploy the stack from the console, ensure that you follow below requirements & step:

  1. Please follow this [guide](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-console-create-stack.html) for information on how to deploy the cloudformation template.
  2. Use `pattern1-base` as the **Stack Name**, as this is referenced by other stacks later in the lab.

### 1.2. Configure the ECS Container Repository

In this section, we are going to prepare our sample application, package them into a docker image and push them into our ECR Repository. This involves running several docker commands to create the image locally and push into [ECR](https://aws.amazon.com/ecr/). To make it simple for you we have created bash script to do everything for you. To do this ensure that you have docker locally installed, and you are running `Docker version 18.09.9` or above.

Follow below instructions to continue :


1. Execute the script under app/ folder as below instructed below.

    ```
    cd app/
    ./build-container.sh pattern1-base
    ```

    Take note the ECS Image URI produced at the end of the script.

    ![Section1 Script Output](images/section1/section1-script-output.png)

2. Confirm the ECR Repo Exist

### 1.3. Deploy base application stack.

[ Explanation about Application Infra]


##### Command Line:

To deploy from the command line, ensure that you have installed and configured AWS CLI with the appropriate credentials.

1. Execute below command to create the base stack.
    Please ensure to pass the ECR Image URI you defined in section **1.2**


    ```
    aws cloudformation create-stack --stack-name pattern1-app \
                                    --template-body file://pattern1-app.yml \
                                    --parameters ParameterKey=BaselineVpcStack,ParameterValue=pattern1-base \
                                                ParameterKey=ECRImageURI,ParameterValue=<ECR Image URI> \
                                    --capabilities CAPABILITY_NAMED_IAM \
                                    --region ap-southeast-2
    ```
    e.g:

    ```
    aws cloudformation create-stack --stack-name pattern1-application \
                                    --template-body file://pattern1-app.yml \
                                    --parameters ParameterKey=BaselineVpcStack,ParameterValue=pattern1-base \
                                                ParameterKey=ECRImageURI,ParameterValue=111111111111.dkr.ecr.ap-southeast-2.amazonaws.com/pattern1appcontainerrepository-cu9vft86ml5e:latest \
                                    --capabilities CAPABILITY_NAMED_IAM \
                                    --region ap-southeast-2
    ```

  2. Once the command deployed successfully, go to your [Cloudformation console](https://console.aws.amazon.com/cloudformation/home?region=ap-southeast-2) to locate the stack named `pattern1-base`, 
  3. Confirm that it is on **'CREATE_COMPLETE'** state. 
  4. Take note of this **stack name**
  5. Take note of the DNS value specified under **OutputPattern1ApplicationEndpoint**  of the Outputs.
  6. Take note of the ECS Task Role Arn value specified under **OutputPattern1ECSTaskRole**  of the Outputs.
  OutputPattern1ECSTaskRole 
![Section2 DNS Output](images/section2/section2-dns-outputs.png)


### 1.4. Test the Application launched.

[ Explanations about the application behaviour ]

```
ALBURL="http://patte-Patte-1D3Y1IXBO43P7-686158038.ap-southeast-2.elb.amazonaws.com"

curl --header "Content-Type: application/json" --request POST --data '{"Name":"Stephen","Text":"I love Pizza"}' $ALBURL/encrypt
```

Once you've executed this you should see an output as below.
Take note of the **Key** value, we will need it to decypt later.

```
{"Message":"Data encrypted and stored, keep your key save","Key":"afad2b1f-48b5-4eac-a226-dd014f59497c"}
```

##### Console:

If you decide to deploy the stack from the console, ensure that you follow below requirements & step:

  1. Please follow this [guide](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-console-create-stack.html) for information on how to deploy the cloudformation template.
  2. Use `pattern1-app` as the **Stack Name**.

### 2. Configure CloudTrail Logging & Alarm

[ Introduction to the section ]

To build the pipeline directly via Cloudformation template go to section 2.1.
To build the pipeline manually go to section 2.2.


### 2.1. Deploy using Cloudformation Template.

Download the template [here]

##### Command Line:

1. To deploy from the command line, ensure that you have installed and configured AWS CLI with the appropriate credentials.    
    


    ```
    aws cloudformation create-stack --stack-name pattern1-logging \
                                    --template-body file://pattern1-logging.yml \
                                    --parameters ParameterKey=AppECSTaskRoleArn,ParameterValue=<ECS Task role value> \
                                                 ParameterKey=EmailAddress,ParameterValue=<Enter Email Address >\                                    
                                    --capabilities CAPABILITY_NAMED_IAM \
                                    --region ap-southeast-2
    ```




    ###### Note :
      * For simplicity, we have used Sydney 'ap-southeast-2' as the default region for this lab. 
      * Use the ECS Task Role Arn value you took note from section **1.3** for **AppECSTaskRoleArn** parameter.
      * Use email address you would like to use to be notified with under **EmailAddress** parameter. 

##### Console:

1. To deploy the template from console please follow this [guide](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-console-create-stack.html) for information on how to deploy the cloudformation template. 

2. Use `pattern3-logging` as the **Stack Name**.
3. Provide the name of the vpc cloudformation stack you create in section 1 ( we used `pattern3-base` as default ) as the **BaselineVpcStack** parameter value. 
4. Use the ECS Task Role Arn value you took note from section **1.3** for **AppECSTaskRoleArn** parameter.
5. Use email address you would like to use to be notified with under **EmailAddress** parameter. 

### 3.2 Deploy manually using Console.

[The hard yard]

---

### 3.2.1 


### Test Application
```
curl --header "Content-Type: application/json" --request POST --data '{"Name":"John","Text":"I love dumplings"}' http://localhost:8080/encrypt
curl --header "Content-Type: application/json" --request GET --data '{"Name":"John","Key":"a94cc58c-56c5-464b-8f05-604257bb2336"}' http://localhost:8080/decrypt

curl --header "Content-Type: application/json" --request POST --data '{"Name":"Stephen","Text":"I love Pizza"}' patte-Patte-1D3Y1IXBO43P7-686158038.ap-southeast-2.elb.amazonaws.com/encrypt
curl --header "Content-Type: application/json" --request GET --data '{"Name":"Stephen","Key":"afad2b1f-48b5-4eac-a226-dd014f59497c"}' patte-Patte-1D3Y1IXBO43P7-686158038.ap-southeast-2.elb.amazonaws.com/decrypt
```

### Filter.

{ $.errorCode = "*" && $.eventSource= "kms.amazonaws.com" && $.userIdentity.sessionContext.sessionIssuer.arn = "arn:aws:iam::022787131977:role/pattern1-application-Pattern1ECSTaskRole" }
