Stephen and Tim Lab - Pattern 3

##Introduction##

Patching is a vitual component to any security strategy in terms of ensuring that your compute environments are operating with the latest code revisions available. This ensures that all security updates are applied which reduces the potential attack surface of your workload. In terms of compliance, almost all frameworks will require evidence of a patching strategy of some sort, so ensuring that you have an automated solution in place will reduce your operational overhead, patch your environment to the latest operating system code and also provide the appropriate logging which could assist you during a future compliance audit.

There are a number of different patching methods available using native AWS services, but we have decided to utilize a combination of EC2 Patch Manager and Systems Manager for this lab. This approach has the advantage of being able to work in a blue/green deployment scenario, whereby a parallel (patched) compute environment is created which run alongside your existing environment. This method allows for the cloudformation stack to be updated with the new environment details during a cutover scenario, together with an option to failback if needed. 

Our lab is split into a number of individual sections as follows:

1. Deploy the Base Infrastructure.
2. Deploy the Application Infrastructure.
3. Deploy the AMI Builder Pipeline.
4. Deploy the Build Automation.

We have included CloudFormation templates for the first few steps to get your started, and also provide optional templates for the rest of the lab so you can choose between creating the pipeline and automation documents manually or simply running the template to see the end result.

For ease of use, we have used Sydney as the default deployment region, so ensure that you are working from there for the duration of the lab.

## 1. Deploy the lab base infrastructure

The first section of the lab will build out a VPC, together with public and private subnets across two AZs. In addition, we will create an internet gateway and NAT gateway and the necessary routes from both public and private subnets. When we are completed our initial environment will look like this:

![Section1 Base Architecture](/images/section1/section1-pattern3-base-architecture.png)
Format: ![Alt Text](url)

To deploy the first CloudFormation template, you can either deploy directly from the command line or via the console. To deploy from the command line, ensure that you have appropriate access keys in place and run the following command:

```
aws --region ap-southeast-2 cloudformation create-stack --stack-name <name of your vpc stack> --template-body file://pattern3-base.yml
```
If you decide to deploy the stack from the console, ensure that you name the stack 'pattern3-base' as this is referenced by other stacks later in the lab.

When the CloudFormation template deployment is completed, note the outputs as they may be required later and move to section 2.


## 2. Deploy the Application Infrastructure

The second section of the lab will build out the application stack within the VPC. This will comprise of the following assets:

* Application Load Balancer (ALB), Target Group and listener.
* Autoscaling Group and Launch Configuration.
* Security Groups for the ALB and instances.

To deploy the second CloudFormation template, you can either deploy directly from the command line or via the console. To deploy from the command line, run the following command:

```
aws --region ap-southeast-2 cloudformation create-stack --stack-name <name of your application stack> --template-body file://baseline-application.yml --parameters ParameterKey=AmazonMachineImage,ParameterValue=ami-0f96495a064477ffb	ParameterKey=BaselineVpcStack,ParameterValue=pattern3-base 
```

Note that for the AmazonMachineImage, please use an AMI ID which represents an Amazon Linux 2 machine image from Sydney region (the userdata is only tested with Amazon Linux 2).

If you decide to deploy rhe stack from the console, ensure that you provide the correct stack name from section 1 (we have used pattern3-base for the example). In addition, you will need to provide the AMI ID of an Amazon Linux 2 image, which you can find from the EC2 console.

When the CloudFormation template deployment is completed, note the outputs as they may be required later.



------------------------------------------

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

Run the SSM automation document.

Note : To monitor the deployment, update the ./watchlist.sh change the URL with your ELB URL.
Run in throughout your Deployment 