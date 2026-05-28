#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CertStack } from '../lib/cert-stack';
import { DashboardStack } from '../lib/infra-stack';

const app = new cdk.App();

const account = process.env.CDK_DEFAULT_ACCOUNT;

const certStack = new CertStack(app, 'FinSignalsCertStack', {
  env: { account, region: 'us-east-1' },
  crossRegionReferences: true,
});

new DashboardStack(app, 'FinSignalsDashboardStack', {
  env: { account, region: 'eu-west-2' },
  crossRegionReferences: true,
  certificate: certStack.certificate,
});
