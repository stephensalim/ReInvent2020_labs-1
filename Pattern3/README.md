Stephen and Tim Lab - Pattern 3

Introduction

Importance of patching instances from a security and compliance perspective.
Explain blue/green deployment group.Update policy and blue green deployment process. This is favoured over 
Explain why this is superior over previous method of using Lambda and Systems Manager to update the config.

1.  Deploy the infrastructure Cloudformation template. - explain that this is deploying VPC/blah
    Command : 
        aws cloudformation create-stack --stack-name <name of your vpc stack> --template-body file://baseline-vpc.yml

2.  Deploy the application stack.
    Command : 
        aws cloudformation create-stack --stack-name <name of your application stack> --template-body file://baseline-application.yml --parameters ParameterKey=AmazonMachineImage,ParameterValue=ami-0f96495a064477ffb	ParameterKey=BaselineVpcStack,ParameterValue=<name of your vpc stack>

        For the AmazonMachineImage use Amazon Linux 2 ( The userdata is only tested with Amazon Linux 2).
        Th image is based in Sydney.

At the end the stack should show a completed application web page with a welcome screen
    Comment : 
        Use the ELB URL, put in /details.php at the end of the url to go to the page listing AMI ID and installed packages.

3. Deploy the EC2 Image Builder template from <here> or you can go through a manual image builder setup via the following instructuions.
    Command:
        aws cloudformation create-stack --stack-name <name of your image builder stack> --template-body file://ami-builder-pipeline.yml --parameters ParameterKey=BaselineVpcStack,ParameterValue=<name of your vpc stack> ParameterKey=MasterAMI,ParameterValue=ami-0f96495a064477ffb 

        For the AmazonMachineImage use Amazon Linux 2 ( The userdata is only tested with Amazon Linux 2).
        Th image is based in Sydney.

…

Now that the stack is build, you can move to step 4 where we create the document in SSM which with be responsible for automating the image build. C

4. Create the automation document. Which will:
    1.  Call the EC2 image builder API to build a new AMI. Pipeline resource which has a recipe defined within it.
    2. Wait for the pipeline to finish and produce the AMI ID.
    3. Pass the AMI ID to perform an update stack into the application cloud formation stack.
    4. SSM will wait until the cloud formation update is complete.
    5. Because we have updated the resource, Cloudfortmation will wait until the signal for the bootstrap is completed then add the new group to the load balancer and then dehydrate the old ASG.

    Command:
        aws cloudformation create-stack --stack-name <name of your automation stack> --template-body file://automate-build-deployment.yml --parameters ParameterKey=ImageBuilderPipelineStack,ParameterValue=<name of your image builder stack> ParameterKey=ApplicationStack,ParameterValue=<name of your application stack>


5. To fully automate this, create an event trigger using EventBridge. (Event bridge feeding into the AWS Systems Manager )