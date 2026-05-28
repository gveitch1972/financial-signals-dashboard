import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

export class CertStack extends cdk.Stack {
  readonly certificate: acm.Certificate;

  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const hostedZone = route53.HostedZone.fromLookup(this, 'Zone', {
      domainName: 'grahamveitch.com',
    });

    this.certificate = new acm.Certificate(this, 'Cert', {
      domainName: 'quicksight.grahamveitch.com',
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });
  }
}
