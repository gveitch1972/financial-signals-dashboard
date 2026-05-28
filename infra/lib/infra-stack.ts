import * as cdk from 'aws-cdk-lib';
import { Annotations } from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import { Construct } from 'constructs';

interface DashboardStackProps extends cdk.StackProps {
  certificate: acm.ICertificate;
}

export class DashboardStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: DashboardStackProps) {
    super(scope, id, props);

    // Frontend bucket — React build deployed here
    const frontendBucket = new s3.Bucket(this, 'FrontendBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Existing data bucket (Databricks writes JSON here)
    const dataBucket = s3.Bucket.fromBucketName(
      this, 'DataBucket', 'fin-signals-quicksight-313753089884'
    );

    // CF Function: strip /data prefix before forwarding to S3 origin
    // /data/daily_market_snapshot.json → /daily_market_snapshot.json
    // originPath /dashboard then maps → s3://bucket/dashboard/daily_market_snapshot.json
    const dataPathRewrite = new cloudfront.Function(this, 'DataPathRewrite', {
      code: cloudfront.FunctionCode.fromInline(
        'function handler(event) {\n' +
        '  var req = event.request;\n' +
        '  if (req.uri.indexOf(\'/data/\') === 0) { req.uri = req.uri.slice(5); }\n' +
        '  return req;\n' +
        '}'
      ),
    });

    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      certificate: props.certificate,
      domainNames: ['quicksight.grahamveitch.com'],
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(frontendBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      additionalBehaviors: {
        '/data/*': {
          origin: origins.S3BucketOrigin.withOriginAccessControl(dataBucket, {
            originPath: '/dashboard',
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          functionAssociations: [{
            function: dataPathRewrite,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          }],
        },
      },
      errorResponses: [
        { httpStatus: 403, responseHttpStatus: 200, responsePagePath: '/index.html' },
        { httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html' },
      ],
    });

    // Silence CDK warning — we DO manage the imported bucket policy manually below
    Annotations.of(this).acknowledgeWarning(
      '@aws-cdk/aws-cloudfront-origins:updateImportedBucketPolicyOac',
      'Managed manually via CfnBucketPolicy'
    );

    // Data bucket policy: preserve existing QuickSight access + add CloudFront OAC
    // CDK cannot auto-add policy to imported bucket so we manage it here.
    // This replaces (and includes) the policy already on the bucket.
    new s3.CfnBucketPolicy(this, 'DataBucketPolicy', {
      bucket: dataBucket.bucketName,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { Service: 'quicksight.amazonaws.com' },
            Action: ['s3:ListBucket', 's3:GetObject'],
            Resource: [
              `arn:aws:s3:::fin-signals-quicksight-313753089884`,
              `arn:aws:s3:::fin-signals-quicksight-313753089884/*`,
            ],
            Condition: { StringEquals: { 'aws:SourceAccount': this.account } },
          },
          {
            Effect: 'Allow',
            Principal: { Service: 'cloudfront.amazonaws.com' },
            Action: 's3:GetObject',
            Resource: `arn:aws:s3:::fin-signals-quicksight-313753089884/dashboard/*`,
            Condition: {
              StringEquals: {
                'AWS:SourceArn': `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`,
              },
            },
          },
        ],
      },
    });

    const hostedZone = route53.HostedZone.fromLookup(this, 'Zone', {
      domainName: 'grahamveitch.com',
    });

    new route53.ARecord(this, 'AliasRecord', {
      zone: hostedZone,
      recordName: 'quicksight',
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });

    new cdk.CfnOutput(this, 'DistributionDomain', {
      value: distribution.distributionDomainName,
    });

    new cdk.CfnOutput(this, 'FrontendBucketName', {
      value: frontendBucket.bucketName,
      description: 'Upload React build here: aws s3 sync dashboard/dist/ s3://<bucket>/',
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
      description: 'Use for CloudFront cache invalidation after deploy',
    });
  }
}
